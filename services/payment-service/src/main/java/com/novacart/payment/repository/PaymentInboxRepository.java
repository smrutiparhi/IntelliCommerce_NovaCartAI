package com.novacart.payment.repository;

import com.novacart.payment.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentInboxRepository extends JpaRepository<ProcessedEvent, String> {
    boolean existsByEventId(String eventId);
}
