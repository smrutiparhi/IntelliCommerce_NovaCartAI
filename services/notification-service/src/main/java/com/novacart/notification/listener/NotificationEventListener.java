package com.novacart.notification.listener;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.EventEnvelope;
import com.novacart.common.event.dto.*;
import com.novacart.notification.entity.NotificationLog;
import com.novacart.notification.inbox.InboxService;
import com.novacart.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationLogRepository notificationLogRepository;
    private final InboxService inboxService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.placed", groupId = "notification-service-group")
    @Transactional
    public void handleOrderPlaced(String message) {
        try {
            EventEnvelope<OrderPlacedPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                return;
            }
            OrderPlacedPayload p = envelope.payload();
            saveNotification(p.userId(), p.orderId(), "ORDER_PLACED", "EMAIL",
                "Order Placed: " + p.orderNumber(),
                "Your order " + p.orderNumber() + " has been placed successfully for total amount ₹" + (p.totalAmountPaise() / 100.0));
            
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing order.placed in Notification Service", e);
        }
    }

    @KafkaListener(topics = "payment.successful", groupId = "notification-service-group")
    @Transactional
    public void handlePaymentSuccessful(String message) {
        try {
            EventEnvelope<PaymentSuccessfulPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                return;
            }
            PaymentSuccessfulPayload p = envelope.payload();
            saveNotification("user_system", p.orderId(), "ORDER_CONFIRMED", "EMAIL",
                "Payment Confirmed for Order " + p.orderId(),
                "Payment of ₹" + (p.amountPaise() / 100.0) + " received via " + p.paymentMethod() + ". Razorpay ID: " + p.razorpayPaymentId());

            saveNotification("user_system", p.orderId(), "ORDER_CONFIRMED", "SMS",
                "SMS Alert",
                "NovaCart: Order " + p.orderId() + " is confirmed and preparing for shipping.");

            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing payment.successful in Notification Service", e);
        }
    }

    @KafkaListener(topics = "payment.failed", groupId = "notification-service-group")
    @Transactional
    public void handlePaymentFailed(String message) {
        try {
            EventEnvelope<PaymentFailedPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                return;
            }
            PaymentFailedPayload p = envelope.payload();
            saveNotification("user_system", p.orderId(), "PAYMENT_FAILED", "EMAIL",
                "Payment Failed for Order " + p.orderId(),
                "Unfortunately, your payment failed. Reason: " + p.failureReason() + ". Any reserved items have been released.");

            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing payment.failed in Notification Service", e);
        }
    }

    @KafkaListener(topics = "order.cancelled", groupId = "notification-service-group")
    @Transactional
    public void handleOrderCancelled(String message) {
        try {
            EventEnvelope<OrderCancelledPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                return;
            }
            OrderCancelledPayload p = envelope.payload();
            saveNotification(p.userId(), p.orderId(), "ORDER_CANCELLED", "EMAIL",
                "Order Cancelled: " + p.orderNumber(),
                "Order " + p.orderNumber() + " has been cancelled. Reason: " + p.reason());

            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing order.cancelled in Notification Service", e);
        }
    }

    private void saveNotification(String userId, String orderId, String type, String channel, String subject, String body) {
        NotificationLog notif = NotificationLog.builder()
            .userId(userId)
            .orderId(orderId)
            .type(type)
            .channel(channel)
            .subject(subject)
            .messageBody(body)
            .status("LOGGED")
            .build();
        notificationLogRepository.save(notif);
        log.info("[SIMULATION LOG] [{}] [{}] User: {}, Order: {}, Subject: {}", channel, type, userId, orderId, subject);
    }
}
