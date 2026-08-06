package com.novacart.auth.application;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.novacart.auth.api.dto.LoginRequest;
import com.novacart.auth.api.dto.RegisterRequest;
import com.novacart.auth.domain.Role;
import com.novacart.auth.domain.User;
import com.novacart.auth.domain.exception.EmailAlreadyExistsException;
import com.novacart.auth.domain.exception.InvalidCredentialsException;
import com.novacart.auth.domain.exception.InvalidTokenException;
import com.novacart.auth.domain.exception.SelfServiceAdminException;
import com.novacart.auth.domain.exception.UserNotFoundException;
import com.novacart.auth.infrastructure.PasswordResetTokenRepository;
import com.novacart.auth.infrastructure.RefreshTokenRepository;
import com.novacart.auth.infrastructure.UserRepository;
import com.novacart.auth.infrastructure.security.JwtTokenProvider;
import com.novacart.auth.infrastructure.security.TokenBlocklistService;
import com.novacart.auth.domain.PasswordResetToken;
import com.novacart.auth.domain.RefreshToken;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final long PASSWORD_RESET_TOKEN_MINUTES = 15;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlocklistService blocklistService;

    public AuthService(
        UserRepository userRepository,
        RefreshTokenRepository refreshTokenRepository,
        PasswordResetTokenRepository passwordResetTokenRepository,
        PasswordEncoder passwordEncoder,
        JwtTokenProvider jwtTokenProvider,
        TokenBlocklistService blocklistService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.blocklistService = blocklistService;
    }

    public AuthResult register(RegisterRequest request) {
        if (request.role() == Role.ROLE_ADMIN) {
            throw new SelfServiceAdminException();
        }
        String email = request.email().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        User user = User.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode(request.password()))
            .fullName(request.fullName())
            .roles(Set.of(request.role()))
            .active(true)
            .emailVerified(false)
            .build();
        user = userRepository.save(user);

        return issueTokens(user, UUID.randomUUID().toString());
    }

    public AuthResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase())
            .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return issueTokens(user, UUID.randomUUID().toString());
    }

    /** Rotation with reuse detection: a revoked token being presented again revokes its whole family. */
    public AuthResult refresh(String rawRefreshToken) {
        String hash = jwtTokenProvider.hash(rawRefreshToken);
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash)
            .orElseThrow(() -> new InvalidTokenException("Refresh token is invalid"));

        if (existing.isRevoked()) {
            log.warn("Refresh token reuse detected for family {} — revoking entire family", existing.getFamilyId());
            revokeFamily(existing.getFamilyId());
            throw new InvalidTokenException("Refresh token has already been used — session revoked, please log in again");
        }

        if (existing.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException("Refresh token has expired");
        }

        User user = userRepository.findById(existing.getUserId())
            .orElseThrow(() -> new UserNotFoundException(existing.getUserId()));

        AuthResult result = issueTokens(user, existing.getFamilyId());

        existing.setRevoked(true);
        existing.setRevokedAt(Instant.now());
        existing.setReplacedByTokenHash(jwtTokenProvider.hash(result.rawRefreshToken()));
        refreshTokenRepository.save(existing);

        return result;
    }

    public void logout(String jti, Instant accessTokenExpiry, String rawRefreshToken) {
        if (jti != null && accessTokenExpiry != null) {
            blocklistService.blocklist(jti, accessTokenExpiry);
        }
        if (rawRefreshToken != null) {
            refreshTokenRepository.findByTokenHash(jwtTokenProvider.hash(rawRefreshToken))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    token.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(token);
                });
        }
    }

    public void forgotPassword(String email) {
        userRepository.findByEmail(email.toLowerCase()).ifPresent(user -> {
            String rawToken = jwtTokenProvider.generateOpaqueRefreshToken();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                .userId(user.getId())
                .tokenHash(jwtTokenProvider.hash(rawToken))
                .expiresAt(Instant.now().plusSeconds(PASSWORD_RESET_TOKEN_MINUTES * 60))
                .used(false)
                .build();
            passwordResetTokenRepository.save(resetToken);

            // Notification service is a logged-simulation stub for now (DEFERRED.md) —
            // this log line IS the "email" until real sending exists. Never log a raw
            // token once real email delivery replaces this.
            log.info("[DEV] Password reset requested for {} — reset link token: {}", user.getEmail(), rawToken);
        });
        // Same response whether or not the email exists — don't leak account existence.
    }

    public void resetPassword(String rawToken, String newPassword) {
        String hash = jwtTokenProvider.hash(rawToken);
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hash)
            .filter(t -> !t.isUsed())
            .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
            .orElseThrow(() -> new InvalidTokenException("Reset link is invalid or has expired"));

        User user = userRepository.findById(resetToken.getUserId())
            .orElseThrow(() -> new UserNotFoundException(resetToken.getUserId()));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Password reset invalidates every existing session, not just the current one.
        refreshTokenRepository.findByUserIdAndRevokedFalse(user.getId())
            .forEach(token -> {
                token.setRevoked(true);
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            });
    }

    private AuthResult issueTokens(User user, String familyId) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String rawRefreshToken = jwtTokenProvider.generateOpaqueRefreshToken();

        RefreshToken refreshToken = RefreshToken.builder()
            .userId(user.getId())
            .tokenHash(jwtTokenProvider.hash(rawRefreshToken))
            .familyId(familyId)
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(jwtTokenProvider.refreshTokenValiditySeconds()))
            .revoked(false)
            .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResult(user, accessToken, rawRefreshToken, jwtTokenProvider.refreshTokenValiditySeconds());
    }

    private void revokeFamily(String familyId) {
        refreshTokenRepository.findByFamilyId(familyId).forEach(token -> {
            token.setRevoked(true);
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }
}
