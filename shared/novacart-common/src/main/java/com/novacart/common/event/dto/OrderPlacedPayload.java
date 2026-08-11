package com.novacart.common.event.dto;

import java.util.List;

public record OrderPlacedPayload(
    String orderId,
    String orderNumber,
    String userId,
    List<OrderItemPayload> items,
    long totalAmountPaise,
    String currency,
    String idempotencyKey
) {
    public record OrderItemPayload(
        String productId,
        String productName,
        String sellerId,
        long unitPricePaise,
        int quantity,
        long subtotalPaise
    ) {}
}
