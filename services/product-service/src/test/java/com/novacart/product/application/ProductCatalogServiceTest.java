package com.novacart.product.application;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.novacart.product.api.dto.ProductRequest;
import com.novacart.product.domain.CatalogAccessDeniedException;
import com.novacart.product.domain.Product;
import com.novacart.product.infrastructure.CategoryRepository;
import com.novacart.product.infrastructure.ProductRepository;
import com.novacart.product.infrastructure.ReviewRepository;
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
    @Mock ReviewRepository reviews;
    ProductCatalogService service;

    @BeforeEach void setup() { service = new ProductCatalogService(products, categories, mongo, reviews); }

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

    @Test
    void sellerCatalogueOnlyReturnsTheAuthenticatedSellersActiveProducts() {
        Product product = new Product(); product.id = "p1"; product.slug = "seller-product";
        product.sellerId = "seller-a"; product.title = "Seller Product"; product.brand = "Nova";
        product.categorySlug = "technology"; product.description = "Description";
        product.images = List.of("https://example.com/image.jpg"); product.tags = List.of(); product.active = true;
        when(products.findBySellerIdAndActiveTrueOrderByUpdatedAtDesc("seller-a")).thenReturn(List.of(product));

        var result = service.sellerProducts("seller-a");

        assertEquals(1, result.size());
        assertEquals("seller-a", result.getFirst().sellerId());
    }

    @Test
    void originalPriceCannotBeLowerThanSellingPrice() {
        when(categories.existsBySlug("technology")).thenReturn(true);
        ProductRequest request = new ProductRequest("Product", "Brand", "technology", 2000, 1000L,
            "Description", List.of("https://example.com/image.jpg"), List.of(), null, null, true);

        assertThrows(IllegalArgumentException.class, () -> service.create(request, "seller-a"));
    }
}
