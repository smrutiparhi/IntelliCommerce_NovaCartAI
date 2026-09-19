package com.novacart.ai.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.novacart.ai.api.ChatController;
import com.novacart.ai.api.ChatController.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import io.micrometer.core.instrument.MeterRegistry;

import java.util.*;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GroundedAssistantService {
    private final RestClient products;
    private final RestClient orders;
    private final MeterRegistry metrics;
    private final RagService rag;
    private final FeedbackService feedback;
    private final ConversationService conversations;
    private final List<String> policies = List.of(
        "NovaCart offers free delivery on eligible products; the delivery estimate is shown on each listing.",
        "NOVA10 provides 10 percent off eligible orders up to the configured coupon limit.",
        "Customers can cancel orders before shipment; captured payments follow the refund workflow."
    );
    private final Map<String, PendingCancellation> pendingCancellations = new ConcurrentHashMap<>();

    @Autowired
    public GroundedAssistantService(
        @Value("${novacart.product-service-url:http://localhost:8082}") String productUrl,
        @Value("${novacart.order-service-url:http://localhost:8085}") String orderUrl,
        MeterRegistry metrics,
        RagService rag,
        FeedbackService feedback,
        ConversationService conversations) {
        this.products = RestClient.builder().baseUrl(productUrl).build();
        this.orders = RestClient.builder().baseUrl(orderUrl).build();
        this.metrics = metrics;
        this.rag = rag;
        this.feedback = feedback;
        this.conversations = conversations;
    }

    GroundedAssistantService(String productUrl, String orderUrl, MeterRegistry metrics) {
        this.products = RestClient.builder().baseUrl(productUrl).build();
        this.orders = RestClient.builder().baseUrl(orderUrl).build();
        this.metrics = metrics;
        this.rag = null;
        this.feedback = null;
        this.conversations = null;
    }

    public ChatResponse answer(String message, String userId) {
        metrics.counter("novacart.ai.queries", "operation", "chat").increment();
        String query = normaliseQuery(message);
        if (!allowRequest(userId)) return remember(userId, query, new ChatResponse(
            "Nova is receiving too many requests right now. Please try again in a minute.", List.of(), "safety-rate-limit-v1"));
        if (isUnsafe(query)) return remember(userId, query, new ChatResponse(
            "I can help with NovaCart shopping and order questions, but I cannot follow instructions that try to bypass my safety rules.", List.of(), "safety-refusal-v1"));
        Optional<String> trackingOrderId = trackedOrderId(query, userId);
        if (trackingOrderId.isPresent()) {
            String orderId = trackingOrderId.get();
            try {
                JsonNode order = orders.get().uri("/api/v1/orders/" + orderId).header("X-User-Id", userId).retrieve().body(JsonNode.class);
                String status = order == null ? "unknown" : order.path("status").asText("unknown");
                metrics.counter("novacart.ai.tool_calls", "tool", "order-tracking").increment();
                return remember(userId, query, new ChatResponse("Your order " + orderId + " is currently " + status.toLowerCase(Locale.ROOT) + ".", List.of(), "order-tracking-tool-v1"));
            } catch (Exception ignored) {
                return remember(userId, query, new ChatResponse("I could not find that order in your account. Please check the order ID and try again.", List.of(), "order-tracking-tool-v1"));
            }
        }
        if (rag != null) {
            try {
                Optional<RagService.RagAnswer> ragAnswer = rag.answer(query, userId);
                if (ragAnswer.isPresent()) {
                    RagService.RagAnswer grounded = ragAnswer.get();
                    metrics.counter("novacart.ai.grounded_responses").increment();
                    metrics.counter("novacart.ai.retrieval.results").increment(grounded.citations().size());
                    return remember(userId, query, new ChatResponse(grounded.answer(), grounded.citations(), grounded.mode()));
                }
            } catch (Exception ignored) {
                metrics.counter("novacart.ai.rag.fallbacks").increment();
            }
        }
        List<Product> matches = retrieveCatalogue(query);
        metrics.counter("novacart.ai.retrieval.results").increment(matches.size());
        List<ChatController.Citation> citations = matches.stream().map(p -> new ChatController.Citation(p.id(), p.title(), "catalogue/product/" + p.id())).toList();
        String lower = query.toLowerCase(Locale.ROOT);
        String answer;
        if (lower.contains("delivery") || lower.contains("return") || lower.contains("coupon") || lower.contains("cancel")) {
            answer = policyAnswer(lower);
        } else if (matches.isEmpty()) {
            metrics.counter("novacart.ai.retrieval.empty").increment();
            answer = "I could not find a matching NovaCart product in the live catalogue. Try a brand, category, or specific feature.";
        } else {
            metrics.counter("novacart.ai.grounded_responses").increment();
            answer = "I found " + matches.size() + " grounded catalogue match" + (matches.size() == 1 ? "" : "es") + ": " + matches.stream().map(Product::title).limit(3).collect(Collectors.joining(", ")) + ".";
        }
        return remember(userId, query, new ChatResponse(answer, citations, "grounded-catalogue-v1"));
    }

    private ChatResponse remember(String userId, String question, ChatResponse response) {
        if (conversations != null) {
            try { conversations.append(userId, question, response); }
            catch (Exception ignored) { metrics.counter("novacart.ai.conversation.persist.failures").increment(); }
        }
        return response;
    }

    private String normaliseQuery(String message) {
        if (message == null) return "";
        String cleaned = message.replaceAll("[\\p{Cntrl}&&[^\\r\\n\\t]]", " ").trim();
        return cleaned.length() > 500 ? cleaned.substring(0, 500).trim() : cleaned;
    }

    private boolean isUnsafe(String query) {
        String lower = query.toLowerCase(Locale.ROOT);
        return lower.contains("ignore previous instructions") || lower.contains("ignore all instructions")
            || lower.contains("reveal your system prompt") || lower.contains("developer message")
            || lower.contains("bypass safety") || lower.contains("jailbreak");
    }

    private final Map<String, RateWindow> rateWindows = new ConcurrentHashMap<>();
    private boolean allowRequest(String userId) {
        String key = userId == null || userId.isBlank() ? "anonymous" : userId;
        long now = System.currentTimeMillis();
        RateWindow next = rateWindows.compute(key, (ignored, current) -> {
            if (current == null || now - current.startedAt() >= 60_000) return new RateWindow(now, 1);
            return new RateWindow(current.startedAt(), current.requests() + 1);
        });
        boolean allowed = next.requests() <= 30;
        if (!allowed) metrics.counter("novacart.ai.safety.rate_limited").increment();
        return allowed;
    }

    private record RateWindow(long startedAt, int requests) {}

    public CancellationProposal proposeCancellation(String orderId, String userId) {
        metrics.counter("novacart.ai.tool_calls", "tool", "cancel-proposal").increment();
        requireUser(userId);
        if (!isUuid(orderId)) throw new IllegalArgumentException("A valid order ID is required");
        try {
            orders.get().uri("/api/v1/orders/" + orderId).header("X-User-Id", userId).retrieve().toBodilessEntity();
        } catch (Exception ex) {
            throw new IllegalArgumentException("Order was not found in your account");
        }
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(5));
        pendingCancellations.put(token, new PendingCancellation(orderId, userId, expiresAt));
        return new CancellationProposal(token, orderId, expiresAt, "Please confirm cancellation. This confirmation expires in 5 minutes and can only be used once.");
    }

    public CancellationResult confirmCancellation(String token, String userId) {
        metrics.counter("novacart.ai.tool_calls", "tool", "cancel-confirmation").increment();
        requireUser(userId);
        PendingCancellation pending = pendingCancellations.remove(token);
        if (pending == null || pending.expiresAt().isBefore(Instant.now()) || !pending.userId().equals(userId)) {
            throw new IllegalArgumentException("Confirmation is invalid, expired, or belongs to another account");
        }
        orders.post().uri(uri -> uri.path("/api/v1/orders/{id}/cancel").queryParam("reason", "Cancelled by customer via Nova AI").build(pending.orderId()))
            .header("X-User-Id", userId).retrieve().toBodilessEntity();
        return new CancellationResult(pending.orderId(), "CANCELLED", "Order cancellation requested successfully.");
    }

    public Comparison compare(String firstId, String secondId) {
        metrics.counter("novacart.ai.tool_calls", "tool", "comparison").increment();
        Product first = getProduct(firstId);
        Product second = getProduct(secondId);
        if (first == null || second == null) throw new IllegalArgumentException("Both products must exist in the live catalogue");
        return new Comparison("Here is a grounded comparison from the live NovaCart catalogue.",
            List.of(new ComparisonItem(first.id(), first.title(), first.brand(), first.priceInPaise(), first.rating()),
                    new ComparisonItem(second.id(), second.title(), second.brand(), second.priceInPaise(), second.rating())),
            List.of(new ChatController.Citation(first.id(), first.title(), "catalogue/product/" + first.id()),
                    new ChatController.Citation(second.id(), second.title(), "catalogue/product/" + second.id())));
    }

    /**
     * Lightweight semantic retrieval for the catalogue. The product service exposes
     * lexical search, so we fan out over meaningful query terms, merge candidates,
     * and rank them against the complete product text. This keeps retrieval live and
     * grounded while avoiding a second database or an external model dependency.
     */
    private List<Product> retrieveCatalogue(String query) {
        LinkedHashMap<String, Product> candidates = new LinkedHashMap<>();
        fetchCandidates(query, candidates);
        Arrays.stream(query.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
            .filter(token -> token.length() >= 3)
            .distinct().limit(8)
            .forEach(token -> fetchCandidates(token, candidates));
        return candidates.values().stream()
            // Description/tag-only matches are too noisy for short searches.
            // Require at least one meaningful query term in the product title
            // before presenting a result as grounded catalogue evidence.
            .filter(product -> titleMatches(product, query) > 0)
            .sorted(Comparator.comparingDouble((Product p) -> relevance(p, query)).reversed()
                .thenComparing(Product::rating, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(5).toList();
    }

    private void fetchCandidates(String term, Map<String, Product> candidates) {
        try {
            ProductPage page = products.get().uri(uri -> uri.path("/api/v1/products")
                .queryParam("q", term).queryParam("size", 24).build()).retrieve().body(ProductPage.class);
            if (page != null && page.content() != null) page.content().forEach(p -> candidates.putIfAbsent(p.id(), p));
        } catch (Exception ignored) { }
    }

    double relevance(Product product, String query) {
        Set<String> terms = Arrays.stream(query.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
            .filter(token -> token.length() >= 3).collect(Collectors.toSet());
        if (terms.isEmpty()) return 0;
        String title = text(product.title());
        String brand = text(product.brand());
        String searchable = text(String.join(" ", product.categorySlug(), product.description(),
            product.tags() == null ? "" : String.join(" ", product.tags())));
        return terms.stream().mapToDouble(term -> (title.contains(term) ? 5 : 0)
            + (brand.contains(term) ? 4 : 0) + (searchable.contains(term) ? 1 : 0)).sum();
    }

    private long titleMatches(Product product, String query) {
        Set<String> terms = Arrays.stream(query.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
            .filter(token -> token.length() >= 3 && !Set.of("with", "from", "that", "this", "have", "your", "what", "which", "show", "find", "want", "need", "good", "best", "for", "the", "and").contains(token)).collect(Collectors.toCollection(LinkedHashSet::new));
        Set<String> titleTerms = Arrays.stream(text(product.title()).split("[^a-z0-9]+"))
            .filter(token -> token.length() >= 3).collect(Collectors.toSet());
        if (terms.isEmpty()) return 0;
        String headTerm = terms.stream().reduce((first, last) -> last).orElse("");
        return titleTerms.contains(headTerm) ? terms.stream().filter(titleTerms::contains).count() : 0;
    }

    private String text(String value) { return value == null ? "" : value.toLowerCase(Locale.ROOT); }

    String policyAnswer(String query) {
        String lower = query.toLowerCase(Locale.ROOT);
        Set<String> terms = Arrays.stream(lower.split("\\W+"))
            .filter(word -> word.length() >= 4).collect(Collectors.toSet());
        return policies.stream()
            .map(policy -> Map.entry(policy, terms.stream().filter(term -> policy.toLowerCase(Locale.ROOT).contains(term)).count()))
            .filter(match -> match.getValue() > 0)
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("I can help with NovaCart delivery, coupons, returns, and order cancellation policies. Ask about one of those topics.");
    }

    Optional<String> trackedOrderId(String query, String userId) {
        if (userId == null || userId.isBlank() || !query.toLowerCase(Locale.ROOT).matches(".*\\b(order|track|tracking|delivery)\\b.*")) return Optional.empty();
        var matcher = java.util.regex.Pattern.compile("\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\\b").matcher(query);
        return matcher.find() ? Optional.of(matcher.group()) : Optional.empty();
    }

    public AnalyticsSummary analytics(String roles) {
        if (roles == null || !roles.contains("ROLE_ADMIN")) throw new IllegalArgumentException("Administrator role is required");
        double queries = counter("novacart.ai.queries", "operation", "chat");
        double grounded = counter("novacart.ai.grounded_responses");
        double empty = counter("novacart.ai.retrieval.empty");
        double results = counter("novacart.ai.retrieval.results");
        FeedbackService.Summary persistedFeedback = feedback == null
            ? new FeedbackService.Summary(Math.round(counter("novacart.ai.feedback", "rating", "helpful")), Math.round(counter("novacart.ai.feedback", "rating", "not-helpful")))
            : feedback.summary();
        return new AnalyticsSummary(
            Math.round(queries), Math.round(grounded), Math.round(empty),
            Math.round(counter("novacart.ai.tool_calls", "tool", "order-tracking")),
            Math.round(counter("novacart.ai.tool_calls", "tool", "comparison")),
            Math.round(counter("novacart.ai.tool_calls", "tool", "cancel-proposal")),
            Math.round(counter("novacart.ai.tool_calls", "tool", "cancel-confirmation")),
            persistedFeedback.helpful(), persistedFeedback.unhelpful(),
            queries == 0 ? 0 : grounded / queries,
            queries == 0 ? 0 : results / queries
        );
    }

    public void recordFeedback(String messageId, boolean helpful, String userId) {
        requireUser(userId);
        if (messageId == null || messageId.isBlank()) throw new IllegalArgumentException("Message ID is required");
        if (feedback != null) feedback.record(userId, messageId, helpful);
        metrics.counter("novacart.ai.feedback", "rating", helpful ? "helpful" : "not-helpful").increment();
    }

    private double counter(String name, String... tags) {
        var counter = metrics.find(name).tags(tags).counter();
        return counter == null ? 0 : counter.count();
    }

    private Product getProduct(String id) {
        try { return products.get().uri("/api/v1/products/" + id).retrieve().body(Product.class); }
        catch (Exception ex) { return null; }
    }

    private void requireUser(String userId) { if (userId == null || userId.isBlank()) throw new IllegalArgumentException("Authentication is required"); }
    private boolean isUuid(String value) { try { UUID.fromString(value); return true; } catch (Exception ex) { return false; } }

    private record PendingCancellation(String orderId, String userId, Instant expiresAt) {}
    public record CancellationProposal(String confirmationToken, String orderId, Instant expiresAt, String message) {}
    public record CancellationResult(String orderId, String status, String message) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ProductPage(List<Product> content) {}
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Product(String id, String title, String brand, Long priceInPaise, Double rating,
                          String categorySlug, String description, List<String> tags) {}
    public record Comparison(String summary, List<ComparisonItem> products, List<ChatController.Citation> citations) {}
    public record ComparisonItem(String id, String title, String brand, Long priceInPaise, Double rating) {}
    public record AnalyticsSummary(long queries, long groundedResponses, long emptyRetrievals,
                                   long orderTrackingCalls, long comparisonCalls,
                                   long cancellationProposals, long confirmedCancellations,
                                   long helpfulRatings, long unhelpfulRatings,
                                   double groundingRate, double averageRetrievedProducts) {}
}
