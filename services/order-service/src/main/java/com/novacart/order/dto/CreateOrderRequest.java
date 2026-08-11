package com.novacart.order.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateOrderRequest(
    @NotNull String userId,
    @NotEmpty List<OrderItemRequest> items,
    @NotNull String shippingAddressJson,
    String couponCode,
    @NotNull String idempotencyKey
) {
    public record OrderItemRequest(
        @NotNull String productId,
        @NotNull String productName,
        String productImage,
        String sellerId,
        @NotNull Long unitPricePaise,
        @NotNull Integer quantity
    ) {}
}
