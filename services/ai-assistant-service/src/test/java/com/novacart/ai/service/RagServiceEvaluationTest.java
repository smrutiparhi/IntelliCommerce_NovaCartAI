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

    @Test
    void multiwordHeadphoneRequestDoesNotReturnWirelessKeyboardsOrMice() {
        var repository = mock(KnowledgeChunkRepository.class);
        var runs = mock(AgentRunRepository.class);
        var openAi = new OpenAiClient(RestClient.builder(), new ObjectMapper(), "", "https://api.openai.com",
            "gpt-4.1-mini", "text-embedding-3-small");
        var headphones = chunk("headphones", "Bluetooth headphones", "Over-ear audio for travel", openAi);
        var wired = chunk("wired", "Wired headphones", "Over-ear audio with a cable", openAi);
        var keyboard = chunk("keyboard", "Wireless keyboard and mouse set", "Computer input accessories", openAi);
        when(repository.count()).thenReturn(3L);
        when(repository.findAll()).thenReturn(List.of(keyboard, wired, headphones));
        var rag = new RagService(repository, runs, openAi, RestClient.builder(), new SimpleMeterRegistry(), "http://localhost:8082", .1);

        for (String query : List.of("Recommend wireless headphones", "headphones that are wireless")) {
            var results = rag.search(query, 5);
            assertFalse(results.isEmpty(), query);
            assertTrue(results.stream().allMatch(result -> result.chunk().sourceId().equals("headphones")), query);
        }
    }

    @Test
    void geminiResultsKeepCitationsRelevantToTheQuestion() {
        var repository = mock(KnowledgeChunkRepository.class);
        var runs = mock(AgentRunRepository.class);
        var provider = mock(OpenAiClient.class);
        when(provider.enabled()).thenReturn(true);
        when(provider.embeddingModel()).thenReturn("gemini-embedding-001");
        when(provider.embed(anyString())).thenReturn(List.of(1d, 0d));
        var delivery = new KnowledgeChunk("POLICY:delivery", "POLICY", "delivery", "Delivery policy",
            "Free delivery on eligible products", List.of(1d, 0d), "gemini-embedding-001", "policy://delivery", Instant.now());
        var coupon = new KnowledgeChunk("POLICY:coupon", "POLICY", "coupon", "NOVA10 coupon",
            "Ten percent off", List.of(1d, 0d), "gemini-embedding-001", "policy://coupon", Instant.now());
        var cancellation = new KnowledgeChunk("POLICY:cancellation", "POLICY", "cancellation", "Cancellation policy",
            "Cancel before shipment", List.of(1d, 0d), "gemini-embedding-001", "policy://cancellation", Instant.now());
        var wireless = new KnowledgeChunk("PRODUCT:wireless", "PRODUCT", "wireless", "Wireless Bluetooth earphones",
            "Audio product", List.of(1d, 0d), "gemini-embedding-001", "/products/wireless", Instant.now());
        var wired = new KnowledgeChunk("PRODUCT:wired", "PRODUCT", "wired", "Wired headphones",
            "Audio product", List.of(1d, 0d), "gemini-embedding-001", "/products/wired", Instant.now());
        var speaker = new KnowledgeChunk("PRODUCT:speaker", "PRODUCT", "speaker", "Wireless speaker",
            "Audio product", List.of(1d, 0d), "gemini-embedding-001", "/products/speaker", Instant.now());
        when(repository.count()).thenReturn(6L);
        when(repository.findAll()).thenReturn(List.of(coupon, wired, speaker, cancellation, delivery, wireless));
        var rag = new RagService(repository, runs, provider, RestClient.builder(), new SimpleMeterRegistry(),
            "http://localhost:8082", .1);

        assertEquals(List.of("delivery"), rag.search("What is the delivery policy?", 5).stream()
            .map(item -> item.chunk().sourceId()).toList());
        assertEquals(List.of("wireless"), rag.search("Recommend wireless headphones", 5).stream()
            .map(item -> item.chunk().sourceId()).toList());
    }

    private KnowledgeChunk chunk(String id, String title, String content, OpenAiClient openAi) {
        return new KnowledgeChunk("PRODUCT:" + id, "PRODUCT", id, title, content, openAi.embed(content),
            openAi.embeddingModel(), "/products/" + id, Instant.now());
    }
}
