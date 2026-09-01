package com.novacart.cart.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

@ExtendWith(MockitoExtension.class)
class CartStoreTest {
    @Mock StringRedisTemplate redis;
    @Mock ValueOperations<String, String> values;
    CartStore store;

    @BeforeEach void setup() { when(redis.opsForValue()).thenReturn(values); store = new CartStore(redis, new ObjectMapper()); }

    @Test
    void addsAndCapsItemQuantityAtTen() {
        when(values.get("cart:user:user-1")).thenReturn("{\"product-1\":9}");
        var result = store.add("user-1", "product-1", 4);

        assertEquals(10, result.itemCount());
        assertEquals(10, result.items().getFirst().quantity());
        verify(values).set(eq("cart:user:user-1"), any(String.class), eq(30L), eq(TimeUnit.DAYS));
    }

    @Test
    void wishlistDoesNotDuplicateProductIds() {
        when(values.get("wishlist:user:user-1")).thenReturn("[\"product-1\"]");
        var result = store.addWishlist("user-1", "product-1");

        assertEquals(1, result.productIds().size());
        assertEquals("product-1", result.productIds().getFirst());
    }
}
