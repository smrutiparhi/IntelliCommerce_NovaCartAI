package com.novacart.inventory.repository;

import com.novacart.inventory.entity.Reservation;
import com.novacart.inventory.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
    List<Reservation> findByOrderId(String orderId);
    List<Reservation> findByStatusAndExpiresAtBefore(ReservationStatus status, Instant now);
}
