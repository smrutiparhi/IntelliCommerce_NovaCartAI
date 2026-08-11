package com.novacart.inventory.listener;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.EventEnvelope;
import com.novacart.common.event.dto.OrderCancelledPayload;
import com.novacart.common.event.dto.OrderPlacedPayload;
import com.novacart.common.event.dto.PaymentFailedPayload;
import com.novacart.common.event.dto.PaymentSuccessfulPayload;
import com.novacart.inventory.inbox.InboxService;
import com.novacart.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventListener {

    private final InventoryService inventoryService;
    private final InboxService inboxService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.placed", groupId = "inventory-service-group")
    public void handleOrderPlaced(String message) {
        try {
            EventEnvelope<OrderPlacedPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                log.info("Duplicate eventId={} ignored by Inventory Service", envelope.eventId());
                return;
            }
            inventoryService.processOrderPlaced(envelope.payload(), envelope.eventId());
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing order.placed message", e);
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topics = "payment.successful", groupId = "inventory-service-group")
    public void handlePaymentSuccessful(String message) {
        try {
            EventEnvelope<PaymentSuccessfulPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                return;
            }
            inventoryService.confirmReservation(envelope.payload().orderId());
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing payment.successful in Inventory Service", e);
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topics = {"payment.failed", "order.cancelled"}, groupId = "inventory-service-group")
    public void handleCompensation(String message) {
        try {
            EventEnvelope<Object> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                return;
            }
            if ("payment.failed".equals(envelope.eventType())) {
                PaymentFailedPayload payload = objectMapper.convertValue(envelope.payload(), PaymentFailedPayload.class);
                inventoryService.releaseReservation(payload.orderId(), "Payment Failed Compensation: " + payload.failureReason());
            } else if ("order.cancelled".equals(envelope.eventType())) {
                OrderCancelledPayload payload = objectMapper.convertValue(envelope.payload(), OrderCancelledPayload.class);
                inventoryService.releaseReservation(payload.orderId(), "Order Cancelled: " + payload.reason());
            }
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing compensation message in Inventory Service", e);
            throw new RuntimeException(e);
        }
    }
}
