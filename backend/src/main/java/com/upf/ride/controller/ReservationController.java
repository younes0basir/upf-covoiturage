package com.upf.ride.controller;

import com.upf.ride.dto.request.ReservationRequest;
import com.upf.ride.dto.response.ReservationResponse;
import com.upf.ride.entity.enums.ReservationStatus;
import com.upf.ride.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /** POST /api/reservations — Passager réserve un trajet */
    @PostMapping
    public ResponseEntity<ReservationResponse> reserve(
            @Valid @RequestBody ReservationRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.reserve(req, userDetails.getUsername()));
    }

    /** GET /api/reservations/mine — Mes réservations (passager) */
    @GetMapping("/mine")
    public ResponseEntity<List<ReservationResponse>> myReservations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.getMyReservations(userDetails.getUsername()));
    }

    /** GET /api/reservations/trip/{tripId} — Réservations d'un trajet (conducteur) */
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<ReservationResponse>> tripReservations(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.getReservationsForTrip(tripId, userDetails.getUsername()));
    }

    /** PATCH /api/reservations/{id}/status?status=ACCEPTED — Conducteur accepte/refuse */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ReservationResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam ReservationStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.updateStatus(id, status, userDetails.getUsername()));
    }

    /** DELETE /api/reservations/{id} — Passager annule sa réservation */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        reservationService.cancel(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
