package com.novacart.common.event.dto;

public record PaymentSuccessfulPayload(
    String orderId,
    String paymentId,
    String razorpayOrderId,
    String razorpayPaymentId,
    long amountPaise,
    String currency,
    String paymentMethod
) {}
