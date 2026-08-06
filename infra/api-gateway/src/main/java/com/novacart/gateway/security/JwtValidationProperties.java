package com.novacart.gateway.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record JwtValidationProperties(String publicKeyPath) {
}
