package com.novacart.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.EventEnvelope;
import com.novacart.common.event.dto.OrderPlacedPayload;
import com.novacart.common.event.dto.StockReservedPayload;
import com.novacart.common.event.dto.PaymentSuccessfulPayload;
import com.novacart.order.dto.CreateOrderRequest;
import com.novacart.order.entity.Order;
import com.novacart.order.entity.OrderStatus;
import com.novacart.order.entity.SagaState;
import com.novacart.order.repository.OrderRepository;
import com.novacart.order.service.OrderService;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class SagaIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("eureka.client.enabled", () -> "false"); // Disable eureka for test
    }

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private BlockingQueue<ConsumerRecord<String, String>> outboxRecords;

    @BeforeEach
    void setUp() {
        outboxRecords = new LinkedBlockingQueue<>();
        orderRepository.deleteAll();
    }

    @KafkaListener(topics = "order.placed", groupId = "test-group")
    public void listen(ConsumerRecord<String, String> record) {
        outboxRecords.add(record);
    }

    @Test
    void testOrderSagaHappyPath() throws Exception {
        // 1. Place an Order
        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest(
            "prod-1", "Laptop", "laptop.png", "seller-1", 5000000L, 1
        );
        CreateOrderRequest request = new CreateOrderRequest(
            "user-1", List.of(item), "{}", null, UUID.randomUUID().toString()
        );

        Order createdOrder = orderService.createOrder(request);

        assertThat(createdOrder).isNotNull();
        assertThat(createdOrder.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(createdOrder.getSagaState()).isEqualTo(SagaState.ORDER_PLACED);

        // 2. Wait for Outbox processor to publish the order.placed event
        ConsumerRecord<String, String> record = outboxRecords.poll(15, TimeUnit.SECONDS);
        assertThat(record).isNotNull();

        // 3. Simulate Inventory Service Success Response
        StockReservedPayload stockReservedPayload = new StockReservedPayload(
            createdOrder.getId(),
            "reservation-1",
            List.of(new StockReservedPayload.ReservedItemPayload("prod-1", 1)),
            java.time.Instant.now().plus(Duration.ofMinutes(15))
        );
        EventEnvelope<StockReservedPayload> inventoryEvent = new EventEnvelope<>(
            UUID.randomUUID().toString(),
            "inventory.stock-reserved",
            1,
            java.time.Instant.now(),
            "inventory-service",
            UUID.randomUUID().toString(),
            createdOrder.getId(),
            stockReservedPayload
        );
        kafkaTemplate.send("inventory.stock-reserved", createdOrder.getId(), inventoryEvent);

        // 4. Await Order status transition to AWAITING_PAYMENT
        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            Order updatedOrder = orderRepository.findById(createdOrder.getId()).orElseThrow();
            assertThat(updatedOrder.getStatus()).isEqualTo(OrderStatus.AWAITING_PAYMENT);
            assertThat(updatedOrder.getSagaState()).isEqualTo(SagaState.STOCK_RESERVED);
        });

        // 5. Simulate Payment Service Success Response
        PaymentSuccessfulPayload paymentPayload = new PaymentSuccessfulPayload(
            createdOrder.getId(),
            "payment-1",
            "order_mock123",
            "pay_mock123",
            5000000L,
            "INR",
            "card"
        );
        EventEnvelope<PaymentSuccessfulPayload> paymentEvent = new EventEnvelope<>(
            UUID.randomUUID().toString(),
            "payment.successful",
            1,
            java.time.Instant.now(),
            "payment-service",
            UUID.randomUUID().toString(),
            createdOrder.getId(),
            paymentPayload
        );
        kafkaTemplate.send("payment.successful", createdOrder.getId(), paymentEvent);

        // 6. Await Order status transition to CONFIRMED
        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            Order updatedOrder = orderRepository.findById(createdOrder.getId()).orElseThrow();
            assertThat(updatedOrder.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
            assertThat(updatedOrder.getSagaState()).isEqualTo(SagaState.PAYMENT_SUCCESSFUL);
        });
    }
}
