package com.novacart.ai.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;

/** Verifies AI callers independently of the gateway and derives identity from the signed token. */
@Component
public class AiIdentityFilter extends OncePerRequestFilter {
    private final RSAPublicKey publicKey;

    @Autowired
    public AiIdentityFilter(@Value("${novacart.jwt.public-key-path}") String publicKeyPath) {
        this(loadPublicKey(publicKeyPath));
    }

    AiIdentityFilter(RSAPublicKey publicKey) { this.publicKey = publicKey; }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/v1/ai/") || path.equals("/api/v1/ai/rag/product-updated");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "A valid access token is required");
            return;
        }

        try {
            Claims claims = Jwts.parser().verifyWith(publicKey).build()
                .parseSignedClaims(authorization.substring(7)).getPayload();
            String userId = claims.getSubject();
            Object claimRoles = claims.get("roles");
            if (userId == null || userId.isBlank() || !(claimRoles instanceof List<?> roles)
                || roles.stream().anyMatch(role -> !(role instanceof String))) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid access token claims");
                return;
            }
            request.setAttribute("ai.userId", userId);
            request.setAttribute("ai.roles", String.join(",", roles.stream().map(String.class::cast).toList()));
            chain.doFilter(request, response);
        } catch (JwtException | IllegalArgumentException ex) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired access token");
        }
    }

    private static RSAPublicKey loadPublicKey(String path) {
        try {
            String pem = Files.readString(Path.of(path));
            String encoded = pem.replaceAll("-----BEGIN (.*)-----", "")
                .replaceAll("-----END (.*)-----", "").replaceAll("\\s", "");
            return (RSAPublicKey) KeyFactory.getInstance("RSA")
                .generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(encoded)));
        } catch (Exception ex) {
            throw new IllegalStateException("Could not load AI JWT public key at " + path, ex);
        }
    }
}
