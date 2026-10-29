package com.novacart.ai.security;

import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiIdentityFilterTest {
    @Test
    void signedTokenOverridesCallerSuppliedIdentity() throws Exception {
        var keys = KeyPairGenerator.getInstance("RSA");
        keys.initialize(2048);
        var pair = keys.generateKeyPair();
        var filter = new AiIdentityFilter((RSAPublicKey) pair.getPublic());
        String token = Jwts.builder().subject("real-customer").claim("roles", List.of("ROLE_CUSTOMER"))
            .issuedAt(Date.from(Instant.now())).expiration(Date.from(Instant.now().plusSeconds(300)))
            .signWith(pair.getPrivate()).compact();
        var request = new MockHttpServletRequest("POST", "/api/v1/ai/chat");
        request.addHeader("Authorization", "Bearer " + token);
        request.addHeader("X-User-Id", "forged-admin");
        request.addHeader("X-User-Roles", "ROLE_ADMIN");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertNotNull(chain.getRequest());
        assertEquals("real-customer", request.getAttribute("ai.userId"));
        assertEquals("ROLE_CUSTOMER", request.getAttribute("ai.roles"));
    }

    @Test
    void headerOnlyIdentityCannotAccessAi() throws Exception {
        var keys = KeyPairGenerator.getInstance("RSA");
        keys.initialize(2048);
        var filter = new AiIdentityFilter((RSAPublicKey) keys.generateKeyPair().getPublic());
        var request = new MockHttpServletRequest("GET", "/api/v1/ai/rag/status");
        request.addHeader("X-User-Roles", "ROLE_ADMIN");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        assertNull(chain.getRequest());
    }

    @Test
    void tokenSignedByAnotherKeyIsRejected() throws Exception {
        var keys = KeyPairGenerator.getInstance("RSA");
        keys.initialize(2048);
        var trusted = keys.generateKeyPair();
        var untrusted = keys.generateKeyPair();
        String token = Jwts.builder().subject("forged-admin").claim("roles", List.of("ROLE_ADMIN"))
            .expiration(Date.from(Instant.now().plusSeconds(300)))
            .signWith(untrusted.getPrivate()).compact();
        var request = new MockHttpServletRequest("GET", "/api/v1/ai/rag/status");
        request.addHeader("Authorization", "Bearer " + token);
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        new AiIdentityFilter((RSAPublicKey) trusted.getPublic()).doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        assertNull(chain.getRequest());
    }
}
