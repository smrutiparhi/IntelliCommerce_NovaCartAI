package com.novacart.product.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;

public record ProductRequest(
    @NotBlank String title,
    @NotBlank String brand,
    @NotBlank String categorySlug,
    @Positive long priceInPaise,
    @PositiveOrZero Long originalPriceInPaise,
    @NotBlank String description,
    @NotEmpty List<@NotBlank String> images,
    List<String> tags,
    String badge,
    String delivery,
    Boolean active
) {}
