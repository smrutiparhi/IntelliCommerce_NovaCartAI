package com.novacart.order.repository;

import com.novacart.order.entity.OutboxMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderOutboxRepository extends JpaRepository<OutboxMessage, String> {
    List<OutboxMessage> findTop50ByPublishedFalseOrderByCreatedAtAsc();
}
