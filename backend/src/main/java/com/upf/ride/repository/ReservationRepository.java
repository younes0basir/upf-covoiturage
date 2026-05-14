package com.upf.ride.repository;

import com.upf.ride.entity.Reservation;
import com.upf.ride.entity.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByPassengerId(UUID passengerId);
    List<Reservation> findByTripId(UUID tripId);
    List<Reservation> findByPassengerIdAndStatus(UUID passengerId, ReservationStatus status);
    Optional<Reservation> findByTripIdAndPassengerId(UUID tripId, UUID passengerId);
    boolean existsByTripIdAndPassengerId(UUID tripId, UUID passengerId);
}
