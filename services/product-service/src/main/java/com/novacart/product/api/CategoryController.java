package com.novacart.product.api;

import com.novacart.product.api.dto.CategoryResponse;
import com.novacart.product.infrastructure.CategoryRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryRepository categories;
    public CategoryController(CategoryRepository categories) { this.categories = categories; }
    @GetMapping public List<CategoryResponse> all() { return categories.findAll().stream().map(c -> new CategoryResponse(c.id, c.slug, c.name, c.description, c.image)).toList(); }
}
