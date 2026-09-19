package com.novacart.ai.service;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/** Deterministic retrieval-quality checks that do not require Mongo or external APIs. */
class GroundedAssistantServiceEvaluationTest {
    @Test
    void titleAndBrandMatchesRankAboveDescriptionOnlyMatches() {
        var assistant = new GroundedAssistantService("http://localhost:8082", "http://localhost:8085", new SimpleMeterRegistry());

        var titleMatch = new GroundedAssistantService.Product("1", "Sony WH-1000XM5 Headphones", "Sony", 299900L, 4.8,
            "electronics", "Wireless noise cancellation", List.of("audio"));
        var descriptionMatch = new GroundedAssistantService.Product("2", "Studio Wireless Headphones", "Acme", 199900L, 4.5,
            "electronics", "Compatible with sony devices", List.of("audio"));

        double titleScore = assistant.relevance(titleMatch, "sony noise cancelling headphones");
        double descriptionScore = assistant.relevance(descriptionMatch, "sony noise cancelling headphones");
        assertTrue(titleScore > descriptionScore, "title/brand evidence must outrank description-only evidence");
    }

    @Test
    void irrelevantQueryHasNoGroundingEvidence() {
        var assistant = new GroundedAssistantService("http://localhost:8082", "http://localhost:8085", new SimpleMeterRegistry());
        var product = new GroundedAssistantService.Product("1", "Running Shoes", "Nova Sport", 499900L, 4.6,
            "fashion", "Lightweight everyday trainers", List.of("sneakers", "sport"));
        assertEquals(0d, assistant.relevance(product, "quantum telescope"));
    }

    @Test
    void policyAnswersStayInsideApprovedPolicyText() {
        var assistant = new GroundedAssistantService("http://localhost:8082", "http://localhost:8085", new SimpleMeterRegistry());
        assertTrue(assistant.policyAnswer("do you offer delivery?").contains("delivery estimate"));
        assertTrue(assistant.policyAnswer("how does coupon NOVA10 work?").contains("10 percent"));
        assertTrue(assistant.policyAnswer("can I cancel an order?").contains("before shipment"));
    }

    @Test
    void orderTrackingRequiresIdentityKeywordAndValidId() {
        var assistant = new GroundedAssistantService("http://localhost:8082", "http://localhost:8085", new SimpleMeterRegistry());
        String orderId = "e014851f-012a-443a-98dd-4a13b08d6acd";
        assertTrue(assistant.trackedOrderId("track order " + orderId, "customer-1").isPresent());
        assertTrue(assistant.trackedOrderId("track order " + orderId, null).isEmpty());
        assertTrue(assistant.trackedOrderId("hello " + orderId, "customer-1").isEmpty());
        assertTrue(assistant.trackedOrderId("track order 123", "customer-1").isEmpty());
    }

    @Test
    void feedbackAndAnalyticsAreCountedAndAdminProtected() {
        var registry = new SimpleMeterRegistry();
        var assistant = new GroundedAssistantService("http://localhost:8082", "http://localhost:8085", registry);
        registry.counter("novacart.ai.queries", "operation", "chat").increment(4);
        registry.counter("novacart.ai.grounded_responses").increment(3);
        registry.counter("novacart.ai.retrieval.results").increment(10);
        assistant.recordFeedback("answer-1", true, "customer-1");
        assistant.recordFeedback("answer-2", false, "customer-1");

        var summary = assistant.analytics("ROLE_ADMIN");
        assertEquals(4, summary.queries());
        assertEquals(.75, summary.groundingRate());
        assertEquals(2.5, summary.averageRetrievedProducts());
        assertEquals(1, summary.helpfulRatings());
        assertEquals(1, summary.unhelpfulRatings());
        assertThrows(IllegalArgumentException.class, () -> assistant.analytics("ROLE_CUSTOMER"));
        assertThrows(IllegalArgumentException.class, () -> assistant.recordFeedback("answer-3", true, null));
    }
}
