package com.novacart.order.inbox;

import com.novacart.order.entity.ProcessedEvent;
import com.novacart.order.repository.OrderInboxRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderInboxIdempotencyTest {

    @Mock
    private OrderInboxRepository inboxRepository;

    @InjectMocks
    private InboxService inboxService;

    @Test
    @DisplayName("Duplicate eventId must be detected as already processed")
    void testDuplicateEventIdDetected() {
        when(inboxRepository.existsByEventId("evt-123")).thenReturn(true);

        boolean isDuplicate = inboxService.isAlreadyProcessed("evt-123");
        assertTrue(isDuplicate, "EventId present in processed_events inbox table must be marked as already processed");
    }

    @Test
    @DisplayName("New eventId must not be flagged as duplicate")
    void testNewEventIdAllowed() {
        when(inboxRepository.existsByEventId("evt-456")).thenReturn(false);

        boolean isDuplicate = inboxService.isAlreadyProcessed("evt-456");
        assertFalse(isDuplicate, "New eventId must not be marked as duplicate");
    }

    @Test
    @DisplayName("Marking as processed inserts eventId into inbox table")
    void testMarkAsProcessed() {
        when(inboxRepository.existsByEventId("evt-789")).thenReturn(false);

        inboxService.markAsProcessed("evt-789");
        verify(inboxRepository, times(1)).save(any(ProcessedEvent.class));
    }
}
