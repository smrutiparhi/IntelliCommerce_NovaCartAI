package com.novacart.cart.api;

import com.novacart.cart.api.dto.WishlistResponse;
import com.novacart.cart.application.CartStore;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/v1/wishlist")
public class WishlistController {
    private final CartStore store;
    public WishlistController(CartStore store) { this.store = store; }
    @GetMapping public WishlistResponse get(@RequestHeader("X-User-Id") String userId) { return store.getWishlist(userId); }
    @PostMapping("/{productId}") @ResponseStatus(HttpStatus.CREATED)
    public WishlistResponse add(@RequestHeader("X-User-Id") String userId, @PathVariable @NotBlank String productId) { return store.addWishlist(userId, productId); }
    @DeleteMapping("/{productId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@RequestHeader("X-User-Id") String userId, @PathVariable @NotBlank String productId) { store.removeWishlist(userId, productId); }
}
