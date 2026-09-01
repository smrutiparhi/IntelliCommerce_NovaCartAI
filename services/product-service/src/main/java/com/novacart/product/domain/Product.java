package com.novacart.product.domain;

import java.time.Instant;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("products")
@CompoundIndex(name = "category_price_idx", def = "{'categorySlug': 1, 'priceInPaise': 1}")
public class Product {
    @Id public String id;
    @Indexed(unique = true) public String slug;
    @Indexed public String sellerId;
    public String title;
    public String brand;
    @Indexed public String categorySlug;
    public long priceInPaise;
    public Long originalPriceInPaise;
    public String description;
    public List<String> images;
    public List<String> tags;
    public String badge;
    public String delivery;
    public double rating;
    public long reviewCount;
    public boolean active = true;
    public Instant createdAt;
    public Instant updatedAt;
    @Version public Long version;
}
