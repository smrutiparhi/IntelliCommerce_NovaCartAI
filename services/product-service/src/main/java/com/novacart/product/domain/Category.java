package com.novacart.product.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("categories")
public class Category {
    @Id public String id;
    @Indexed(unique = true) public String slug;
    public String name;
    public String description;
    public String image;

    public Category() {}
    public Category(String slug, String name, String description, String image) {
        this.slug = slug; this.name = name; this.description = description; this.image = image;
    }
}
