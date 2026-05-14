package com.upf.ride.dto.response;

import com.upf.ride.entity.enums.PassengerGenderPreference;
import com.upf.ride.entity.enums.TripStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class TripResponse {
    private UUID id;
    private DriverSummary driver;
    private VehicleResponse vehicle;
    private LocationResponse departureLocation;
    private LocationResponse destinationLocation;
    private OffsetDateTime departureTime;
    private Integer availableSeats;
    private BigDecimal driverPrice;
    private BigDecimal serviceFee;
    private BigDecimal totalPrice;
    private PassengerGenderPreference passengerGenderPreference;
    private BigDecimal distanceKm;
    private Integer estimatedDurationMinutes;
    private TripStatus status;
    private String notes;
    private OffsetDateTime createdAt;
    private java.util.List<ReservationSummary> reservations;

    @Data @Builder
    public static class DriverSummary {
        private UUID id;
        private String firstName;
        private String lastName;
        private BigDecimal averageRating;
        private Integer totalRides;
    }

    @Data @Builder
    public static class ReservationSummary {
        private UUID id;
        private UserResponse passenger;
        private Integer seatsReserved;
        private com.upf.ride.entity.enums.ReservationStatus status;
        private OffsetDateTime createdAt;
    }
}
