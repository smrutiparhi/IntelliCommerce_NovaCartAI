package com.novacart.payment.outbox;

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

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisherScheduler {

    private final PaymentOutboxRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

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
                kafkaTemplate.send(message.getEventType(), message.getAggregateId(), message.getPayload())
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.debug("Successfully published outbox event {} to topic {}", message.getId(), message.getEventType());
                        } else {
                            log.error("Failed to publish outbox message id={}", message.getId(), ex);
                        }
                    });
                message.setPublished(true);
                message.setPublishedAt(Instant.now());
                outboxRepository.save(message);
            } catch (Exception e) {
                log.error("Exception sending outbox event id={}", message.getId(), e);
            }
        }
    }
}
