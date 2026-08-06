package com.novacart.common.dto;

import java.time.Instant;

/** CLAUDE.md §3.4 success envelope. {@code meta} is null for non-paginated responses. */
public record ApiSuccessResponse<T>(
    boolean success,
    T data,
    ApiMeta meta,
    Instant timestamp,
    String traceId
) {
    public static <T> ApiSuccessResponse<T> of(T data, String traceId) {
        return new ApiSuccessResponse<>(true, data, null, Instant.now(), traceId);
    }

    public static <T> ApiSuccessResponse<T> of(T data, ApiMeta meta, String traceId) {
        return new ApiSuccessResponse<>(true, data, meta, Instant.now(), traceId);
    }
}
