package com.novacart.ai.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document("knowledge_chunks")
@CompoundIndex(name = "source_unique", def = "{'sourceType': 1, 'sourceId': 1}", unique = true)
public record KnowledgeChunk(
    @Id String id,
    String sourceType,
    String sourceId,
    String title,
    String content,
    List<Double> embedding,
    String embeddingModel,
    String url,
    Instant updatedAt
) {}
