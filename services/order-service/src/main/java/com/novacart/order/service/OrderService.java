package com.novacart.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.EventEnvelope;
import com.novacart.common.event.dto.*;
import com.novacart.order.dto.CreateOrderRequest;
import com.novacart.order.entity.*;
import com.novacart.order.repository.OrderOutboxRepository;
import com.novacart.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderOutboxRepository outboxRepository;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Value("${novacart.payment-service-url:http://payment-service:8086}")
    private String paymentServiceUrl;

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // Idempotency check
        Optional<Order> existingOpt = orderRepository.findByIdempotencyKey(request.idempotencyKey());
        if (existingOpt.isPresent()) {
            log.info("Returning existing order for idempotencyKey={}", request.idempotencyKey());
            return existingOpt.get();
        }

        String orderNumber = "NC-" + System.currentTimeMillis();
        long subtotalPaise = 0L;

        Order order = Order.builder()
            .orderNumber(orderNumber)
            .userId(request.userId())
            .shippingAddressJson(request.shippingAddressJson())
            .couponCode(request.couponCode() == null || request.couponCode().isBlank() ? null : request.couponCode().trim().toUpperCase())
            .idempotencyKey(request.idempotencyKey())
            .status(OrderStatus.PENDING)
            .sagaState(SagaState.ORDER_PLACED)
            .currency("INR")
            .shippingFeePaise(0L)
            .discountPaise(0L)
            .taxPaise(0L)
            .subtotalPaise(0L)
            .totalPaise(0L)
            .build();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.items()) {
            long itemSubtotal = itemReq.unitPricePaise() * itemReq.quantity();
            subtotalPaise += itemSubtotal;

            OrderItem item = OrderItem.builder()
                .productId(itemReq.productId())
                .productName(itemReq.productName())
                .productImage(itemReq.productImage())
                .sellerId(itemReq.sellerId())
                .unitPricePaise(itemReq.unitPricePaise())
                .quantity(itemReq.quantity())
                .subtotalPaise(itemSubtotal)
                .build();

            order.addItem(item);
        }

        long discountPaise = validateCoupon(request.couponCode(), subtotalPaise);
        order.setSubtotalPaise(subtotalPaise);
        order.setDiscountPaise(discountPaise);
        order.setTotalPaise(Math.max(0L, subtotalPaise - discountPaise));

        Order savedOrder = orderRepository.save(order);

        // Transactional Outbox Pattern — Save Outbox Message in SAME transaction
        List<OrderPlacedPayload.OrderItemPayload> eventItems = savedOrder.getItems().stream()
            .map(i -> new OrderPlacedPayload.OrderItemPayload(
                i.getProductId(), i.getProductName(), i.getSellerId(), i.getUnitPricePaise(), i.getQuantity(), i.getSubtotalPaise()
            )).toList();

        OrderPlacedPayload payload = new OrderPlacedPayload(
            savedOrder.getId(),
            savedOrder.getOrderNumber(),
            savedOrder.getUserId(),
            eventItems,
            savedOrder.getTotalPaise(),
            savedOrder.getCurrency(),
            savedOrder.getIdempotencyKey()
        );

        saveOutboxEvent(savedOrder.getId(), "order.placed", payload);

        log.info("Created order {} with orderId={} and wrote order.placed to outbox", orderNumber, savedOrder.getId());
        return savedOrder;
    }

    @Transactional
    public void handleStockReserved(StockReservedPayload payload) {
        orderRepository.findById(payload.orderId()).ifPresent(order -> {
            order.setSagaState(SagaState.STOCK_RESERVED);
            order.setStatus(OrderStatus.AWAITING_PAYMENT);
            orderRepository.save(order);
            log.info("Order {} updated to STOCK_RESERVED / AWAITING_PAYMENT", order.getId());
        });
    }

    @Transactional
    public void handleStockReservationFailed(StockReservationFailedPayload payload) {
        orderRepository.findById(payload.orderId()).ifPresent(order -> {
            order.setSagaState(SagaState.STOCK_RESERVATION_FAILED);
            order.setStatus(OrderStatus.CANCELLED);
            order.getItems().forEach(item -> item.setFulfillmentStatus(FulfillmentStatus.CANCELLED));
            orderRepository.save(order);

            OrderCancelledPayload cancelledPayload = new OrderCancelledPayload(
                order.getId(), order.getOrderNumber(), order.getUserId(), payload.reason()
            );
            saveOutboxEvent(order.getId(), "order.cancelled", cancelledPayload);
            log.info("Order {} updated to STOCK_RESERVATION_FAILED / CANCELLED", order.getId());
        });
    }

    @Transactional
    public void handlePaymentSuccessful(PaymentSuccessfulPayload payload) {
        orderRepository.findById(payload.orderId()).ifPresent(order -> {
            order.setSagaState(SagaState.PAYMENT_SUCCESSFUL);
            order.setStatus(OrderStatus.CONFIRMED);
            order.setPaymentId(payload.paymentId());
            order.getItems().forEach(item -> item.setFulfillmentStatus(FulfillmentStatus.PROCESSING));
            orderRepository.save(order);

            OrderConfirmedPayload confirmedPayload = new OrderConfirmedPayload(
                order.getId(), order.getOrderNumber(), order.getUserId(), order.getTotalPaise()
            );
            saveOutboxEvent(order.getId(), "order.confirmed", confirmedPayload);
            log.info("Order {} updated to PAYMENT_SUCCESSFUL / CONFIRMED", order.getId());
        });
    }

    @Transactional
    public void handlePaymentFailed(PaymentFailedPayload payload) {
        orderRepository.findById(payload.orderId()).ifPresent(order -> {
            order.setSagaState(SagaState.PAYMENT_FAILED);
            order.setStatus(OrderStatus.CANCELLED);
            order.getItems().forEach(item -> item.setFulfillmentStatus(FulfillmentStatus.CANCELLED));
            orderRepository.save(order);

            OrderCancelledPayload cancelledPayload = new OrderCancelledPayload(
                order.getId(), order.getOrderNumber(), order.getUserId(), "Payment Failed: " + payload.failureReason()
            );
            saveOutboxEvent(order.getId(), "order.cancelled", cancelledPayload);
            log.info("Order {} updated to PAYMENT_FAILED / CANCELLED (Compensation)", order.getId());
        });
    }

    @Transactional
    public Order cancelOrder(String orderId, String reason) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return order;
        }
        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            log.warn("Cannot cancel order in state {}", order.getStatus());
            return order;
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setSagaState(SagaState.ORDER_CANCELLED);
        order.getItems().forEach(item -> item.setFulfillmentStatus(FulfillmentStatus.CANCELLED));
        Order saved = orderRepository.save(order);

        OrderCancelledPayload cancelledPayload = new OrderCancelledPayload(
            saved.getId(), saved.getOrderNumber(), saved.getUserId(), reason
        );
        saveOutboxEvent(saved.getId(), "order.cancelled", cancelledPayload);
        return saved;
    }

    public Optional<Order> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }

    public Optional<Order> getOrderForUser(String orderId, String userId) {
        return orderRepository.findById(orderId).filter(order -> order.getUserId().equals(userId));
    }

    @Transactional
    public Order cancelOrderForUser(String orderId, String userId, String reason) {
        Order order = orderRepository.findById(orderId)
            .filter(candidate -> candidate.getUserId().equals(userId))
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return cancelOrder(order.getId(), reason);
    }

    public Page<Order> getOrdersByUserId(String userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Order> getOrdersForSeller(String sellerId, Pageable pageable) {
        return orderRepository.findDistinctByItemsSellerIdOrderByCreatedAtDesc(sellerId, pageable);
    }

    @Transactional
    public Order updateSellerFulfillment(String orderId, String sellerId, FulfillmentStatus requestedStatus) {
        if (requestedStatus != FulfillmentStatus.SHIPPED && requestedStatus != FulfillmentStatus.DELIVERED) {
            throw new IllegalArgumentException("Sellers may only mark items as shipped or delivered");
        }

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.PENDING
                || order.getStatus() == OrderStatus.AWAITING_PAYMENT) {
            throw new IllegalArgumentException("This order is not ready for fulfillment");
        }

        List<OrderItem> sellerItems = order.getItems().stream()
            .filter(item -> sellerId.equals(item.getSellerId()))
            .toList();
        if (sellerItems.isEmpty()) {
            throw new IllegalArgumentException("Order not found for this seller");
        }

        FulfillmentStatus requiredCurrent = requestedStatus == FulfillmentStatus.SHIPPED
            ? FulfillmentStatus.PROCESSING
            : FulfillmentStatus.SHIPPED;
        boolean validTransition = sellerItems.stream().allMatch(item -> effectiveStatus(item, order) == requiredCurrent);
        if (!validTransition) {
            throw new IllegalArgumentException("Invalid fulfillment transition to " + requestedStatus);
        }
        sellerItems.forEach(item -> item.setFulfillmentStatus(requestedStatus));

        boolean allDelivered = order.getItems().stream()
            .allMatch(item -> effectiveStatus(item, order) == FulfillmentStatus.DELIVERED);
        boolean allShipped = order.getItems().stream()
            .allMatch(item -> {
                FulfillmentStatus status = effectiveStatus(item, order);
                return status == FulfillmentStatus.SHIPPED || status == FulfillmentStatus.DELIVERED;
            });
        if (allDelivered) order.setStatus(OrderStatus.DELIVERED);
        else if (allShipped) order.setStatus(OrderStatus.SHIPPED);

        return orderRepository.save(order);
    }

    private FulfillmentStatus effectiveStatus(OrderItem item, Order order) {
        if (item.getFulfillmentStatus() != null) return item.getFulfillmentStatus();
        return switch (order.getStatus()) {
            case CANCELLED -> FulfillmentStatus.CANCELLED;
            case SHIPPED -> FulfillmentStatus.SHIPPED;
            case DELIVERED -> FulfillmentStatus.DELIVERED;
            case CONFIRMED -> FulfillmentStatus.PROCESSING;
            default -> FulfillmentStatus.AWAITING_PAYMENT;
        };
    }

    private void saveOutboxEvent(String aggregateId, String eventType, Object payload) {
        try {
            EventEnvelope<Object> envelope = new EventEnvelope<>(
                UUID.randomUUID().toString(),
                eventType,
                1,
                Instant.now(),
                "order-service",
                UUID.randomUUID().toString(),
                aggregateId,
                payload
            );
            String jsonPayload = objectMapper.writeValueAsString(envelope);
            OutboxMessage outbox = OutboxMessage.builder()
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(jsonPayload)
                .published(false)
                .build();
            outboxRepository.save(outbox);
        } catch (Exception e) {
            log.error("Error saving outbox message aggregateId={}", aggregateId, e);
            throw new RuntimeException("Outbox error", e);
        }
    }

    private long validateCoupon(String couponCode, long subtotalPaise) {
        if (couponCode == null || couponCode.isBlank()) return 0L;
        CouponQuote quote = RestClient.create(paymentServiceUrl)
            .post()
            .uri("/api/v1/payments/coupons/apply")
            .body(new CouponRequest(couponCode.trim().toUpperCase(), subtotalPaise))
            .retrieve()
            .body(CouponQuote.class);
        if (quote == null || quote.discountPaise() < 0L || quote.discountPaise() > subtotalPaise) {
            throw new IllegalArgumentException("Invalid coupon response");
        }
        return quote.discountPaise();
    }

    private record CouponRequest(String code, Long orderAmountPaise) {}
    private record CouponQuote(String code, Long discountPaise, Long finalAmountPaise) {}
}
