package com.novacart.order.entity;

public enum SagaState {
    ORDER_PLACED,
    STOCK_RESERVED,
    STOCK_RESERVATION_FAILED,
    PAYMENT_SUCCESSFUL,
    PAYMENT_FAILED,
    ORDER_CONFIRMED,
    ORDER_CANCELLED
}
