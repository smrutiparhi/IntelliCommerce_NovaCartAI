package com.novacart.common.event.dto;

import java.time.Instant;
import java.util.List;

public record StockReservedPayload(
    String orderId,
    String reservationId,
    List<ReservedItemPayload> items,
    Instant expiresAt
) {
    public record ReservedItemPayload(
        String productId,
        int quantity
    ) {}
}
