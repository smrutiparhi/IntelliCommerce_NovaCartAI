package com.novacart.common.event.dto;

public record PaymentFailedPayload(
    String orderId,
    String paymentId,
    String failureReason
) {}
