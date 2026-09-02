package com.novacart.order.dto;

import com.novacart.order.entity.FulfillmentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateFulfillmentRequest(@NotNull FulfillmentStatus status) {
}
