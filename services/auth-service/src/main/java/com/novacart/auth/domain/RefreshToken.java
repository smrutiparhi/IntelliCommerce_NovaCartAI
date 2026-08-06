package com.novacart.auth.domain;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Never stores the raw token — only its hash. {@code familyId} links every token
 * issued from one original login through each rotation; reuse of an already-rotated
 * (revoked) token invalidates the whole family (CLAUDE.md §9 reuse detection).
 */
@Document(collection = "refresh_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed(unique = true)
    private String tokenHash;

    private String familyId;

    private Instant issuedAt;
    private Instant expiresAt;

    @Builder.Default
    private boolean revoked = false;

    private Instant revokedAt;
    private String replacedByTokenHash;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
