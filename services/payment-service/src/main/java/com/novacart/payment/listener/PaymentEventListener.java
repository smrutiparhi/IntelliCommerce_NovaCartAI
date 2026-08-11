package com.novacart.payment.listener;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.EventEnvelope;
import com.novacart.common.event.dto.StockReservedPayload;
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
            log.info("Stock reserved for orderId={}, payment service ready for checkout", envelope.payload().orderId());
            inboxService.markAsProcessed(envelope.eventId());
        } catch (Exception e) {
            log.error("Error processing inventory.stock-reserved in Payment Service", e);
            throw new RuntimeException(e);
        }
    }
}
