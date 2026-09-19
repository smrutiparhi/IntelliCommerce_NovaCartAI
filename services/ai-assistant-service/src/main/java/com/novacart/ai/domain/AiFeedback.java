package com.novacart.ai.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("ai_feedback")
public record AiFeedback(
    @Id String id,
    @Indexed String userId,
    String messageId,
    boolean helpful,
    Instant updatedAt
) {}
