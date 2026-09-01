package com.novacart.product.infrastructure;

import com.novacart.product.domain.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductIdOrderByUpdatedAtDesc(String productId);
    Optional<Review> findByProductIdAndUserId(String productId, String userId);
}
