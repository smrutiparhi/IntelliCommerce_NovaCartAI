package com.novacart.payment.listener;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.EventEnvelope;
import com.novacart.common.event.dto.StockReservedPayload;
import com.novacart.common.event.dto.OrderCancelledPayload;
import com.novacart.payment.inbox.InboxService;
import com.novacart.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final PaymentService paymentService;
    private final InboxService inboxService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "inventory.stock-reserved", groupId = "payment-service-group")
    public void handleStockReserved(String message) {
        try {
            EventEnvelope<StockReservedPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) {
                log.info("Duplicate eventId={} ignored by Payment Service", envelope.eventId());
                return;
            }
            StockReservedPayload payload = envelope.payload();
            paymentService.initializePayment(payload.orderId(), payload.userId(), payload.totalAmountPaise(), payload.currency());
            log.info("Stock reserved and payment initialized for orderId={}", payload.orderId());
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing inventory.stock-reserved in Payment Service", e);
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topics = "order.cancelled", groupId = "payment-service-refund-group")
    public void handleOrderCancelled(String message) {
        try {
            EventEnvelope<OrderCancelledPayload> envelope = objectMapper.readValue(message, new TypeReference<>() {});
            if (inboxService.isAlreadyProcessed(envelope.eventId())) return;
            paymentService.refundCapturedPayment(envelope.payload().orderId(), envelope.payload().reason());
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing order.cancelled in Payment Service", e);
            throw new RuntimeException(e);
        }
    }
}
