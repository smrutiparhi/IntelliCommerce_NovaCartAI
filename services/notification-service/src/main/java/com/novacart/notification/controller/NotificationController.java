package com.novacart.notification.controller;

import com.novacart.notification.entity.NotificationLog;
import com.novacart.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationLogRepository repository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationLog>> getByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(repository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<NotificationLog>> getByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(repository.findByOrderId(orderId));
    }
}
