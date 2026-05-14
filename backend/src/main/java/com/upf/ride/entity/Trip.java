package com.upf.ride.entity;

import com.upf.ride.entity.enums.PassengerGenderPreference;
import com.upf.ride.entity.enums.TripStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "trips")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private DriverProfile driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departure_location_id", nullable = false)
    private Location departureLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_location_id", nullable = false)
    private Location destinationLocation;

    @Column(name = "departure_time", nullable = false)
    private OffsetDateTime departureTime;

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    @Builder.Default
    @Column(name = "driver_price", precision = 10, scale = 2)
    private BigDecimal driverPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "service_fee", precision = 10, scale = 2)
    private BigDecimal serviceFee = BigDecimal.ZERO;

    // total_price is GENERATED ALWAYS in DB — read-only
    @Column(name = "total_price", precision = 10, scale = 2, insertable = false, updatable = false)
    private BigDecimal totalPrice;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "passenger_gender_preference", columnDefinition = "passenger_gender_preference")
    private PassengerGenderPreference passengerGenderPreference = PassengerGenderPreference.ANY;

    @Column(name = "distance_km", precision = 10, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(columnDefinition = "TEXT")
    private String polyline;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "trip_status")
    private TripStatus status = TripStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Reservation> reservations;
}
