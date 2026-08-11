package com.novacart.order.repository;

import com.novacart.order.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderInboxRepository extends JpaRepository<ProcessedEvent, String> {
    boolean existsByEventId(String eventId);
}
