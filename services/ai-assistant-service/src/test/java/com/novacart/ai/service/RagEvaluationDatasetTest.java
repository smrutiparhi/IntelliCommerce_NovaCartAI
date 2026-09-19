package com.novacart.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.ai.domain.KnowledgeChunk;
import com.novacart.ai.repository.AgentRunRepository;
import com.novacart.ai.repository.KnowledgeChunkRepository;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.io.InputStream;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Small deterministic regression set for grounding, policy retrieval, and no-answer behavior. */
class RagEvaluationDatasetTest {
    record Case(String query, String expectedSource, int minimumEvidence) {}

    @Test
    void evaluationDatasetMaintainsGroundingAndNoAnswerBehavior() throws Exception {
        List<Case> cases;
        try (InputStream stream = getClass().getResourceAsStream("/rag-evaluation.json")) {
            assertNotNull(stream);
            cases = new ObjectMapper().readValue(stream, new TypeReference<>() {});
        }
        var chunks = mock(KnowledgeChunkRepository.class);
        var runs = mock(AgentRunRepository.class);
        var openAi = new OpenAiClient(RestClient.builder(), new ObjectMapper(), "", "https://api.openai.com", "gpt-4.1-mini", "text-embedding-3-small");
        when(chunks.count()).thenReturn(4L);
        when(chunks.findAll()).thenReturn(List.of(
            chunk("headphones", "Wireless travel headphones", "Bluetooth headphones with noise cancellation for travel", openAi),
            chunk("delivery", "Delivery policy", "NovaCart offers free delivery on eligible products.", openAi),
            chunk("coupon-nova10", "NOVA10 coupon", "NOVA10 provides 10 percent off eligible orders.", openAi),
            chunk("camera", "Camera tripod", "A stable camera tripod for photography.", openAi)));
        var rag = new RagService(chunks, runs, openAi, RestClient.builder(), new SimpleMeterRegistry(), "http://localhost:8082", .1);

        for (Case testCase : cases) {
            var results = rag.search(testCase.query(), 5);
            assertEquals(testCase.minimumEvidence() == 0 ? 0 : 1, results.isEmpty() ? 0 : 1, testCase.query());
            if (testCase.expectedSource() != null) assertEquals(testCase.expectedSource(), results.getFirst().chunk().sourceId(), testCase.query());
        }
    }

    private KnowledgeChunk chunk(String id, String title, String content, OpenAiClient openAi) {
        String sourceType = id.equals("delivery") || id.startsWith("coupon-") ? "POLICY" : "PRODUCT";
        String source = sourceType.equals("POLICY") ? "policy://" + id : "/products/" + id;
        return new KnowledgeChunk(sourceType + ":" + id, sourceType, id, title, content, openAi.embed(content), openAi.embeddingModel(), source, Instant.now());
    }
}
