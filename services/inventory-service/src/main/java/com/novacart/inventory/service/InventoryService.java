package com.novacart.inventory.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.novacart.common.event.EventEnvelope;
import com.novacart.common.event.dto.*;
import com.novacart.inventory.entity.Inventory;
import com.novacart.inventory.entity.OutboxMessage;
import com.novacart.inventory.entity.Reservation;
import com.novacart.inventory.entity.ReservationStatus;
import com.novacart.inventory.repository.InventoryOutboxRepository;
import com.novacart.inventory.repository.InventoryRepository;
import com.novacart.inventory.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ReservationRepository reservationRepository;
    private final InventoryOutboxRepository outboxRepository;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Transactional
    public void processOrderPlaced(OrderPlacedPayload payload, String eventId) {
        log.info("Processing OrderPlaced for orderId={}", payload.orderId());

        boolean allAvailable = true;
        List<StockReservedPayload.ReservedItemPayload> reservedItems = new ArrayList<>();

        for (OrderPlacedPayload.OrderItemPayload item : payload.items()) {
            Optional<Inventory> invOpt = inventoryRepository.findByProductId(item.productId());
            if (invOpt.isEmpty() || invOpt.get().getAvailableQuantity() < item.quantity()) {
                allAvailable = false;
                log.warn("Insufficient stock for productId={}. Requested={}, Available={}",
                    item.productId(), item.quantity(), invOpt.map(Inventory::getAvailableQuantity).orElse(0));
                break;
            }
        }

        if (!allAvailable) {
            // Out of stock compensation
            saveOutboxEvent(payload.orderId(), "inventory.reservation-failed",
                new StockReservationFailedPayload(payload.orderId(), "Insufficient stock for one or more items"));
            return;
        }

        // Deduct stock and create reservations
        Instant expiresAt = Instant.now().plusSeconds(15 * 60); // 15-min TTL
        String reservationId = UUID.randomUUID().toString();

        for (OrderPlacedPayload.OrderItemPayload item : payload.items()) {
            Inventory inv = inventoryRepository.findByProductId(item.productId()).orElseThrow();
            inv.setAvailableQuantity(inv.getAvailableQuantity() - item.quantity());
            inv.setReservedQuantity(inv.getReservedQuantity() + item.quantity());
            inventoryRepository.save(inv);

            Reservation reservation = Reservation.builder()
                .id(UUID.randomUUID().toString())
                .orderId(payload.orderId())
                .productId(item.productId())
                .quantity(item.quantity())
                .status(ReservationStatus.ACTIVE)
                .expiresAt(expiresAt)
                .build();
            reservationRepository.save(reservation);

            reservedItems.add(new StockReservedPayload.ReservedItemPayload(item.productId(), item.quantity()));
        }

        StockReservedPayload stockReservedPayload = new StockReservedPayload(
            payload.orderId(), reservationId, reservedItems, expiresAt
        );

        saveOutboxEvent(payload.orderId(), "inventory.stock-reserved", stockReservedPayload);
        log.info("Stock reserved successfully for orderId={}, expiresAt={}", payload.orderId(), expiresAt);
    }

    @Transactional
    public void confirmReservation(String orderId) {
        List<Reservation> reservations = reservationRepository.findByOrderId(orderId);
        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.ACTIVE) {
                reservation.setStatus(ReservationStatus.CONFIRMED);
                reservationRepository.save(reservation);

                inventoryRepository.findByProductId(reservation.getProductId()).ifPresent(inv -> {
                    inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - reservation.getQuantity()));
                    inventoryRepository.save(inv);
                });
            }
        }
        log.info("Reservations confirmed for orderId={}", orderId);
    }

    @Transactional
    public void releaseReservation(String orderId, String reason) {
        List<Reservation> reservations = reservationRepository.findByOrderId(orderId);
        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.ACTIVE) {
                reservation.setStatus(ReservationStatus.RELEASED);
                reservationRepository.save(reservation);

                inventoryRepository.findByProductId(reservation.getProductId()).ifPresent(inv -> {
                    inv.setAvailableQuantity(inv.getAvailableQuantity() + reservation.getQuantity());
                    inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - reservation.getQuantity()));
                    inventoryRepository.save(inv);
                });
            }
        }
        log.info("Reservations released (compensation) for orderId={}, reason={}", orderId, reason);
    }

    @Scheduled(fixedDelay = 60000) // Cleanup expired 15-min TTL reservations every minute
    @Transactional
    public void cleanupExpiredReservations() {
        List<Reservation> expiredReservations = reservationRepository
            .findByStatusAndExpiresAtBefore(ReservationStatus.ACTIVE, Instant.now());
        
        if (!expiredReservations.isEmpty()) {
            log.info("Cleaning up {} expired reservations", expiredReservations.size());
            for (Reservation reservation : expiredReservations) {
                reservation.setStatus(ReservationStatus.EXPIRED);
                reservationRepository.save(reservation);

                inventoryRepository.findByProductId(reservation.getProductId()).ifPresent(inv -> {
                    inv.setAvailableQuantity(inv.getAvailableQuantity() + reservation.getQuantity());
                    inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - reservation.getQuantity()));
                    inventoryRepository.save(inv);
                });
            }
        }
    }

    private void saveOutboxEvent(String aggregateId, String eventType, Object payload) {
        try {
            EventEnvelope<Object> envelope = new EventEnvelope<>(
                UUID.randomUUID().toString(),
                eventType,
                1,
                Instant.now(),
                "inventory-service",
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
            log.error("Error creating outbox message for aggregateId={}", aggregateId, e);
            throw new RuntimeException("Outbox serialization error", e);
        }
    }
}
