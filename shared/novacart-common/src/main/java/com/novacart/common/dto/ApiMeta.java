package com.novacart.common.dto;

/** Pagination metadata attached to the top-level response envelope, not to {@code data}. */
public record ApiMeta(
    int page,
    int size,
    long totalElements,
    int totalPages
) {
}
