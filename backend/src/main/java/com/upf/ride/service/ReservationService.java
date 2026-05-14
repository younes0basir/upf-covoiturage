package com.upf.ride.service;

import com.upf.ride.dto.request.ReservationRequest;
import com.upf.ride.dto.response.ReservationResponse;
import com.upf.ride.entity.*;
import com.upf.ride.entity.enums.ReservationStatus;
import com.upf.ride.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final org.springframework.context.ApplicationContext context;

    @Transactional
    public ReservationResponse reserve(ReservationRequest req, String passengerEmail) {
        User passenger = userRepository.findByEmail(passengerEmail).orElseThrow();
        Trip trip = tripRepository.findById(req.getTripId())
                .orElseThrow(() -> new IllegalArgumentException("Trajet introuvable"));

        if (reservationRepository.existsByTripIdAndPassengerId(trip.getId(), passenger.getId()))
            throw new IllegalStateException("Vous avez déjà une réservation pour ce trajet");

        Reservation r = Reservation.builder()
                .trip(trip)
                .passenger(passenger)
                .seatsReserved(req.getSeatsReserved())
                .status(ReservationStatus.PENDING)
                .build();

        return toResponse(reservationRepository.save(r));
    }

    public List<ReservationResponse> getMyReservations(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return reservationRepository.findByPassengerId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    public List<ReservationResponse> getReservationsForTrip(UUID tripId, String driverEmail) {
        return reservationRepository.findByTripId(tripId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReservationResponse updateStatus(UUID reservationId, ReservationStatus newStatus, String actorEmail) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable"));
        r.setStatus(newStatus);
        return toResponse(reservationRepository.save(r));
    }

    @Transactional
    public void cancel(UUID reservationId, String passengerEmail) {
        User passenger = userRepository.findByEmail(passengerEmail).orElseThrow();
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable"));
        if (!r.getPassenger().getId().equals(passenger.getId()))
            throw new IllegalStateException("Action non autorisée");
        r.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(r);
    }

    private ReservationResponse toResponse(Reservation r) {
        TripService tripService = context.getBean(TripService.class);
        return ReservationResponse.builder()
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
