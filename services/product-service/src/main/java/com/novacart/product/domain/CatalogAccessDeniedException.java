package com.novacart.product.domain;

public class CatalogAccessDeniedException extends RuntimeException {
    public CatalogAccessDeniedException(String message) { super(message); }
}
