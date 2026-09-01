package com.novacart.cart.api;

import com.novacart.cart.api.dto.CartItemRequest;
import com.novacart.cart.api.dto.CartResponse;
import com.novacart.cart.api.dto.QuantityRequest;
import com.novacart.cart.application.CartStore;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {
    private final CartStore store;
    public CartController(CartStore store) { this.store = store; }
    @GetMapping public CartResponse get(@RequestHeader("X-User-Id") String userId) { return store.getCart(userId); }
    @PostMapping("/items") @ResponseStatus(HttpStatus.CREATED)
    public CartResponse add(@RequestHeader("X-User-Id") String userId, @Valid @RequestBody CartItemRequest request) { return store.add(userId, request.productId(), request.quantity()); }
    @PutMapping("/items/{productId}")
    public CartResponse update(@RequestHeader("X-User-Id") String userId, @PathVariable String productId, @Valid @RequestBody QuantityRequest request) { return store.setQuantity(userId, productId, request.quantity()); }
    @DeleteMapping("/items/{productId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@RequestHeader("X-User-Id") String userId, @PathVariable String productId) { store.remove(userId, productId); }
    @DeleteMapping @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(@RequestHeader("X-User-Id") String userId) { store.clear(userId); }
}
