package com.novacart.auth.infrastructure;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.novacart.auth.domain.PasswordResetToken;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}
