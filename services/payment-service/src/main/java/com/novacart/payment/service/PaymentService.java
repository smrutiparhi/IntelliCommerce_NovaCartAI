package com.novacart.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.EventEnvelope;
import com.novacart.common.event.dto.PaymentFailedPayload;
import com.novacart.common.event.dto.PaymentSuccessfulPayload;
import com.novacart.payment.dto.ApplyCouponRequest;
import com.novacart.payment.dto.ProcessPaymentRequest;
import com.novacart.payment.entity.*;
import com.novacart.payment.repository.CouponRepository;
import com.novacart.payment.repository.PaymentOutboxRepository;
import com.novacart.payment.repository.PaymentRepository;
import com.novacart.payment.repository.RefundRepository;
import com.novacart.payment.util.RazorpaySignatureUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final CouponRepository couponRepository;
    private final PaymentOutboxRepository outboxRepository;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Value("${razorpay.key-secret:mockKeySecret67890}")
    private String razorpaySecret;

    @Value("${razorpay.key-id:rzp_test_mockKeyId12345}")
    private String razorpayKeyId;

    @Value("${razorpay.allow-simulation:true}")
    private boolean allowSimulation;

    @Value("${razorpay.webhook-secret:mockWebhookSecret13579}")
    private String webhookSecret;

    @Transactional
    public Payment initializePayment(String orderId, String userId, long amountPaise, String currency) {
        Optional<Payment> existingOpt = paymentRepository.findByOrderId(orderId);
        if (existingOpt.isPresent()) {
            return existingOpt.get();
        }

        String razorpayOrderId = createRazorpayOrder(orderId, amountPaise, currency);

        Payment payment = Payment.builder()
            .orderId(orderId)
            .userId(userId)
            .razorpayOrderId(razorpayOrderId)
            .amountPaise(amountPaise)
            .currency(currency == null || currency.isBlank() ? "INR" : currency)
            .status(PaymentStatus.CREATED)
            .signatureVerified(false)
            .idempotencyKey(UUID.randomUUID().toString())
            .build();

        log.info("Initialized payment for orderId={}, razorpayOrderId={}", orderId, razorpayOrderId);
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment processPayment(ProcessPaymentRequest request, String authenticatedUserId) {
        Payment payment = paymentRepository.findByOrderId(request.orderId())
            .orElseThrow(() -> new IllegalStateException("Payment is not ready. Stock must be reserved first."));

        if (!payment.getUserId().equals(authenticatedUserId)) {
            throw new IllegalArgumentException("Payment not found");
        }

        // Simulation flag or Signature Check
        boolean isSignatureValid = false;
        if (request.razorpaySignature() != null && !request.razorpaySignature().isBlank()) {
            String payload = payment.getRazorpayOrderId() + "|" + request.razorpayPaymentId();
            isSignatureValid = RazorpaySignatureUtils.verifySignature(payload, request.razorpaySignature(), razorpaySecret);
        } else {
            // Only permit the local mock flow when explicitly configured. Live mode
            // always requires Razorpay's signed checkout response.
            isSignatureValid = allowSimulation && isMockConfiguration() && !request.shouldFail();
        }

        if (request.shouldFail() || !isSignatureValid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setSignatureVerified(false);
            payment.setFailureReason(request.shouldFail() ? "Card declined by bank" : "Invalid signature verification");
            Payment saved = paymentRepository.save(payment);

            PaymentFailedPayload failedPayload = new PaymentFailedPayload(
                saved.getOrderId(), saved.getId(), saved.getFailureReason()
            );
            saveOutboxEvent(saved.getOrderId(), "payment.failed", failedPayload);
            log.warn("Payment failed for orderId={}, reason={}", request.orderId(), saved.getFailureReason());
            return saved;
        }

        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setRazorpayPaymentId(request.razorpayPaymentId() != null ? request.razorpayPaymentId() : "pay_mock_" + UUID.randomUUID().toString().substring(0, 8));
        payment.setSignatureVerified(true);
        payment.setWebhookVerifiedAt(Instant.now());
        Payment saved = paymentRepository.save(payment);

        PaymentSuccessfulPayload successfulPayload = new PaymentSuccessfulPayload(
            saved.getOrderId(),
            saved.getId(),
            saved.getRazorpayOrderId(),
            saved.getRazorpayPaymentId(),
            saved.getAmountPaise(),
            saved.getCurrency(),
            "CARD"
        );

        saveOutboxEvent(saved.getOrderId(), "payment.successful", successfulPayload);
        log.info("Payment captured successfully for orderId={}", request.orderId());
        return saved;
    }

    @Transactional
    public boolean processRazorpayWebhook(String rawPayload, String signatureHeader) {
        if (!RazorpaySignatureUtils.verifySignature(rawPayload, signatureHeader, webhookSecret)) {
            log.error("SECURITY ALERT: Invalid Razorpay webhook signature header! Rejecting payload.");
            return false;
        }

        try {
            var root = objectMapper.readTree(rawPayload);
            String event = root.path("event").asText("");
            var entity = root.path("payload").path("payment").path("entity");
            String razorpayOrderId = entity.path("order_id").asText("");
            String razorpayPaymentId = entity.path("id").asText("");
            if (razorpayOrderId.isBlank()) {
                log.info("Ignoring verified Razorpay webhook without an order id: {}", event);
                return true;
            }
            Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
            if (paymentOpt.isEmpty()) return true;
            Payment payment = paymentOpt.get();
            // Webhooks are retried by Razorpay; applying a terminal state twice is safe.
            if ("payment.captured".equals(event) || "order.paid".equals(event)) {
                if (payment.getStatus() != PaymentStatus.REFUNDED) payment.setStatus(PaymentStatus.CAPTURED);
                if (!razorpayPaymentId.isBlank()) payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.setSignatureVerified(true);
                payment.setWebhookVerifiedAt(Instant.now());
                paymentRepository.save(payment);
            } else if ("payment.failed".equals(event) && payment.getStatus() != PaymentStatus.CAPTURED && payment.getStatus() != PaymentStatus.REFUNDED) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason(entity.path("error_description").asText("Razorpay payment failed"));
                payment.setWebhookVerifiedAt(Instant.now());
                paymentRepository.save(payment);
            }
            log.info("Razorpay webhook processed event={}, orderId={}", event, payment.getOrderId());
            return true;
        } catch (Exception ex) {
            log.error("Verified Razorpay webhook payload was invalid", ex);
            return false;
        }
    }

    public String getRazorpayKeyId() { return razorpayKeyId; }

    public boolean isLiveRazorpayConfigured() { return !isMockConfiguration(); }

    private String createRazorpayOrder(String orderId, long amountPaise, String currency) {
        if (isMockConfiguration()) {
            if (!allowSimulation) throw new IllegalStateException("Razorpay credentials are not configured");
            return "order_rzp_" + UUID.randomUUID().toString().substring(0, 8);
        }
        try {
            String auth = Base64.getEncoder().encodeToString((razorpayKeyId + ":" + razorpaySecret).getBytes(StandardCharsets.UTF_8));
            String body = objectMapper.writeValueAsString(Map.of("amount", amountPaise, "currency", currency == null || currency.isBlank() ? "INR" : currency, "receipt", orderId));
            HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.razorpay.com/v1/orders"))
                .header("Authorization", "Basic " + auth).header("Content-Type", "application/json")
                .timeout(java.time.Duration.ofSeconds(10)).POST(HttpRequest.BodyPublishers.ofString(body)).build();
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.error("Razorpay order creation failed status={} body={}", response.statusCode(), response.body());
                throw new IllegalStateException("Razorpay order creation failed");
            }
            String id = objectMapper.readTree(response.body()).path("id").asText();
            if (id.isBlank()) throw new IllegalStateException("Razorpay returned no order id");
            return id;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Razorpay order creation interrupted", ex);
        } catch (Exception ex) {
            throw new IllegalStateException("Razorpay order creation failed", ex);
        }
    }

    private boolean isMockConfiguration() {
        return razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeyId.contains("mock") || razorpaySecret == null || razorpaySecret.isBlank() || razorpaySecret.contains("mock");
    }

    @Transactional
    public void refundCapturedPayment(String orderId, String reason) {
        paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
            if (payment.getStatus() != PaymentStatus.CAPTURED) return;
            if (!refundRepository.findByPaymentId(payment.getId()).isEmpty()) return;
            String refundId = createRazorpayRefund(payment);
            refundRepository.save(Refund.builder()
                .paymentId(payment.getId()).orderId(orderId).amountPaise(payment.getAmountPaise())
                .reason(reason).status("PROCESSED")
                .razorpayRefundId(refundId).build());
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
            log.info("Payment refunded for cancelled orderId={}", orderId);
        });
    }

    private String createRazorpayRefund(Payment payment) {
        if (isMockConfiguration()) return "rfnd_mock_" + UUID.randomUUID().toString().substring(0, 8);
        if (payment.getRazorpayPaymentId() == null || payment.getRazorpayPaymentId().isBlank()) {
            throw new IllegalStateException("Cannot refund without a Razorpay payment id");
        }
        try {
            String auth = Base64.getEncoder().encodeToString((razorpayKeyId + ":" + razorpaySecret).getBytes(StandardCharsets.UTF_8));
            String body = objectMapper.writeValueAsString(Map.of("amount", payment.getAmountPaise()));
            HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.razorpay.com/v1/payments/" + payment.getRazorpayPaymentId() + "/refund"))
                .header("Authorization", "Basic " + auth).header("Content-Type", "application/json")
                .timeout(java.time.Duration.ofSeconds(10)).POST(HttpRequest.BodyPublishers.ofString(body)).build();
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.error("Razorpay refund failed status={} body={}", response.statusCode(), response.body());
                throw new IllegalStateException("Razorpay refund failed");
            }
            String id = objectMapper.readTree(response.body()).path("id").asText();
            if (id.isBlank()) throw new IllegalStateException("Razorpay returned no refund id");
            return id;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Razorpay refund interrupted", ex);
        } catch (Exception ex) {
            throw new IllegalStateException("Razorpay refund failed", ex);
        }
    }

    public long calculateDiscount(ApplyCouponRequest request) {
        String normalizedCode = request.code().trim().toUpperCase();
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(normalizedCode)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive coupon code"));

        Instant now = Instant.now();
        if ((coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom()))
                || (coupon.getValidTo() != null && now.isAfter(coupon.getValidTo()))
                || (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit())) {
            throw new IllegalArgumentException("Coupon is no longer available");
        }

        if (request.orderAmountPaise() < (coupon.getMinOrderValuePaise() != null ? coupon.getMinOrderValuePaise() : 0L)) {
            throw new IllegalArgumentException("Minimum order value not met for coupon " + normalizedCode);
        }

        long discount = 0L;
        if (coupon.getType() == DiscountType.PERCENT) {
            discount = (request.orderAmountPaise() * coupon.getValue()) / 100;
            if (coupon.getMaxDiscountPaise() != null && discount > coupon.getMaxDiscountPaise()) {
                discount = coupon.getMaxDiscountPaise();
            }
        } else if (coupon.getType() == DiscountType.FIXED) {
            discount = coupon.getValue();
        }
        return Math.min(discount, request.orderAmountPaise());
    }

    private void saveOutboxEvent(String aggregateId, String eventType, Object payload) {
        try {
            EventEnvelope<Object> envelope = new EventEnvelope<>(
                UUID.randomUUID().toString(),
                eventType,
                1,
                Instant.now(),
                "payment-service",
                UUID.randomUUID().toString(),
                aggregateId,
                payload
            );
            String jsonPayload = objectMapper.writeValueAsString(envelope);
            OutboxMessage outbox = OutboxMessage.builder()
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(jsonPayload)
                .published(false)
                .build();
            outboxRepository.save(outbox);
        } catch (Exception e) {
            log.error("Error creating outbox event for aggregateId={}", aggregateId, e);
            throw new RuntimeException("Outbox error", e);
        }
    }
}
