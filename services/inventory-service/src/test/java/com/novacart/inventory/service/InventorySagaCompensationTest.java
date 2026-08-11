package com.novacart.inventory.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.dto.OrderPlacedPayload;
import com.novacart.inventory.entity.Inventory;
import com.novacart.inventory.entity.Reservation;
import com.novacart.inventory.entity.ReservationStatus;
import com.novacart.inventory.repository.InventoryOutboxRepository;
import com.novacart.inventory.repository.InventoryRepository;
import com.novacart.inventory.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventorySagaCompensationTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private InventoryOutboxRepository outboxRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @InjectMocks
    private InventoryService inventoryService;

    private Inventory sampleInventory;

    @BeforeEach
    void setUp() {
        sampleInventory = Inventory.builder()
            .id("inv-1")
            .productId("prod-100")
            .availableQuantity(10)
            .reservedQuantity(0)
            .version(1L)
            .build();
    }

    @Test
    @DisplayName("Reserving stock deducts available stock and creates active reservation")
    void testReserveStockSuccess() {
        when(inventoryRepository.findByProductId("prod-100")).thenReturn(Optional.of(sampleInventory));

        OrderPlacedPayload payload = new OrderPlacedPayload(
            "order-123", "NC-12345", "user-1",
            List.of(new OrderPlacedPayload.OrderItemPayload("prod-100", "Smartphone", "seller-1", 5000000L, 2, 10000000L)),
            10000000L, "INR", "idemp-1"
        );

        inventoryService.processOrderPlaced(payload, "event-1");

        assertEquals(8, sampleInventory.getAvailableQuantity());
        assertEquals(2, sampleInventory.getReservedQuantity());
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    @DisplayName("Compensation Path: Payment failure releases reserved stock back to available pool")
    void testCompensationPathReleaseStock() {
        Reservation activeReservation = Reservation.builder()
            .id("res-1")
            .orderId("order-123")
            .productId("prod-100")
            .quantity(2)
            .status(ReservationStatus.ACTIVE)
            .build();

        sampleInventory.setAvailableQuantity(8);
        sampleInventory.setReservedQuantity(2);

        when(reservationRepository.findByOrderId("order-123")).thenReturn(List.of(activeReservation));
        when(inventoryRepository.findByProductId("prod-100")).thenReturn(Optional.of(sampleInventory));

        inventoryService.releaseReservation("order-123", "Payment Failed");

        assertEquals(10, sampleInventory.getAvailableQuantity(), "Available stock must be restored on compensation");
        assertEquals(0, sampleInventory.getReservedQuantity(), "Reserved quantity must reset");
        assertEquals(ReservationStatus.RELEASED, activeReservation.getStatus());
    }
}
