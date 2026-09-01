package com.novacart.product.api;

import com.novacart.product.api.dto.ProductRequest;
import com.novacart.product.api.dto.ProductResponse;
import com.novacart.product.application.ProductCatalogService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductCatalogService catalog;
    public ProductController(ProductCatalogService catalog) { this.catalog = catalog; }

    @GetMapping
    public Page<ProductResponse> search(@RequestParam(required = false) String q,
        @RequestParam(required = false) String category, @RequestParam(required = false) Long minPrice,
        @RequestParam(required = false) Long maxPrice, @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "24") int size, @RequestParam(defaultValue = "newest") String sort) {
        return catalog.search(q, category, minPrice, maxPrice, page, size, sort);
    }

    @GetMapping("/{idOrSlug}") public ProductResponse get(@PathVariable String idOrSlug) { return catalog.get(idOrSlug); }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request,
        @RequestHeader("X-User-Id") String userId, @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireSeller(roles); return ResponseEntity.status(HttpStatus.CREATED).body(catalog.create(request, userId));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable String id, @Valid @RequestBody ProductRequest request,
        @RequestHeader("X-User-Id") String userId, @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireSeller(roles); return catalog.update(id, request, userId, isAdmin(roles));
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id, @RequestHeader("X-User-Id") String userId,
        @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireSeller(roles); catalog.delete(id, userId, isAdmin(roles));
    }

    private void requireSeller(String roles) {
        if (roles == null || (!roles.contains("ROLE_SELLER") && !roles.contains("ROLE_ADMIN")))
            throw new com.novacart.product.domain.CatalogAccessDeniedException("Seller or admin role is required");
    }
    private boolean isAdmin(String roles) { return roles != null && roles.contains("ROLE_ADMIN"); }
}
