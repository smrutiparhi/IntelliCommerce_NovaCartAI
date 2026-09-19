package com.novacart.ai.repository;

import com.novacart.ai.domain.AgentRun;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AgentRunRepository extends MongoRepository<AgentRun, String> { }
