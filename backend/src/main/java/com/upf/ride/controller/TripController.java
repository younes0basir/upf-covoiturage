package com.upf.ride.controller;

import com.upf.ride.dto.request.TripRequest;
import com.upf.ride.dto.response.TripResponse;
import com.upf.ride.entity.enums.TripStatus;
import com.upf.ride.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    /** GET /api/trips?fromId=&toId=&date=&seats= */
    @GetMapping
    public ResponseEntity<List<TripResponse>> search(
            @RequestParam(required = false) UUID fromId,
            @RequestParam(required = false) UUID toId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime date,
            @RequestParam(defaultValue = "1") int seats) {

        if (fromId != null && toId != null && date != null)
            return ResponseEntity.ok(tripService.searchTrips(fromId, toId, date, seats));

        return ResponseEntity.ok(tripService.getAllScheduled());
    }

    /** GET /api/trips/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(tripService.getById(id));
    }

    /** POST /api/trips — Conducteur publie un trajet */
    @PostMapping
    public ResponseEntity<TripResponse> create(
            @Valid @RequestBody TripRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tripService.createTrip(req, userDetails.getUsername()));
    }

    /** GET /api/trips/mine — Trajets du conducteur connecté */
    @GetMapping("/mine")
    public ResponseEntity<List<TripResponse>> myTrips(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tripService.getMyTripsAsDriver(userDetails.getUsername()));
    }

    /** PATCH /api/trips/{id}/status?status=IN_PROGRESS */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TripResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam TripStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tripService.updateStatus(id, status, userDetails.getUsername()));
    }
}
