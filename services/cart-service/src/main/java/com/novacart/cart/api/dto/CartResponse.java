package com.novacart.cart.api.dto;

import java.util.List;

public record CartResponse(List<Item> items, int itemCount) {
    public record Item(String productId, int quantity) {}
}
