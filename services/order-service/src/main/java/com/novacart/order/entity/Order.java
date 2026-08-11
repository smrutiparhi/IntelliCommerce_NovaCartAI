package com.novacart.order.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_orders_user_id", columnList = "userId"),
    @Index(name = "idx_orders_order_number", columnList = "orderNumber", unique = true),
    @Index(name = "idx_orders_idempotency_key", columnList = "idempotencyKey", unique = true),
    @Index(name = "idx_orders_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String orderNumber;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String shippingAddressJson;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    private Long subtotalPaise;

    @Column(nullable = false)
    private Long shippingFeePaise;

    @Column(nullable = false)
    private Long discountPaise;

    @Column(nullable = false)
    private Long taxPaise;

    @Column(nullable = false)
    private Long totalPaise;

    @Builder.Default
    @Column(nullable = false)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SagaState sagaState;

    private String couponCode;

    private String paymentId;

    @Column(nullable = false, unique = true)
    private String idempotencyKey;

    @Version
    private Long version;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) this.status = OrderStatus.PENDING;
        if (this.sagaState == null) this.sagaState = SagaState.ORDER_PLACED;
        if (this.currency == null) this.currency = "INR";
        if (this.shippingFeePaise == null) this.shippingFeePaise = 0L;
        if (this.discountPaise == null) this.discountPaise = 0L;
        if (this.taxPaise == null) this.taxPaise = 0L;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
