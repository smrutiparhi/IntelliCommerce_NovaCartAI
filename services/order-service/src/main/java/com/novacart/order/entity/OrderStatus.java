package com.novacart.order.entity;

public enum OrderStatus {
    PENDING,
    AWAITING_PAYMENT,
    CONFIRMED,
    CANCELLED,
    SHIPPED,
    DELIVERED
}
