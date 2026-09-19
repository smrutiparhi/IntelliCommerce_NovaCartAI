package com.novacart.ai.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/** Durable, bounded conversation history for the signed-in customer. */
@Document("conversations")
public record Conversation(
    @Id String id,
    String userId,
    List<Message> messages,
    Instant updatedAt
) {
    public record Message(String role, String content, String mode, List<String> citationIds, Instant timestamp) {}
}
