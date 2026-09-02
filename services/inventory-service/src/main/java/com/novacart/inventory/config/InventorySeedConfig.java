package com.novacart.inventory.config;

import com.novacart.inventory.entity.Inventory;
import com.novacart.inventory.repository.InventoryRepository;
import java.util.List;
import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class InventorySeedConfig {

    private static final List<String> BASE_PRODUCT_IDS = List.of(
        "nova-orbit-x1", "nova-book-air-14", "luma-view-27", "keyframe-k75",
        "auralis-studio-one", "pulse-air-mini", "resonance-room-speaker",
        "waypoint-denim-jacket", "atelier-oxford-shirt", "drift-court-sneaker",
        "haven-lounge-chair", "arc-glow-lamp", "loom-textured-throw",
        "brewline-espresso", "aero-crisp-airfryer", "pureflow-air",
        "dewdrop-barrier-serum", "velvet-cloud-lip", "terra-no7-fragrance",
        "motion-pro-mat", "stride-flow-runner", "forge-adjustable-dumbbell",
        "folio-intentional-day", "folio-systems-scale", "highland-coffee",
        "goodgrain-granola", "playform-blocks", "brightbot-starter-kit",
        "arc-time-steel", "metro-daypack-20", "halo-frame-sunglasses"
    );

    private static List<String> productIds() {
        List<String> ids = new ArrayList<>(BASE_PRODUCT_IDS);
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
            InventorySeedConfig.class.getResourceAsStream("/real-products.tsv"), StandardCharsets.UTF_8))) {
            reader.lines().skip(1).forEach(line -> ids.add(line.split("\\t", 2)[0]));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to load real product inventory", exception);
        }
        return ids;
    }

    @Bean
    @Profile("!test")
    CommandLineRunner seedInventory(InventoryRepository inventoryRepository) {
        return args -> {
            List<String> productIds = productIds();
            Set<String> desired = new HashSet<>(productIds);
            inventoryRepository.findAll().stream()
                .filter(item -> "novacart-seed".equals(item.getSellerId()) && !desired.contains(item.getProductId()))
                .forEach(inventoryRepository::delete);
            for (String productId : productIds) {
                if (inventoryRepository.findByProductId(productId).isEmpty()) {
                    inventoryRepository.save(Inventory.builder()
                        .productId(productId)
                        .sellerId("novacart-seed")
                        .availableQuantity(100)
                        .reservedQuantity(0)
                        .lowStockThreshold(10)
                        .build());
                }
            }
        };
    }
}
