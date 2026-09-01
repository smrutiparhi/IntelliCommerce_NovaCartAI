package com.novacart.product.api;

import com.novacart.product.domain.CatalogAccessDeniedException;
import com.novacart.product.domain.ProductNotFoundException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CatalogExceptionHandler {
    @ExceptionHandler(ProductNotFoundException.class)
    ResponseEntity<Map<String, Object>> notFound(ProductNotFoundException exception) { return error(HttpStatus.NOT_FOUND, exception.getMessage()); }
    @ExceptionHandler(CatalogAccessDeniedException.class)
    ResponseEntity<Map<String, Object>> forbidden(CatalogAccessDeniedException exception) { return error(HttpStatus.FORBIDDEN, exception.getMessage()); }
    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
    ResponseEntity<Map<String, Object>> badRequest(Exception exception) { return error(HttpStatus.BAD_REQUEST, exception.getMessage()); }
    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now()); body.put("status", status.value()); body.put("error", status.getReasonPhrase()); body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
