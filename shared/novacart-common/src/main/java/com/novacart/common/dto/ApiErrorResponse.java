package com.novacart.common.dto;

import java.time.Instant;

/** CLAUDE.md §3.4 error envelope (RFC 7807-aligned), produced by every service's GlobalExceptionHandler. */
public record ApiErrorResponse(
    boolean success,
    ApiErrorDetail error,
    Instant timestamp,
    String traceId
) {
    public static ApiErrorResponse of(ApiErrorDetail error, String traceId) {
        return new ApiErrorResponse(false, error, Instant.now(), traceId);
    }
}
