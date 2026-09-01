package com.novacart.order.controller;

import com.novacart.order.dto.CreateOrderRequest;
import com.novacart.order.entity.Order;
import com.novacart.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestHeader("X-User-Id") String userId, @Valid @RequestBody CreateOrderRequest request) {
        CreateOrderRequest trustedRequest = new CreateOrderRequest(userId, request.items(), request.shippingAddressJson(), request.couponCode(), request.idempotencyKey());
        Order created = orderService.createOrder(trustedRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@RequestHeader("X-User-Id") String userId, @PathVariable String orderId) {
        return orderService.getOrderForUser(orderId, userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<Page<Order>> getOrdersByUserId(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId, PageRequest.of(page, size)));
    }

    @GetMapping("/seller")
    public ResponseEntity<Page<Order>> getSellerOrders(
            @RequestHeader("X-User-Id") String sellerId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (roles == null || (!roles.contains("ROLE_SELLER") && !roles.contains("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(orderService.getOrdersForSeller(sellerId, PageRequest.of(page, size)));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String orderId,
            @RequestParam(defaultValue = "User requested cancellation") String reason) {
        Order cancelled = orderService.cancelOrderForUser(orderId, userId, reason);
        return ResponseEntity.ok(cancelled);
    }
}
