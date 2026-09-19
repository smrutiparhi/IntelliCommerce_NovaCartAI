package com.novacart.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.ai.domain.KnowledgeChunk;
import com.novacart.ai.repository.KnowledgeChunkRepository;
import com.novacart.ai.repository.AgentRunRepository;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RagServiceEvaluationTest {
    @Test
    void localFallbackRequiresLexicalEvidenceAndRanksRelevantTitleFirst() {
        var repository = mock(KnowledgeChunkRepository.class);
        var runs = mock(AgentRunRepository.class);
        var openAi = new OpenAiClient(RestClient.builder(), new ObjectMapper(), "", "https://api.openai.com",
            "gpt-4.1-mini", "text-embedding-3-small");
        var headphones = chunk("headphones", "Wireless travel headphones", "Bluetooth headphones with noise cancellation", openAi);
        var camera = chunk("camera", "Rear camera bracket", "Metal mounting bracket for a vehicle camera", openAi);
        when(repository.count()).thenReturn(2L);
        when(repository.findAll()).thenReturn(List.of(camera, headphones));
        var rag = new RagService(repository, runs, openAi, RestClient.builder(), new SimpleMeterRegistry(), "http://localhost:8082", .1);

        var results = rag.search("comfortable wireless headphones for travel", 5);
        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
        assertEquals("headphones", results.getFirst().chunk().sourceId());
        assertTrue(results.stream().noneMatch(result -> result.chunk().sourceId().equals("camera")));
    }

    @Test
    void localEmbeddingsAreDeterministicAndNormalized() {
        var openAi = new OpenAiClient(RestClient.builder(), new ObjectMapper(), "", "https://api.openai.com",
            "gpt-4.1-mini", "text-embedding-3-small");
        var first = openAi.embed("wireless headphones");
        var second = openAi.embed("wireless headphones");
        assertEquals(first, second);
        double norm = Math.sqrt(first.stream().mapToDouble(value -> value * value).sum());
        assertEquals(1d, norm, 1e-9);
        assertEquals("local-hash-v1", openAi.embeddingModel());
    }

    @Test
    void localFallbackRejectsDescriptionOnlyProductMatches() {
        var repository = mock(KnowledgeChunkRepository.class);
        var runs = mock(AgentRunRepository.class);
        var openAi = new OpenAiClient(RestClient.builder(), new ObjectMapper(), "", "https://api.openai.com",
            "gpt-4.1-mini", "text-embedding-3-small");
        var unrelated = chunk("shorts", "Linen blend shorts", "A purple jacket is shown in the product styling guide", openAi);
        when(repository.count()).thenReturn(1L);
        when(repository.findAll()).thenReturn(List.of(unrelated));
        var rag = new RagService(repository, runs, openAi, RestClient.builder(), new SimpleMeterRegistry(), "http://localhost:8082", .1);

        assertTrue(rag.search("purple jacket", 5).isEmpty());
    }

    private KnowledgeChunk chunk(String id, String title, String content, OpenAiClient openAi) {
        return new KnowledgeChunk("PRODUCT:" + id, "PRODUCT", id, title, content, openAi.embed(content),
            openAi.embeddingModel(), "/products/" + id, Instant.now());
    }
}
