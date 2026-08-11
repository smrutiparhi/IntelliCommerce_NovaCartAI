package com.novacart.notification.repository;

import com.novacart.notification.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, String> {
    List<NotificationLog> findByUserIdOrderByCreatedAtDesc(String userId);
    List<NotificationLog> findByOrderId(String orderId);
}
