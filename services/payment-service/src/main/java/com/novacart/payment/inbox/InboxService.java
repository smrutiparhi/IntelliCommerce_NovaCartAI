package com.novacart.payment.inbox;

import com.novacart.payment.entity.ProcessedEvent;
import com.novacart.payment.repository.PaymentInboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class InboxService {

    private final PaymentInboxRepository inboxRepository;

    @Transactional(readOnly = true)
    public boolean isAlreadyProcessed(String eventId) {
        if (eventId == null || eventId.isBlank()) {
            return false;
        }
        return inboxRepository.existsByEventId(eventId);
    }

    @Transactional
    public void markAsProcessed(String eventId) {
        if (eventId == null || eventId.isBlank()) {
            return;
        }
        if (!inboxRepository.existsByEventId(eventId)) {
            ProcessedEvent event = ProcessedEvent.builder()
                .eventId(eventId)
                .consumedAt(Instant.now())
                .build();
            inboxRepository.save(event);
            log.debug("Marked eventId={} as processed in Payment Inbox", eventId);
        }
    }
}
