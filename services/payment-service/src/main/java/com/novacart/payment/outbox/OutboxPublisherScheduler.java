package com.novacart.payment.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.payment.entity.OutboxMessage;
import com.novacart.payment.repository.PaymentOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisherScheduler {

    private final PaymentOutboxRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelay = 1000)
    @Transactional
    public void publishOutboxMessages() {
        List<OutboxMessage> pendingMessages = outboxRepository.findTop50ByPublishedFalseOrderByCreatedAtAsc();
        if (pendingMessages.isEmpty()) {
            return;
        }

        log.info("Found {} pending outbox messages in Payment Service to publish", pendingMessages.size());
        for (OutboxMessage message : pendingMessages) {
            try {
                // The payload is already JSON. Sending the Java String directly through
                // JsonSerializer would put a quoted JSON string on the Kafka topic.
                kafkaTemplate.send(
                        message.getEventType(),
                        message.getAggregateId(),
                        objectMapper.readTree(message.getPayload()))
                    .get(10, TimeUnit.SECONDS);
                message.setPublished(true);
                message.setPublishedAt(Instant.now());
                outboxRepository.save(message);
                log.debug("Successfully published outbox event {} to topic {}", message.getId(), message.getEventType());
            } catch (Exception e) {
                log.error("Exception sending outbox event id={}", message.getId(), e);
            }
        }
    }
}
