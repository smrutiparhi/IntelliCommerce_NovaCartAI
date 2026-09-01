package com.novacart.product.api.dto;

import java.time.Instant;
import java.util.List;

public record ProductResponse(String id, String slug, String sellerId, String title, String brand,
    String categorySlug, long priceInPaise, Long originalPriceInPaise, String description,
    List<String> images, List<String> tags, String badge, String delivery, double rating,
    long reviewCount, boolean active, Instant createdAt, Instant updatedAt) {}
