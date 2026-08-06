package com.novacart.gateway.config;

import java.util.Objects;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    /**
     * Two distinct resolvers so the global default limiter and the auth-specific
     * stricter limiter don't share a Redis bucket — RedisRateLimiter's key is
     * whatever the KeyResolver returns, nothing else, so an unprefixed IP reused
     * across two RequestRateLimiter filter instances would collide.
     */
    @Bean
    @Primary // framework auto-config needs exactly one unqualified KeyResolver; the
             // route-level YAML still explicitly picks authIpKeyResolver by name for /auth
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(clientIp(exchange.getRequest()));
    }

    @Bean
    public KeyResolver authIpKeyResolver() {
        return exchange -> Mono.just("auth:" + clientIp(exchange.getRequest()));
    }

    private String clientIp(org.springframework.http.server.reactive.ServerHttpRequest request) {
        return Objects.requireNonNull(request.getRemoteAddress()).getAddress().getHostAddress();
    }
}
