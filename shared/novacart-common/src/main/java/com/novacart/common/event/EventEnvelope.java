package com.novacart.common.event;

import java.time.Instant;

/**
 * The one event shape used on every Kafka topic (CLAUDE.md §8.2). Schema evolution is
 * additive only — a breaking change means a new {@code eventVersion} and a new
 * {@code .v2} topic, never a mutation of this record.
 */
public record EventEnvelope<T>(
    String eventId,
    String eventType,
    int eventVersion,
    Instant occurredAt,
    String source,
    String traceId,
    String correlationId,
    T payload
) {
}
