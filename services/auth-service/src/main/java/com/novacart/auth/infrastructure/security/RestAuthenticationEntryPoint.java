package com.novacart.auth.infrastructure.security;

import java.io.IOException;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.dto.ApiErrorDetail;
import com.novacart.common.dto.ApiErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Without this, Spring Security's default behaviour for a missing/invalid/blocklisted
 * token on an {@code authenticated()} endpoint is an empty-bodied 403 — wrong per
 * CLAUDE.md §3.4 (401 = unauthenticated, 403 = unauthorised) and doesn't match the
 * standard error envelope either. This makes both correct.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
        throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String traceId = request.getHeader("X-Trace-Id");
        ApiErrorDetail detail = new ApiErrorDetail(
            "UNAUTHENTICATED",
            "Authentication is required and has either not been provided or is no longer valid",
            "https://novacart.ai/errors/unauthenticated"
        );
        ApiErrorResponse body = ApiErrorResponse.of(detail, traceId != null ? traceId : UUID.randomUUID().toString());

        objectMapper.writeValue(response.getWriter(), body);
    }
}
