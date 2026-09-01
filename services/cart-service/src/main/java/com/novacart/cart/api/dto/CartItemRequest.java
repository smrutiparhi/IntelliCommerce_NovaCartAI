package com.novacart.cart.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record CartItemRequest(@NotBlank String productId, @Min(1) @Max(10) int quantity) {}
