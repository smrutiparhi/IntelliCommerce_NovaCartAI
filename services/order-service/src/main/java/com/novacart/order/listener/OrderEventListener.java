package com.novacart.order.listener;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.EventEnvelope;
import com.novacart.common.event.dto.*;
import com.novacart.order.inbox.InboxService;
import com.novacart.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final OrderService orderService;
    private final InboxService inboxService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "inventory.stock-reserved", groupId = "order-service-group")
    public void handleStockReserved(String message) {
        try {
            EventEnvelope<StockReservedPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                log.info("Duplicate eventId={} ignored by Order Service", envelope.eventId());
                return;
            }
            orderService.handleStockReserved(envelope.payload());
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing inventory.stock-reserved", e);
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topics = "inventory.reservation-failed", groupId = "order-service-group")
    public void handleStockReservationFailed(String message) {
        try {
            EventEnvelope<StockReservationFailedPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                return;
            }
            orderService.handleStockReservationFailed(envelope.payload());
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing inventory.reservation-failed", e);
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topics = "payment.successful", groupId = "order-service-group")
    public void handlePaymentSuccessful(String message) {
        try {
            EventEnvelope<PaymentSuccessfulPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                return;
            }
            orderService.handlePaymentSuccessful(envelope.payload());
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing payment.successful", e);
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topics = "payment.failed", groupId = "order-service-group")
    public void handlePaymentFailed(String message) {
        try {
            EventEnvelope<PaymentFailedPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                return;
            }
            orderService.handlePaymentFailed(envelope.payload());
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing payment.failed", e);
            throw new RuntimeException(e);
        }
    }
}
