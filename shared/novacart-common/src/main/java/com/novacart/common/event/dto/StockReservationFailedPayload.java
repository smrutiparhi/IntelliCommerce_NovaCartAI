package com.novacart.common.event.dto;

public record StockReservationFailedPayload(
    String orderId,
    String reason
) {}
