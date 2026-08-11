package com.novacart.inventory.repository;

import com.novacart.inventory.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryInboxRepository extends JpaRepository<ProcessedEvent, String> {
    boolean existsByEventId(String eventId);
}
