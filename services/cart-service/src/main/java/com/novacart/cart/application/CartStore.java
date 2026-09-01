package com.novacart.cart.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.cart.api.dto.CartResponse;
import com.novacart.cart.api.dto.WishlistResponse;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class CartStore {
    private static final long TTL_DAYS = 30;
    private final StringRedisTemplate redis;
    private final ObjectMapper json;

    public CartStore(StringRedisTemplate redis, ObjectMapper json) { this.redis = redis; this.json = json; }

    public CartResponse getCart(String userId) {
        Map<String, Integer> cart = readCart(userId);
        return response(cart);
    }
    public CartResponse add(String userId, String productId, int quantity) {
        Map<String, Integer> cart = readCart(userId); cart.merge(productId, quantity, (a, b) -> Math.min(10, a + b)); writeCart(userId, cart); return response(cart);
    }
    public CartResponse setQuantity(String userId, String productId, int quantity) {
        Map<String, Integer> cart = readCart(userId); cart.put(productId, quantity); writeCart(userId, cart); return response(cart);
    }
    public CartResponse remove(String userId, String productId) {
        Map<String, Integer> cart = readCart(userId); cart.remove(productId); writeCart(userId, cart); return response(cart);
    }
    public void clear(String userId) { redis.delete(cartKey(userId)); }

    public WishlistResponse getWishlist(String userId) { return new WishlistResponse(new ArrayList<>(readWishlist(userId))); }
    public WishlistResponse addWishlist(String userId, String productId) { Set<String> values = readWishlist(userId); values.add(productId); writeWishlist(userId, values); return new WishlistResponse(new ArrayList<>(values)); }
    public WishlistResponse removeWishlist(String userId, String productId) { Set<String> values = readWishlist(userId); values.remove(productId); writeWishlist(userId, values); return new WishlistResponse(new ArrayList<>(values)); }

    private Map<String, Integer> readCart(String userId) {
        String value = redis.opsForValue().get(cartKey(userId));
        if (value == null) return new LinkedHashMap<>();
        try { return new LinkedHashMap<>(json.readValue(value, new TypeReference<Map<String, Integer>>() {})); }
        catch (Exception exception) { redis.delete(cartKey(userId)); return new LinkedHashMap<>(); }
    }
    private Set<String> readWishlist(String userId) {
        String value = redis.opsForValue().get(wishlistKey(userId));
        if (value == null) return new LinkedHashSet<>();
        try { return new LinkedHashSet<>(json.readValue(value, new TypeReference<List<String>>() {})); }
        catch (Exception exception) { redis.delete(wishlistKey(userId)); return new LinkedHashSet<>(); }
    }
    private void writeCart(String userId, Map<String, Integer> cart) { write(cartKey(userId), cart); }
    private void writeWishlist(String userId, Set<String> wishlist) { write(wishlistKey(userId), wishlist); }
    private void write(String key, Object value) {
        try { redis.opsForValue().set(key, json.writeValueAsString(value), TTL_DAYS, TimeUnit.DAYS); }
        catch (Exception exception) { throw new IllegalStateException("Unable to persist shopping data", exception); }
    }
    private CartResponse response(Map<String, Integer> cart) {
        return new CartResponse(cart.entrySet().stream().map(e -> new CartResponse.Item(e.getKey(), e.getValue())).toList(), cart.values().stream().mapToInt(Integer::intValue).sum());
    }
    private String cartKey(String userId) { return "cart:user:" + userId; }
    private String wishlistKey(String userId) { return "wishlist:user:" + userId; }
}
