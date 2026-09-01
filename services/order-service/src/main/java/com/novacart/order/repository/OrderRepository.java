package com.novacart.order.repository;

import com.novacart.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
    Page<Order> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Page<Order> findDistinctByItemsSellerIdOrderByCreatedAtDesc(String sellerId, Pageable pageable);
}
