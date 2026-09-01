package com.novacart.common.event.dto;

import java.time.Instant;
import java.util.List;

public record StockReservedPayload(
    String orderId,
    String reservationId,
    List<ReservedItemPayload> items,
    Instant expiresAt,
    String userId,
    long totalAmountPaise,
    String currency
) {
    public StockReservedPayload(String orderId, String reservationId, List<ReservedItemPayload> items, Instant expiresAt) {
        this(orderId, reservationId, items, expiresAt, null, 0L, "INR");
    }

    public record ReservedItemPayload(
        String productId,
        int quantity
    ) {}
}
