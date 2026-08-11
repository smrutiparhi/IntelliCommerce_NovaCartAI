package com.novacart.common.event.dto;

public record OrderConfirmedPayload(
    String orderId,
    String orderNumber,
    String userId,
    long totalAmountPaise
) {}
