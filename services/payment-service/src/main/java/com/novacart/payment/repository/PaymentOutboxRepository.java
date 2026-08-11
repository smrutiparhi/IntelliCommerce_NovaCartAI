package com.novacart.payment.repository;

import com.novacart.payment.entity.OutboxMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentOutboxRepository extends JpaRepository<OutboxMessage, String> {
    List<OutboxMessage> findTop50ByPublishedFalseOrderByCreatedAtAsc();
}
