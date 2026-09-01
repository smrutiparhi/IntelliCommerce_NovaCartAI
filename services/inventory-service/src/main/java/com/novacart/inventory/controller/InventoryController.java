package com.novacart.inventory.controller;

import com.novacart.inventory.entity.Inventory;
import com.novacart.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryRepository inventoryRepository;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory(
        @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireAdmin(roles);
        return ResponseEntity.ok(inventoryRepository.findAll());
    }

    @GetMapping("/seller/me")
    public ResponseEntity<List<Inventory>> getSellerInventory(
        @RequestHeader("X-User-Id") String userId,
        @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireSeller(roles);
        return ResponseEntity.ok(inventoryRepository.findBySellerIdOrderByUpdatedAtDesc(userId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Inventory> getByProductId(@PathVariable String productId) {
        return inventoryRepository.findByProductId(productId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Inventory> setStock(@RequestBody Inventory inventory,
        @RequestHeader("X-User-Id") String userId,
        @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireSeller(roles);
        if (inventory.getProductId() == null || inventory.getProductId().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product ID is required");
        if (inventory.getAvailableQuantity() == null || inventory.getAvailableQuantity() < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Available quantity cannot be negative");
        boolean admin = roles != null && roles.contains("ROLE_ADMIN");
        Optional<Inventory> existingOpt = inventoryRepository.findByProductId(inventory.getProductId());
        if (existingOpt.isPresent()) {
            Inventory existing = existingOpt.get();
            if (!admin && existing.getSellerId() != null && !userId.equals(existing.getSellerId()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "A seller cannot modify another seller's inventory");
            existing.setAvailableQuantity(inventory.getAvailableQuantity());
            if (existing.getSellerId() == null) existing.setSellerId(userId);
            return ResponseEntity.ok(inventoryRepository.save(existing));
        } else {
            inventory.setSellerId(userId);
            inventory.setReservedQuantity(0);
            return ResponseEntity.ok(inventoryRepository.save(inventory));
        }
    }

    @GetMapping("/availability")
    public ResponseEntity<Map<String, Integer>> getAvailability() {
        return ResponseEntity.ok(inventoryRepository.findAll().stream().collect(Collectors.toMap(
            Inventory::getProductId,
            inventory -> Math.max(0, inventory.getAvailableQuantity() - inventory.getReservedQuantity()),
            (first, ignored) -> first
        )));
    }


    private void requireSeller(String roles) {
        if (roles == null || (!roles.contains("ROLE_SELLER") && !roles.contains("ROLE_ADMIN")))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller or admin role is required");
    }

    private void requireAdmin(String roles) {
        if (roles == null || !roles.contains("ROLE_ADMIN"))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role is required");
    }
}
