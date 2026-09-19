package com.novacart.ai.service;

import com.novacart.ai.domain.AiFeedback;
import com.novacart.ai.repository.AiFeedbackRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;

@Service
public class FeedbackService {
    private final AiFeedbackRepository feedback;

    public FeedbackService(AiFeedbackRepository feedback) { this.feedback = feedback; }

    public void record(String userId, String messageId, boolean helpful) {
        String id = UUID.nameUUIDFromBytes((userId + ":" + messageId).getBytes(StandardCharsets.UTF_8)).toString();
        feedback.save(new AiFeedback(id, userId, messageId, helpful, Instant.now()));
    }

    public Summary summary() { return new Summary(feedback.countByHelpful(true), feedback.countByHelpful(false)); }

    public record Summary(long helpful, long unhelpful) {}
}
