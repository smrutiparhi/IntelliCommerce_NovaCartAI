package com.novacart.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GeminiClientTest {
    @Test
    void aiStudioKeyUsesGeminiEmbeddingsAndChatCompletions() {
        var builder = RestClient.builder();
        var server = MockRestServiceServer.bindTo(builder).build();
        var client = new OpenAiClient(builder, new ObjectMapper(), "openai-test-key", "https://api.openai.com",
            "gpt-4.1-mini", "text-embedding-3-small", "gemini-test-key",
            "https://generativelanguage.googleapis.com", "gemini-3.8-flash", "gemini-embedding-001");

        assertEquals("gemini", client.provider());
        assertEquals("gemini-embedding-001", client.embeddingModel());
        assertEquals("gemini-3.8-flash", client.responseModel());

        server.expect(once(), requestTo("https://generativelanguage.googleapis.com/v1beta/openai/embeddings"))
            .andExpect(header("Authorization", "Bearer gemini-test-key"))
            .andRespond(withSuccess("{" +
                "\"data\":[{\"embedding\":[0.1,0.2]},{\"index\":1,\"embedding\":[0.3,0.4]}]}",
                MediaType.APPLICATION_JSON));
        server.expect(once(), requestTo("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"))
            .andExpect(header("Authorization", "Bearer gemini-test-key"))
            .andRespond(withSuccess("{\"choices\":[{\"message\":{\"content\":\"Grounded answer\"}}]}", MediaType.APPLICATION_JSON));

        assertEquals(List.of(List.of(0.1, 0.2), List.of(0.3, 0.4)), client.embedAll(List.of("first", "second")));
        assertEquals("Grounded answer", client.generate("question", "verified context").orElseThrow());
        server.verify();
    }
}
