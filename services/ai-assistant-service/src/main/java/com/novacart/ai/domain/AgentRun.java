package com.novacart.ai.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("agent_runs")
public record AgentRun(
    @Id String id,
    @Indexed String userId,
    String query,
    String mode,
    int citationsCount,
    long latencyMs,
    String outcome,
    Instant createdAt
) {}
