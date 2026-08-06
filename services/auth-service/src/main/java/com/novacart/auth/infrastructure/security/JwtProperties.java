package com.novacart.auth.infrastructure.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
    String privateKeyPath,
    String publicKeyPath,
    long accessTokenMinutes,
    long refreshTokenDays
) {
}
