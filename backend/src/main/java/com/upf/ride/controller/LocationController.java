package com.upf.ride.controller;

import com.upf.ride.dto.request.LocationRequest;
import com.upf.ride.dto.response.LocationResponse;
import com.upf.ride.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    /** GET /api/locations — Toutes les localisations */
    @GetMapping
    public ResponseEntity<List<LocationResponse>> getAll() {
        return ResponseEntity.ok(locationService.getAll());
    }

    /** POST /api/locations — Créer une localisation */
    @PostMapping
    public ResponseEntity<LocationResponse> create(@RequestBody @Valid LocationRequest req) {
        return ResponseEntity.ok(locationService.create(req));
    }

    /** GET /api/locations/university — Lieux universitaires */
    @GetMapping("/university")
    public ResponseEntity<List<LocationResponse>> getUniversity() {
        return ResponseEntity.ok(locationService.getUniversityLocations());
    }

    /** GET /api/locations/search?q=nom — Recherche de lieu */
    @GetMapping("/search")
    public ResponseEntity<List<LocationResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(locationService.search(q));
    }

    /** GET /api/locations/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<LocationResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(locationService.getById(id));
    }
}
