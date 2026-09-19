package com.novacart.ai.repository;

import com.novacart.ai.domain.KnowledgeChunk;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface KnowledgeChunkRepository extends MongoRepository<KnowledgeChunk, String> { }
