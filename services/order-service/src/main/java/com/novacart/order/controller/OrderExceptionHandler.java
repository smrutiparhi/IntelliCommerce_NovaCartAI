package com.novacart.order.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@RestControllerAdvice
public class OrderExceptionHandler {

    @ExceptionHandler({IllegalArgumentException.class, RestClientResponseException.class})
    ResponseEntity<Map<String, Object>> invalidRequest(Exception exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
            "success", false,
            "message", exception instanceof RestClientResponseException ? "Coupon could not be applied" : exception.getMessage()
        ));
    }
}
