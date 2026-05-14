package com.upf.ride.controller;

import com.upf.ride.dto.request.DriverProfileRequest;
import com.upf.ride.dto.request.VehicleRequest;
import com.upf.ride.dto.response.DriverProfileResponse;
import com.upf.ride.dto.response.VehicleResponse;
import com.upf.ride.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    /** POST /api/driver/profile — Créer profil conducteur */
    @PostMapping("/profile")
    public ResponseEntity<DriverProfileResponse> createProfile(
            @Valid @RequestBody DriverProfileRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(driverService.createProfile(req, userDetails.getUsername()));
    }

    /** GET /api/driver/profile/me — Mon profil conducteur */
    @GetMapping("/profile/me")
    public ResponseEntity<DriverProfileResponse> myProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(driverService.getMyProfile(userDetails.getUsername()));
    }

    /** GET /api/driver/profile/{id} — Profil conducteur public */
    @GetMapping("/profile/{id}")
    public ResponseEntity<DriverProfileResponse> getProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(driverService.getProfileById(id));
    }

    /** POST /api/driver/vehicles — Ajouter un véhicule */
    @PostMapping("/vehicles")
    public ResponseEntity<VehicleResponse> addVehicle(
            @Valid @RequestBody VehicleRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(driverService.addVehicle(req, userDetails.getUsername()));
    }

    /** GET /api/driver/vehicles — Mes véhicules */
    @GetMapping("/vehicles")
    public ResponseEntity<List<VehicleResponse>> myVehicles(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(driverService.getMyVehicles(userDetails.getUsername()));
    }

    /** DELETE /api/driver/vehicles/{id} — Supprimer un véhicule */
    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        driverService.deleteVehicle(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
