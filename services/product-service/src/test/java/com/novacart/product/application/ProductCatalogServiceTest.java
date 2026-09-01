package com.novacart.product.application;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.novacart.product.api.dto.ProductRequest;
import com.novacart.product.domain.CatalogAccessDeniedException;
import com.novacart.product.domain.Product;
import com.novacart.product.infrastructure.CategoryRepository;
import com.novacart.product.infrastructure.ProductRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

@ExtendWith(MockitoExtension.class)
class ProductCatalogServiceTest {
    @Mock ProductRepository products;
    @Mock CategoryRepository categories;
    @Mock MongoTemplate mongo;
    ProductCatalogService service;

    @BeforeEach void setup() { service = new ProductCatalogService(products, categories, mongo); }

    @Test
    void sellerCannotUpdateAnotherSellersProduct() {
        Product product = new Product(); product.id = "p1"; product.sellerId = "seller-a";
        when(products.findById("p1")).thenReturn(Optional.of(product));
        ProductRequest request = new ProductRequest("Product", "Brand", "technology", 1000, null,
            "Description", List.of("https://example.com/image.jpg"), List.of("tag"), null, null, true);

        assertThrows(CatalogAccessDeniedException.class,
            () -> service.update("p1", request, "seller-b", false));
    }

    @Test
    void anonymousActorCannotDeleteAProduct() {
        Product product = new Product(); product.id = "p1"; product.sellerId = "seller-a";
        when(products.findById("p1")).thenReturn(Optional.of(product));

        assertThrows(CatalogAccessDeniedException.class,
            () -> service.delete("p1", "", false));
    }
}
