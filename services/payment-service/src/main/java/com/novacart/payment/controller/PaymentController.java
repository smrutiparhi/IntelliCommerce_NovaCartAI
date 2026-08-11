package com.novacart.payment.controller;

import com.novacart.payment.dto.ApplyCouponRequest;
import com.novacart.payment.dto.ProcessPaymentRequest;
import com.novacart.payment.entity.Payment;
import com.novacart.payment.repository.PaymentRepository;
import com.novacart.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        Payment processed = paymentService.processPayment(request);
        return ResponseEntity.ok(processed);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signatureHeader) {
        
        if (signatureHeader == null || signatureHeader.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing X-Razorpay-Signature header");
        }

        boolean isValid = paymentService.processRazorpayWebhook(rawPayload, signatureHeader);
        if (isValid) {
            return ResponseEntity.ok("Webhook processed successfully");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }
    }

    @PostMapping("/coupons/apply")
    public ResponseEntity<Map<String, Object>> applyCoupon(@Valid @RequestBody ApplyCouponRequest request) {
        long discountPaise = paymentService.calculateDiscount(request);
        return ResponseEntity.ok(Map.of(
            "code", request.code(),
            "discountPaise", discountPaise,
            "finalAmountPaise", Math.max(0, request.orderAmountPaise() - discountPaise)
        ));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable String orderId) {
        return paymentRepository.findByOrderId(orderId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
