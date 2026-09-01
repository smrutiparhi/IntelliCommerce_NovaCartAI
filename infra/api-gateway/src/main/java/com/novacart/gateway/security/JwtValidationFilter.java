package com.novacart.gateway.security;

import java.nio.charset.StandardCharsets;
import java.security.interfaces.RSAPublicKey;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.dto.ApiErrorDetail;
import com.novacart.common.dto.ApiErrorResponse;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import reactor.core.publisher.Mono;

/**
 * CLAUDE.md §5.4: signature + expiry + Redis-revocation check, then injects
 * X-User-Id/X-User-Roles downstream. Public auth endpoints are exempt — they're how
 * you get a token in the first place. Downstream services still independently
 * re-verify (defense in depth) rather than blindly trusting these headers.
 */
@Component
@EnableConfigurationProperties(JwtValidationProperties.class)
public class JwtValidationFilter implements GlobalFilter, Ordered {

    private static final Set<String> PUBLIC_PATHS = Set.of(
        "/api/v1/auth/register",
        "/api/v1/auth/login",
        "/api/v1/auth/refresh",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password"
    );

    private final RSAPublicKey publicKey;
    private final ReactiveStringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public JwtValidationFilter(
        JwtValidationProperties properties,
        ReactiveStringRedisTemplate redisTemplate,
        ObjectMapper objectMapper
    ) {
        this.publicKey = PublicKeyLoader.load(properties.publicKeyPath());
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (PUBLIC_PATHS.contains(path) || isPublicCatalogueRead(request.getMethod(), path)) {
            return chain.filter(exchange);
        }

        String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing or malformed Authorization header");
        }

        Claims claims;
        try {
            claims = Jwts.parser().verifyWith(publicKey).build()
                .parseSignedClaims(header.substring(7))
                .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            return unauthorized(exchange, "Token is invalid or has expired");
        }

        String jti = claims.getId();
        return redisTemplate.hasKey("jwt:blocklist:" + jti)
            .flatMap(blocklisted -> {
                if (Boolean.TRUE.equals(blocklisted)) {
                    return unauthorized(exchange, "Token has been revoked");
                }

                @SuppressWarnings("unchecked")
                List<String> roles = claims.get("roles", List.class);

                ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id", claims.getSubject())
                    .header("X-User-Roles", String.join(",", roles))
                    .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            });
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 1; // after TraceIdFilter, before routing
    }

    private boolean isPublicCatalogueRead(HttpMethod method, String path) {
        if (!HttpMethod.GET.equals(method)) return false;
        boolean publicProductPath = (path.equals("/api/v1/products") || path.startsWith("/api/v1/products/"))
            && !path.equals("/api/v1/products/seller") && !path.startsWith("/api/v1/products/seller/");
        boolean publicInventoryPath = path.equals("/api/v1/inventory/availability") || path.startsWith("/api/v1/inventory/product/");
        return publicProductPath || publicInventoryPath || path.equals("/api/v1/categories") || path.startsWith("/api/v1/categories/");
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String traceId = exchange.getRequest().getHeaders().getFirst("X-Trace-Id");
        ApiErrorDetail detail = new ApiErrorDetail("UNAUTHENTICATED", message, "https://novacart.ai/errors/unauthenticated");
        ApiErrorResponse body = ApiErrorResponse.of(detail, traceId != null ? traceId : UUID.randomUUID().toString());

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(body);
        } catch (Exception e) {
            bytes = ("{\"success\":false}").getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }
}
