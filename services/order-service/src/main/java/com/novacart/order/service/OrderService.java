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
            .couponCode(request.couponCode())
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

        order.setSubtotalPaise(subtotalPaise);
        order.setTotalPaise(subtotalPaise); // adjust for taxes/discount if applicable

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

        if (order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.CANCELLED) {
            log.warn("Cannot cancel order in state {}", order.getStatus());
            return order;
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setSagaState(SagaState.ORDER_CANCELLED);
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

    public Page<Order> getOrdersByUserId(String userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
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
}
