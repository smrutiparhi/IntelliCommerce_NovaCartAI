package com.novacart.inventory.repository;

import com.novacart.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
    Optional<Inventory> findByProductId(String productId);
    List<Inventory> findBySellerIdOrderByUpdatedAtDesc(String sellerId);
}
