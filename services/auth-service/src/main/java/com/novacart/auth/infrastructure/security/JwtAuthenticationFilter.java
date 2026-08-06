package com.novacart.auth.infrastructure.security;

import java.io.IOException;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Independently verifies the JWT even though the Gateway already did — defense in
 * depth (CLAUDE.md §5.4): a service must never be exploitable if reached directly.
 * Doesn't reject on a missing/invalid token; it just leaves the SecurityContext
 * empty, so {@code authenticated()} endpoints 401 naturally via Spring Security.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlocklistService blocklistService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, TokenBlocklistService blocklistService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.blocklistService = blocklistService;
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtTokenProvider.parseAndValidate(token);
                String jti = jwtTokenProvider.jti(claims);

                if (!blocklistService.isBlocklisted(jti)) {
                    String userId = jwtTokenProvider.userId(claims);
                    List<SimpleGrantedAuthority> authorities = jwtTokenProvider.roles(claims).stream()
                        .map(SimpleGrantedAuthority::new)
                        .toList();

                    var authentication = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    request.setAttribute("jti", jti);
                    request.setAttribute("tokenExpiry", claims.getExpiration().toInstant());
                }
            } catch (JwtException | IllegalArgumentException ignored) {
                // Invalid/expired token — leave SecurityContext empty, let the endpoint's
                // own authorization requirement reject it with a proper 401/403.
            }
        }

        filterChain.doFilter(request, response);
    }
}
