package com.novacart.ai.repository;

import com.novacart.ai.domain.AiFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AiFeedbackRepository extends MongoRepository<AiFeedback, String> {
    long countByHelpful(boolean helpful);
}
