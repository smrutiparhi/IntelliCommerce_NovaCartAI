package com.novacart.inventory.controller;

import com.novacart.inventory.entity.Inventory;
import com.novacart.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryRepository inventoryRepository;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryRepository.findAll());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Inventory> getByProductId(@PathVariable String productId) {
        return inventoryRepository.findByProductId(productId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Inventory> setStock(@RequestBody Inventory inventory) {
        Optional<Inventory> existingOpt = inventoryRepository.findByProductId(inventory.getProductId());
        if (existingOpt.isPresent()) {
            Inventory existing = existingOpt.get();
            existing.setAvailableQuantity(inventory.getAvailableQuantity());
            if (inventory.getSellerId() != null) existing.setSellerId(inventory.getSellerId());
            return ResponseEntity.ok(inventoryRepository.save(existing));
        } else {
            return ResponseEntity.ok(inventoryRepository.save(inventory));
        }
    }
}
