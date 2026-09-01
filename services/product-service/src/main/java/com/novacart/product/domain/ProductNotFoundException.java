package com.novacart.product.domain;

public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(String id) { super("Product not found: " + id); }
}
