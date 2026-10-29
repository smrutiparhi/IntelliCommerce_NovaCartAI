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

    private static List<String> productIds() {
        List<String> ids = new ArrayList<>();
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
