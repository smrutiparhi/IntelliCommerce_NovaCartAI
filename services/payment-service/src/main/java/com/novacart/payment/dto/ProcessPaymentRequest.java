package com.novacart.payment.dto;

import jakarta.validation.constraints.NotNull;

public record ProcessPaymentRequest(
    @NotNull String orderId,
    @NotNull String userId,
    @NotNull Long amountPaise,
    String razorpayPaymentId,
    String razorpaySignature,
    boolean shouldFail // Flag for simulating test compensation paths
) {}
