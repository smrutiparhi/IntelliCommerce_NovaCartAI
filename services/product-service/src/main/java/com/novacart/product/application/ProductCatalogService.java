package com.novacart.product.application;

import com.novacart.product.api.dto.ProductRequest;
import com.novacart.product.api.dto.ProductResponse;
import com.novacart.product.domain.CatalogAccessDeniedException;
import com.novacart.product.domain.Product;
import com.novacart.product.domain.ProductNotFoundException;
import com.novacart.product.infrastructure.CategoryRepository;
import com.novacart.product.infrastructure.ProductRepository;
import java.text.Normalizer;
import java.time.Instant;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class ProductCatalogService {
    private final ProductRepository products;
    private final CategoryRepository categories;
    private final MongoTemplate mongo;

    public ProductCatalogService(ProductRepository products, CategoryRepository categories, MongoTemplate mongo) {
        this.products = products; this.categories = categories; this.mongo = mongo;
    }

    public Page<ProductResponse> search(String term, String category, Long minPrice, Long maxPrice,
                                        int page, int size, String sort) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(size, 1), 100), parseSort(sort));
        Criteria criteria = Criteria.where("active").is(true);
        if (category != null && !category.isBlank()) criteria = criteria.and("categorySlug").is(category.toLowerCase(Locale.ROOT));
        if (minPrice != null || maxPrice != null) {
            Criteria price = criteria.and("priceInPaise");
            if (minPrice != null) price.gte(minPrice);
            if (maxPrice != null) price.lte(maxPrice);
        }
        if (term != null && !term.isBlank()) {
            String escaped = Pattern.quote(term.trim());
            criteria = new Criteria().andOperator(criteria, new Criteria().orOperator(
                Criteria.where("title").regex(escaped, "i"), Criteria.where("brand").regex(escaped, "i"),
                Criteria.where("tags").regex(escaped, "i"), Criteria.where("description").regex(escaped, "i")));
        }
        Query query = new Query(criteria).with(pageable);
        long count = mongo.count(Query.of(query).limit(-1).skip(-1), Product.class);
        var content = mongo.find(query, Product.class).stream().map(this::response).toList();
        return new PageImpl<>(content, pageable, count);
    }

    public ProductResponse get(String idOrSlug) {
        return response(products.findById(idOrSlug).or(() -> products.findBySlug(idOrSlug)).filter(p -> p.active)
            .orElseThrow(() -> new ProductNotFoundException(idOrSlug)));
    }

    public ProductResponse create(ProductRequest request, String sellerId) {
        requireCategory(request.categorySlug());
        Product product = new Product();
        product.sellerId = requireIdentity(sellerId);
        product.slug = uniqueSlug(request.title());
        apply(product, request);
        product.rating = 0; product.reviewCount = 0;
        product.createdAt = Instant.now(); product.updatedAt = product.createdAt;
        return response(products.save(product));
    }

    public ProductResponse update(String id, ProductRequest request, String actorId, boolean admin) {
        Product product = products.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
        requireOwner(product, actorId, admin);
        requireCategory(request.categorySlug());
        apply(product, request); product.updatedAt = Instant.now();
        return response(products.save(product));
    }

    public void delete(String id, String actorId, boolean admin) {
        Product product = products.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
        requireOwner(product, actorId, admin);
        product.active = false; product.updatedAt = Instant.now(); products.save(product);
    }

    private void apply(Product product, ProductRequest request) {
        product.title = request.title().trim(); product.brand = request.brand().trim();
        product.categorySlug = request.categorySlug().toLowerCase(Locale.ROOT).trim();
        product.priceInPaise = request.priceInPaise(); product.originalPriceInPaise = request.originalPriceInPaise();
        product.description = request.description().trim(); product.images = ListCopy.clean(request.images());
        product.tags = ListCopy.clean(request.tags()); product.badge = request.badge(); product.delivery = request.delivery();
        if (request.active() != null) product.active = request.active();
    }

    private void requireCategory(String slug) {
        if (!categories.existsBySlug(slug.toLowerCase(Locale.ROOT))) throw new IllegalArgumentException("Unknown category: " + slug);
    }
    private String requireIdentity(String id) {
        if (id == null || id.isBlank()) throw new CatalogAccessDeniedException("Authenticated seller identity is required");
        return id;
    }
    private void requireOwner(Product product, String actorId, boolean admin) {
        requireIdentity(actorId);
        if (!admin && !product.sellerId.equals(actorId)) throw new CatalogAccessDeniedException("A seller cannot modify another seller's product");
    }
    private String uniqueSlug(String title) {
        String base = Normalizer.normalize(title, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
            .toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        String candidate = base; int suffix = 2;
        while (products.existsBySlug(candidate)) candidate = base + "-" + suffix++;
        return candidate;
    }
    private Sort parseSort(String sort) {
        return switch (sort == null ? "newest" : sort) {
            case "price-asc" -> Sort.by("priceInPaise").ascending();
            case "price-desc" -> Sort.by("priceInPaise").descending();
            case "rating" -> Sort.by("rating").descending();
            default -> Sort.by("createdAt").descending();
        };
    }
    private ProductResponse response(Product p) { return new ProductResponse(p.id, p.slug, p.sellerId, p.title, p.brand, p.categorySlug, p.priceInPaise, p.originalPriceInPaise, p.description, p.images, p.tags, p.badge, p.delivery, p.rating, p.reviewCount, p.active, p.createdAt, p.updatedAt); }

    private static final class ListCopy {
        static java.util.List<String> clean(java.util.List<String> values) {
            return values == null ? java.util.List.of() : values.stream().filter(v -> v != null && !v.isBlank()).map(String::trim).distinct().toList();
        }
    }
}
