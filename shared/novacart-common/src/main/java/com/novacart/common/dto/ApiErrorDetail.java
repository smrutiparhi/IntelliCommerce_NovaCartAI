package com.novacart.common.dto;

import java.util.List;

/**
 * {@code code} is SCREAMING_SNAKE_CASE and enumerated per-service in docs/API.md — this
 * module doesn't own a shared error-code enum, since error codes are domain-specific.
 */
public record ApiErrorDetail(
    String code,
    String message,
    String type,
    List<ApiFieldError> fieldErrors
) {
    public ApiErrorDetail(String code, String message, String type) {
        this(code, message, type, null);
    }
}
