package com.novacart.auth.api;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import com.novacart.auth.api.dto.AuthResponse;
import com.novacart.auth.api.dto.ForgotPasswordRequest;
import com.novacart.auth.api.dto.LoginRequest;
import com.novacart.auth.api.dto.RegisterRequest;
import com.novacart.auth.api.dto.ResetPasswordRequest;
import com.novacart.auth.application.AuthResult;
import com.novacart.auth.application.AuthService;
import com.novacart.common.dto.ApiSuccessResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    private final AuthService authService;
    private final UserMapper userMapper;
    private final boolean cookieSecure;

    public AuthController(
        AuthService authService,
        UserMapper userMapper,
        @Value("${app.cookie.secure:false}") boolean cookieSecure
    ) {
        this.authService = authService;
        this.userMapper = userMapper;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiSuccessResponse<AuthResponse>> register(
        @Valid @RequestBody RegisterRequest request,
        WebRequest webRequest
    ) {
        AuthResult result = authService.register(request);
        return withAuthResponse(result, HttpStatus.CREATED, webRequest);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiSuccessResponse<AuthResponse>> login(
        @Valid @RequestBody LoginRequest request,
        WebRequest webRequest
    ) {
        AuthResult result = authService.login(request);
        return withAuthResponse(result, HttpStatus.OK, webRequest);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiSuccessResponse<AuthResponse>> refresh(
        @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken,
        WebRequest webRequest
    ) {
        if (refreshToken == null) {
            throw new com.novacart.auth.domain.exception.InvalidTokenException("No refresh token cookie present");
        }
        AuthResult result = authService.refresh(refreshToken);
        return withAuthResponse(result, HttpStatus.OK, webRequest);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
        HttpServletRequest request,
        @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken
    ) {
        String jti = (String) request.getAttribute("jti");
        Instant tokenExpiry = (Instant) request.getAttribute("tokenExpiry");
        authService.logout(jti, tokenExpiry, refreshToken);

        ResponseCookie clearCookie = buildRefreshCookie("", 0);
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
            .build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiSuccessResponse<Void>> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request,
        WebRequest webRequest
    ) {
        authService.forgotPassword(request.email());
        return ResponseEntity.ok(ApiSuccessResponse.of(null, traceIdOf(webRequest)));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiSuccessResponse<Void>> resetPassword(
        @Valid @RequestBody ResetPasswordRequest request,
        WebRequest webRequest
    ) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiSuccessResponse.of(null, traceIdOf(webRequest)));
    }

    private ResponseEntity<ApiSuccessResponse<AuthResponse>> withAuthResponse(
        AuthResult result,
        HttpStatus status,
        WebRequest webRequest
    ) {
        AuthResponse body = new AuthResponse(userMapper.toResponse(result.user()), result.accessToken());
        ResponseCookie cookie = buildRefreshCookie(result.rawRefreshToken(), result.refreshTokenValiditySeconds());

        return ResponseEntity.status(status)
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(ApiSuccessResponse.of(body, traceIdOf(webRequest)));
    }

    private ResponseCookie buildRefreshCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, value)
            .httpOnly(true)
            .secure(cookieSecure) // true in production (HTTPS) — CLAUDE.md §9; false only for local plain-HTTP dev
            .sameSite("Lax")
            .path("/api/v1/auth")
            .maxAge(maxAgeSeconds)
            .build();
    }

    private String traceIdOf(WebRequest webRequest) {
        String traceId = webRequest.getHeader("X-Trace-Id");
        return traceId != null ? traceId : UUID.randomUUID().toString();
    }
}
