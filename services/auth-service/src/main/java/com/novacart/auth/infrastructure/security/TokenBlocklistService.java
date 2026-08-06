package com.novacart.auth.infrastructure.security;

import java.time.Duration;
import java.time.Instant;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** Logout blocklists the access token's jti until it would have naturally expired anyway. */
@Service
public class TokenBlocklistService {

    private static final String KEY_PREFIX = "jwt:blocklist:";

    private final StringRedisTemplate redisTemplate;

    public TokenBlocklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void blocklist(String jti, Instant expiresAt) {
        Duration ttl = Duration.between(Instant.now(), expiresAt);
        if (ttl.isPositive()) {
            redisTemplate.opsForValue().set(KEY_PREFIX + jti, "1", ttl);
        }
    }

    public boolean isBlocklisted(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(KEY_PREFIX + jti));
    }
}
