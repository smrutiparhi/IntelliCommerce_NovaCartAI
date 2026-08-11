package com.novacart.notification.repository;

import com.novacart.notification.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationInboxRepository extends JpaRepository<ProcessedEvent, String> {
    boolean existsByEventId(String eventId);
}
