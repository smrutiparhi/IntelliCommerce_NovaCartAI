package com.novacart.common.event.dto;

public record InventoryUpdatedPayload(
    String productId,
    int availableQuantity,
    int reservedQuantity
) {}
