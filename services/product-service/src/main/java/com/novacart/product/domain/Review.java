package com.novacart.product.domain;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("reviews")
@CompoundIndex(name = "product_user_unique", def = "{'productId':1,'userId':1}", unique = true)
public class Review {
    @Id public String id;
    public String productId;
    public String userId;
    public String customerName;
    public int rating;
    public String title;
    public String comment;
    public boolean verifiedPurchase;
    public Instant createdAt;
    public Instant updatedAt;
}
