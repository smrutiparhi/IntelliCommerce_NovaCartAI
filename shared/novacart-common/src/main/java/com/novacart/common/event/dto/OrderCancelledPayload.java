package com.novacart.common.event.dto;

public record OrderCancelledPayload(
    String orderId,
    String orderNumber,
    String userId,
    String reason
) {}
