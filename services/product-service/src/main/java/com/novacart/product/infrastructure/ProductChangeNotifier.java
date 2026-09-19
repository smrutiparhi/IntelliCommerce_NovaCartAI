package com.novacart.product.infrastructure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Notifies Nova AI so catalogue edits are re-indexed without waiting for the scheduled refresh. */
@Component
public class ProductChangeNotifier {
    private final RestClient ai;

    public ProductChangeNotifier(RestClient.Builder builder,
        @Value("${novacart.ai-service-url:http://localhost:8089}") String aiUrl) {
        this.ai = builder.baseUrl(aiUrl).build();
    }

    public void changed(String productId) {
        try {
            ai.post().uri(uri -> uri.path("/api/v1/ai/rag/product-updated").queryParam("productId", productId).build())
                .header("X-Internal-Service", "product-service").retrieve().toBodilessEntity();
        } catch (Exception ignored) {
            // Scheduled AI refresh remains the safety net if the AI service is restarting.
        }
    }
}
