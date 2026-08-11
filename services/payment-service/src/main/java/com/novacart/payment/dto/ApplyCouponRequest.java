package com.novacart.payment.dto;

import jakarta.validation.constraints.NotNull;

public record ApplyCouponRequest(
    @NotNull String code,
    @NotNull Long orderAmountPaise
) {}
