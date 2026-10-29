package com.novacart.ai.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.novacart.ai.api.ChatController;
import com.novacart.ai.domain.KnowledgeChunk;
import com.novacart.ai.repository.KnowledgeChunkRepository;
import com.novacart.ai.repository.AgentRunRepository;
import com.novacart.ai.domain.AgentRun;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class RagService {
    private static final List<Draft> POLICIES = List.of(
        new Draft("POLICY", "delivery", "Delivery policy", "NovaCart offers free delivery on eligible products. The delivery estimate is shown on each product listing.", "policy://delivery"),
        new Draft("POLICY", "coupon-nova10", "NOVA10 coupon", "NOVA10 provides 10 percent off eligible orders up to the configured coupon limit.", "policy://coupon/NOVA10"),
        new Draft("POLICY", "cancellation", "Cancellation policy", "Customers can cancel orders before shipment. Captured payments follow the refund workflow.", "policy://cancellation")
    );

    private final KnowledgeChunkRepository chunks;
    private final OpenAiClient openAi;
    private final AgentRunRepository runs;
    private final RestClient products;
    private final MeterRegistry metrics;
    private final double minimumScore;
    private final double noAnswerScore;
    private final AtomicBoolean indexing = new AtomicBoolean();
    private volatile Instant lastIndexedAt;
    private volatile String lastError;

    public RagService(KnowledgeChunkRepository chunks, AgentRunRepository runs, OpenAiClient openAi, RestClient.Builder builder,
        MeterRegistry metrics,
        @Value("${novacart.product-service-url:http://localhost:8082}") String productUrl,
        @Value("${novacart.rag.minimum-score:0.18}") double minimumScore) {
        this(chunks, runs, openAi, builder, metrics, productUrl, minimumScore, .24);
    }

    @Autowired
    public RagService(KnowledgeChunkRepository chunks, AgentRunRepository runs, OpenAiClient openAi, RestClient.Builder builder,
        MeterRegistry metrics, @Value("${novacart.product-service-url:http://localhost:8082}") String productUrl,
        @Value("${novacart.rag.minimum-score:0.18}") double minimumScore,
        @Value("${novacart.rag.no-answer-score:0.24}") double noAnswerScore) {
        this.chunks = chunks;
        this.runs = runs;
        this.openAi = openAi;
        this.products = builder.baseUrl(productUrl).build();
        this.metrics = metrics;
        this.minimumScore = minimumScore;
        this.noAnswerScore = noAnswerScore;
    }

    @Scheduled(initialDelayString = "${novacart.rag.initial-delay-ms:30000}", fixedDelayString = "${novacart.rag.refresh-ms:900000}")
    public void scheduledRefresh() {
        try { refresh(); }
        catch (Exception ex) { lastError = ex.getMessage(); metrics.counter("novacart.ai.rag.index.failures").increment(); }
    }

    public IndexStatus refresh() {
        if (!indexing.compareAndSet(false, true)) return status();
        long started = System.nanoTime();
        try {
            List<Draft> drafts = new ArrayList<>(POLICIES);
            ProductPage first = productPage(0);
            if (first != null && first.content() != null) drafts.addAll(first.content().stream().map(this::productDraft).toList());
            int totalPages = first == null ? 0 : Math.min(first.totalPages(), 20);
            for (int page = 1; page < totalPages; page++) {
                ProductPage next = productPage(page);
                if (next != null && next.content() != null) drafts.addAll(next.content().stream().map(this::productDraft).toList());
            }
            drafts = chunkDrafts(drafts);
            Map<String, KnowledgeChunk> existing = chunks.findAll().stream()
                .collect(Collectors.toMap(KnowledgeChunk::id, chunk -> chunk));
            List<Draft> changed = drafts.stream().filter(draft -> {
                KnowledgeChunk old = existing.get(draft.sourceType() + ":" + draft.sourceId());
                return old == null || !Objects.equals(old.content(), draft.content())
                    || !Objects.equals(old.embeddingModel(), openAi.embeddingModel()) || old.embedding() == null;
            }).toList();
            List<List<Double>> newEmbeddings = openAi.embedAll(changed.stream().map(Draft::content).toList());
            Map<String, List<Double>> embeddingById = new HashMap<>();
            for (int i = 0; i < changed.size(); i++) {
                Draft draft = changed.get(i);
                embeddingById.put(draft.sourceType() + ":" + draft.sourceId(), newEmbeddings.get(i));
            }
            Instant now = Instant.now();
            List<KnowledgeChunk> indexed = new ArrayList<>(drafts.size());
            for (Draft draft : drafts) {
                String id = draft.sourceType() + ":" + draft.sourceId();
                List<Double> embedding = embeddingById.get(id);
                if (embedding == null) embedding = existing.get(id).embedding();
                indexed.add(new KnowledgeChunk(draft.sourceType() + ":" + draft.sourceId(), draft.sourceType(), draft.sourceId(),
                    draft.title(), draft.content(), embedding, openAi.embeddingModel(), draft.url(), now));
            }
            chunks.deleteAll();
            chunks.saveAll(indexed);
            lastIndexedAt = now;
            lastError = null;
            metrics.counter("novacart.ai.rag.index.refreshes").increment();
            metrics.timer("novacart.ai.rag.index.duration").record(System.nanoTime() - started, java.util.concurrent.TimeUnit.NANOSECONDS);
            return status();
        } finally { indexing.set(false); }
    }

    public void requestRefresh() {
        CompletableFuture.runAsync(() -> {
            try { refresh(); }
            catch (Exception ex) { lastError = ex.getMessage(); metrics.counter("novacart.ai.rag.index.failures").increment(); }
        });
    }

    public Optional<RagAnswer> answer(String question, String userId) {
        long started = System.nanoTime();
        List<ScoredChunk> evidence = search(question, 5);
        if (evidence.isEmpty()) return Optional.empty();
        String context = evidence.stream().map(item -> "[" + item.chunk().sourceType() + "/" + item.chunk().sourceId() + "] "
            + item.chunk().title() + "\n" + item.chunk().content()).collect(Collectors.joining("\n\n"));
        String mode = openAi.enabled() ? "rag-" + openAi.provider() + "-v1" : "rag-local-vector-v1";
        String answer;
        try { answer = openAi.generate(question, context).orElseGet(() -> extractiveAnswer(evidence)); }
        catch (Exception ex) {
            metrics.counter("novacart.ai.rag.generation.failures").increment();
            answer = extractiveAnswer(evidence);
            mode = "rag-extractive-fallback-v1";
        }
        Set<String> citedSources = new HashSet<>();
        List<ChatController.Citation> citations = evidence.stream()
            .filter(item -> citedSources.add(item.chunk().url()))
            .map(item -> new ChatController.Citation(
            item.chunk().sourceId(), item.chunk().title(), item.chunk().url())).toList();
        metrics.counter("novacart.ai.rag.answers", "provider", openAi.provider()).increment();
        try { runs.save(new AgentRun(UUID.randomUUID().toString(), userId, question, mode, citations.size(),
            (System.nanoTime() - started) / 1_000_000, "SUCCESS", Instant.now())); }
        catch (Exception ignored) { metrics.counter("novacart.ai.rag.audit.failures").increment(); }
        return Optional.of(new RagAnswer(answer, citations, mode));
    }

    public List<ScoredChunk> search(String query, int limit) {
        if (chunks.count() == 0 && !indexing.get()) {
            try { refresh(); } catch (Exception ex) { lastError = ex.getMessage(); return List.of(); }
        }
        List<Double> queryVector;
        try { queryVector = openAi.embed(query); }
        catch (Exception ex) { lastError = ex.getMessage(); metrics.counter("novacart.ai.rag.query.failures").increment(); return List.of(); }
        List<ScoredChunk> ranked = chunks.findAll().stream()
            .filter(chunk -> chunk.embedding() != null && chunk.embeddingModel().equals(openAi.embeddingModel()))
            .map(chunk -> {
                double vectorScore = cosine(queryVector, chunk.embedding());
                double lexicalScore = lexicalScore(query, chunk);
                double score = openAi.enabled() ? vectorScore : (.2 * vectorScore) + (.8 * lexicalScore);
                return new ScoredChunk(chunk, score, lexicalScore);
            })
            .filter(item -> openAi.enabled() || item.lexicalScore() > 0)
            // The local fallback is intentionally conservative: a product must
            // match at least one query term in its title.  Matching only a
            // description/tag (for example, "jacket" mentioned in an
            // unrelated item's copy) is not strong enough to call it a
            // grounded catalogue result.
            .filter(item -> openAi.enabled() || !"PRODUCT".equals(item.chunk().sourceType())
                || titleMatches(query, item.chunk()) > 0)
            .filter(item -> item.score() >= minimumScore)
            .sorted(Comparator.comparingDouble(ScoredChunk::score).reversed())
            .toList();
        if (ranked.isEmpty()) return List.of();
        if (openAi.enabled()) {
            boolean policyQuery = tokens(query).stream().anyMatch(Set.of(
                "policy", "delivery", "shipping", "coupon", "refund", "cancel", "cancellation")::contains);
            Set<String> policyFocus = new HashSet<>(tokens(query));
            policyFocus.remove("policy");
            List<ScoredChunk> relevant = ranked.stream().filter(item ->
                (policyQuery ? "POLICY" : "PRODUCT").equals(item.chunk().sourceType())
                    && titleMatches(query, item.chunk()) > 0
                    && (!policyQuery || policyFocus.isEmpty()
                        || policyFocus.stream().anyMatch(tokens(item.chunk().title())::contains))).toList();
            if (!relevant.isEmpty()) ranked = relevant;
        }
        if (openAi.enabled() && ranked.getFirst().score() < noAnswerScore) {
            metrics.counter("novacart.ai.rag.no_answer").increment();
            return List.of();
        }
        double relativeCutoff = Math.max(minimumScore, ranked.getFirst().score() * .6);
        return ranked.stream().filter(item -> item.score() >= relativeCutoff)
            .limit(Math.max(1, Math.min(limit, 10))).toList();
    }

    public IndexStatus status() {
        return new IndexStatus(chunks.count(), openAi.embeddingModel(), openAi.responseModel(), openAi.enabled(),
            openAi.provider(), indexing.get(), lastIndexedAt, lastError);
    }

    private ProductPage productPage(int page) {
        return products.get().uri(uri -> uri.path("/api/v1/products").queryParam("page", page).queryParam("size", 100).build())
            .retrieve().body(ProductPage.class);
    }

    private Draft productDraft(Product product) {
        String price = product.priceInPaise() == null ? "Price unavailable" : "Price INR " + String.format(Locale.ROOT, "%.2f", product.priceInPaise() / 100d);
        String content = String.join(". ", safe(product.title()), "Brand " + safe(product.brand()), "Category " + safe(product.categorySlug()),
            price, "Rating " + (product.rating() == null ? "unrated" : product.rating()), safe(product.description()),
            product.tags() == null ? "" : "Tags " + String.join(", ", product.tags()));
        return new Draft("PRODUCT", product.id(), product.title(), content, "/products/" + product.id());
    }

    private List<Draft> chunkDrafts(List<Draft> drafts) {
        List<Draft> result = new ArrayList<>();
        for (Draft draft : drafts) {
            String[] words = draft.content().trim().split("\\s+");
            if (words.length <= 90) { result.add(draft); continue; }
            for (int start = 0, chunk = 0; start < words.length; start += 80, chunk++) {
                int end = Math.min(words.length, start + 90);
                result.add(new Draft(draft.sourceType(), draft.sourceId() + "#" + chunk,
                    draft.title() + " (part " + (chunk + 1) + ")", String.join(" ", Arrays.copyOfRange(words, start, end)), draft.url()));
            }
        }
        return result;
    }

    private String extractiveAnswer(List<ScoredChunk> evidence) {
        return "Based on verified NovaCart information: " + evidence.stream().limit(3).map(item -> {
            String content = item.chunk().content();
            if (content.startsWith(item.chunk().title())) content = content.substring(item.chunk().title().length()).replaceFirst("^[. ]+", "");
            return item.chunk().title() + " - " + (content.length() > 220 ? content.substring(0, 220).trim() + "..." : content);
        }).collect(Collectors.joining("\n\n"));
    }

    private double lexicalScore(String query, KnowledgeChunk chunk) {
        Set<String> terms = tokens(query);
        if (terms.isEmpty()) return 0;
        Set<String> titleTerms = tokens(chunk.title());
        Set<String> contentTerms = tokens(chunk.content());
        long titleMatches = terms.stream().filter(titleTerms::contains).count();
        long contentMatches = terms.stream().filter(contentTerms::contains).count();
        return Math.min(1d, ((titleMatches * 3d) + contentMatches) / (terms.size() * 4d));
    }

    private long titleMatches(String query, KnowledgeChunk chunk) {
        String productPhrase = query.split("(?i)\\b(?:for|with|under|below|around|that|which)\\b", 2)[0];
        Set<String> terms = tokens(query);
        Set<String> productTerms = tokens(productPhrase);
        Set<String> titleTerms = tokens(chunk.title());
        if (productTerms.isEmpty()) return 0;
        String headTerm = productTerms.stream().reduce((first, last) -> last).orElse("");
        boolean matchesHead = titleTerms.contains(headTerm)
            || (Set.of("headphone", "headphones", "earphone", "earphones", "earbuds").contains(headTerm)
                && titleTerms.stream().anyMatch(Set.of("headphone", "headphones", "earphone", "earphones", "earbuds")::contains));
        if (!matchesHead) return 0;
        if (terms.contains("wireless") && !titleTerms.contains("wireless") && !titleTerms.contains("bluetooth")) return 0;
        if (terms.contains("wired") && !titleTerms.contains("wired")) return 0;
        return terms.stream().filter(titleTerms::contains).count();
    }

    private Set<String> tokens(String text) {
        if (text == null) return Set.of();
        Set<String> stopWords = Set.of("with", "from", "that", "this", "have", "your", "what", "which", "show", "find", "want", "need", "good", "best", "for", "the", "and", "recommend", "suggest", "looking", "please", "some", "any");
        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
            .filter(token -> token.length() > 2 && !stopWords.contains(token)).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private double cosine(List<Double> left, List<Double> right) {
        int length = Math.min(left.size(), right.size());
        if (length == 0) return 0;
        double dot = 0, leftNorm = 0, rightNorm = 0;
        for (int i = 0; i < length; i++) {
            double a = left.get(i), b = right.get(i);
            dot += a * b; leftNorm += a * a; rightNorm += b * b;
        }
        return leftNorm == 0 || rightNorm == 0 ? 0 : dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
    }

    private String safe(String value) { return value == null ? "" : value.trim(); }

    private record Draft(String sourceType, String sourceId, String title, String content, String url) {}
    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ProductPage(List<Product> content, int totalPages) {}
    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Product(String id, String title, String brand, String categorySlug, Long priceInPaise,
                           String description, List<String> tags, Double rating) {}
    public record ScoredChunk(KnowledgeChunk chunk, double score, double lexicalScore) {}
    public record RagAnswer(String answer, List<ChatController.Citation> citations, String mode) {}
    public record IndexStatus(long chunks, String embeddingModel, String responseModel, boolean modelEnabled,
                              String provider, boolean indexing, Instant lastIndexedAt, String lastError) {}
}
