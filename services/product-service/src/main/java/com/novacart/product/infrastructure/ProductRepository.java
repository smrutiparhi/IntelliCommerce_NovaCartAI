package com.novacart.product.infrastructure;

import com.novacart.product.domain.Product;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
