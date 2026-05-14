package com.upf.ride.controller;

import com.upf.ride.dto.response.ReportResponse;
import com.upf.ride.dto.response.UserResponse;
import com.upf.ride.entity.User;
import com.upf.ride.entity.enums.ReportStatus;
import com.upf.ride.entity.enums.UserRole;
import com.upf.ride.repository.ReservationRepository;
import com.upf.ride.repository.TripRepository;
import com.upf.ride.repository.UserRepository;
import com.upf.ride.service.AuthService;
import com.upf.ride.service.ReportService;
import com.upf.ride.service.TripService;
import com.upf.ride.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final ReservationRepository reservationRepository;
    private final ReportService reportService;
    private final TripService tripService;
    private final ReservationService reservationService;

    /** GET /api/admin/stats — Dashboard statistics */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long verifiedUsers = userRepository.countByVerified(true);
        long totalTrips = tripRepository.count();
        long totalReservations = reservationRepository.count();
        long pendingReports = reportService.countPending();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "verifiedUsers", verifiedUsers,
                "totalTrips", totalTrips,
                "totalReservations", totalReservations,
                "pendingReports", pendingReports
        ));
    }

    /** GET /api/admin/users — Tous les utilisateurs */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll()
                .stream().map(AuthService::toUserResponse).toList();
        return ResponseEntity.ok(users);
    }

    /** DELETE /api/admin/users/{id} — Supprimer un utilisateur */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé"));
    }

    /** PATCH /api/admin/users/{id}/role — Changer le rôle */
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable UUID id,
            @RequestParam UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(AuthService.toUserResponse(user));
    }

    /** PATCH /api/admin/users/{id}/verify — Vérifier manuellement */
    @PatchMapping("/users/{id}/verify")
    public ResponseEntity<UserResponse> verifyUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        user.setVerified(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
        return ResponseEntity.ok(AuthService.toUserResponse(user));
    }

    /** PATCH /api/admin/users/{id}/toggle-status — Activer/Désactiver */
    @PatchMapping("/users/{id}/toggle-status")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        user.setEnabled(!user.getEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(AuthService.toUserResponse(user));
    }

    /** GET /api/admin/reports — Tous les signalements */
    @GetMapping("/reports")
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    /** PATCH /api/admin/reports/{id}/status?status=RESOLVED */
    @PatchMapping("/reports/{id}/status")
    public ResponseEntity<ReportResponse> updateReportStatus(
            @PathVariable UUID id,
            @RequestParam ReportStatus status) {
        return ResponseEntity.ok(reportService.updateStatus(id, status));
    }

    /** GET /api/admin/trips — Tous les trajets */
    @GetMapping("/trips")
    public ResponseEntity<List<com.upf.ride.dto.response.TripResponse>> getAllTrips() {
        return ResponseEntity.ok(tripRepository.findAll().stream()
                .map(tripService::toResponse).toList());
    }

    /** DELETE /api/admin/trips/{id} — Supprimer un trajet */
    @DeleteMapping("/trips/{id}")
    public ResponseEntity<Map<String, String>> deleteTrip(@PathVariable UUID id) {
        if (!tripRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        tripRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Trajet supprimé"));
    }

    /** GET /api/admin/reservations — Toutes les réservations */
    @GetMapping("/reservations")
    public ResponseEntity<List<com.upf.ride.dto.response.ReservationResponse>> getAllReservations() {
        return ResponseEntity.ok(reservationRepository.findAll().stream()
                .map(this::toReservationResponse).toList());
    }

    /** DELETE /api/admin/reservations/{id} — Supprimer/Annuler une réservation */
    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<Map<String, String>> deleteReservation(@PathVariable UUID id) {
        if (!reservationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reservationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Réservation supprimée"));
    }

    private com.upf.ride.dto.response.ReservationResponse toReservationResponse(com.upf.ride.entity.Reservation r) {
        return com.upf.ride.dto.response.ReservationResponse.builder()
                .id(r.getId())
                .trip(tripService.toResponse(r.getTrip()))
                .passenger(AuthService.toUserResponse(r.getPassenger()))
                .seatsReserved(r.getSeatsReserved())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
