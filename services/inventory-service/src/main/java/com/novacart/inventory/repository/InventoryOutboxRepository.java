package com.novacart.inventory.repository;

import com.novacart.inventory.entity.OutboxMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryOutboxRepository extends JpaRepository<OutboxMessage, String> {
    List<OutboxMessage> findTop50ByPublishedFalseOrderByCreatedAtAsc();
}
