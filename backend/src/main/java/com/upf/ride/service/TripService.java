package com.upf.ride.service;

import com.upf.ride.dto.request.TripRequest;
import com.upf.ride.dto.response.*;
import com.upf.ride.entity.*;
import com.upf.ride.entity.enums.TripStatus;
import com.upf.ride.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    @Transactional
    public TripResponse createTrip(TripRequest req, String driverEmail) {
        User user = userRepository.findByEmail(driverEmail).orElseThrow();
        DriverProfile driver = driverProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Vous n'avez pas de profil conducteur"));

        Vehicle vehicle = vehicleRepository.findById(req.getVehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Véhicule introuvable"));

        Location departure = locationRepository.findById(req.getDepartureLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Lieu de départ introuvable"));

        Location destination = locationRepository.findById(req.getDestinationLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Destination introuvable"));

        Trip trip = Trip.builder()
                .driver(driver)
                .vehicle(vehicle)
                .departureLocation(departure)
                .destinationLocation(destination)
                .departureTime(req.getDepartureTime())
                .availableSeats(req.getAvailableSeats())
                .driverPrice(req.getDriverPrice())
                .passengerGenderPreference(req.getPassengerGenderPreference())
                .notes(req.getNotes())
                .status(TripStatus.SCHEDULED)
                .build();

        return toResponse(tripRepository.save(trip));
    }

    public List<TripResponse> searchTrips(UUID fromId, UUID toId, OffsetDateTime from, int seats) {
        return tripRepository.searchTrips(fromId, toId, from, seats)
                .stream().map(this::toResponse).toList();
    }

    public List<TripResponse> getAllScheduled() {
        return tripRepository.findByStatus(TripStatus.SCHEDULED)
                .stream().map(this::toResponse).toList();
    }

    public TripResponse getById(UUID id) {
        return toResponse(tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trajet introuvable")));
    }

    public List<TripResponse> getMyTripsAsDriver(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        DriverProfile driver = driverProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Profil conducteur introuvable"));
        return tripRepository.findAllByDriverId(driver.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public TripResponse updateStatus(UUID tripId, TripStatus newStatus, String email) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trajet introuvable"));
        User user = userRepository.findByEmail(email).orElseThrow();
        if (!trip.getDriver().getUser().getId().equals(user.getId()))
            throw new IllegalStateException("Action non autorisée");
        trip.setStatus(newStatus);
        return toResponse(tripRepository.save(trip));
    }

    public TripResponse toResponse(Trip t) {
        return TripResponse.builder()
                .id(t.getId())
                .driver(TripResponse.DriverSummary.builder()
                        .id(t.getDriver().getId())
                        .firstName(t.getDriver().getUser().getFirstName())
                        .lastName(t.getDriver().getUser().getLastName())
                        .averageRating(t.getDriver().getAverageRating())
                        .totalRides(t.getDriver().getTotalRides())
                        .build())
                .vehicle(VehicleResponse.builder()
                        .id(t.getVehicle().getId())
                        .brand(t.getVehicle().getBrand())
                        .model(t.getVehicle().getModel())
                        .color(t.getVehicle().getColor())
                        .plateNumber(t.getVehicle().getPlateNumber())
                        .seats(t.getVehicle().getSeats())
                        .build())
                .departureLocation(toLocationResponse(t.getDepartureLocation()))
                .destinationLocation(toLocationResponse(t.getDestinationLocation()))
                .departureTime(t.getDepartureTime())
                .availableSeats(t.getAvailableSeats())
                .driverPrice(t.getDriverPrice())
                .serviceFee(t.getServiceFee())
                .totalPrice(t.getTotalPrice())
                .passengerGenderPreference(t.getPassengerGenderPreference())
                .distanceKm(t.getDistanceKm())
                .estimatedDurationMinutes(t.getEstimatedDurationMinutes())
                .status(t.getStatus())
                .notes(t.getNotes())
                .createdAt(t.getCreatedAt())
                .reservations(t.getReservations() != null ? t.getReservations().stream().map(r -> TripResponse.ReservationSummary.builder()
                        .id(r.getId())
                        .passenger(AuthService.toUserResponse(r.getPassenger()))
                        .seatsReserved(r.getSeatsReserved())
                        .status(r.getStatus())
                        .createdAt(r.getCreatedAt())
                        .build()).toList() : java.util.Collections.emptyList())
                .build();
    }

    private LocationResponse toLocationResponse(Location l) {
        return LocationResponse.builder()
                .id(l.getId())
                .name(l.getName())
                .address(l.getAddress())
                .formattedAddress(l.getFormattedAddress())
                .city(l.getCity())
                .latitude(l.getLatitude())
                .longitude(l.getLongitude())
                .isUniversity(l.getIsUniversity())
                .build();
    }
}
