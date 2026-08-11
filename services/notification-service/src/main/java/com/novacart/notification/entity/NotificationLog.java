package com.novacart.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "notification_logs", indexes = {
    @Index(name = "idx_notification_user_id", columnList = "userId"),
    @Index(name = "idx_notification_order_id", columnList = "orderId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    private String orderId;

    @Column(nullable = false)
    private String type; // e.g. ORDER_CONFIRMED, ORDER_CANCELLED, PAYMENT_FAILED

    @Column(nullable = false)
    private String channel; // EMAIL, SMS

    private String recipient;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String messageBody;

    @Builder.Default
    @Column(nullable = false)
    private String status = "LOGGED";

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = "LOGGED";
    }
}
