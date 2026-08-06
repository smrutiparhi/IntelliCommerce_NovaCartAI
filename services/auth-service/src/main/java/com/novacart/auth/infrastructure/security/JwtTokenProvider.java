package com.novacart.auth.infrastructure.security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;

import com.novacart.auth.domain.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

/**
 * RS256 (not HS256) — services verify with the public key and never hold the signing
 * key (CLAUDE.md §9). Refresh tokens are opaque random strings, not JWTs: their
 * metadata (userId, familyId, expiry, revocation) already lives in Mongo keyed by
 * hash, so a self-contained signed token would just be redundant.
 */
@Component
@EnableConfigurationProperties(JwtProperties.class)
public class JwtTokenProvider {

    private final RSAPrivateKey privateKey;
    private final RSAPublicKey publicKey;
    private final JwtProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();

    public JwtTokenProvider(JwtProperties properties) {
        this.properties = properties;
        this.privateKey = RsaKeyLoader.loadPrivateKey(properties.privateKeyPath());
        this.publicKey = RsaKeyLoader.loadPublicKey(properties.publicKeyPath());
    }

    public RSAPublicKey publicKey() {
        return publicKey;
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(properties.accessTokenMinutes() * 60);

        return Jwts.builder()
            .subject(user.getId())
            .id(UUID.randomUUID().toString())
            .claim("email", user.getEmail())
            .claim("roles", user.getRoles().stream().map(Enum::name).toList())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(privateKey)
            .compact();
    }

    /** Throws {@link ExpiredJwtException} or another {@link JwtException} subtype on failure — both unchecked. */
    public Claims parseAndValidate(String token) {
        return Jwts.parser()
            .verifyWith(publicKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String userId(Claims claims) {
        return claims.getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> roles(Claims claims) {
        return claims.get("roles", List.class);
    }

    public String jti(Claims claims) {
        return claims.getId();
    }

    /** Opaque, high-entropy — never a JWT. Returned to the client once, stored only as a hash. */
    public String generateOpaqueRefreshToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public long refreshTokenValiditySeconds() {
        return properties.refreshTokenDays() * 24 * 60 * 60;
    }

    public long accessTokenValiditySeconds() {
        return properties.accessTokenMinutes() * 60;
    }

    public String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
