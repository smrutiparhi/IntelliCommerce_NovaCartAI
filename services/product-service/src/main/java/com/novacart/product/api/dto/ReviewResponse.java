package com.novacart.product.api.dto;

import java.time.Instant;

public record ReviewResponse(String id, String productId, String userId, String customerName, int rating,
                             String title, String comment, boolean verifiedPurchase, Instant updatedAt) {}
