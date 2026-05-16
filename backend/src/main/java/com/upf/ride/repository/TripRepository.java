package com.upf.ride.repository;

import com.upf.ride.entity.Trip;
import com.upf.ride.entity.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {

    List<Trip> findByDriverIdAndStatus(UUID driverId, TripStatus status);

    List<Trip> findByStatus(TripStatus status);

    @Query("""
            SELECT t FROM Trip t
            WHERE t.departureLocation.id = :fromId
              AND t.destinationLocation.id = :toId
              AND t.status = 'SCHEDULED'
              AND t.departureTime >= :from
              AND t.availableSeats >= :seats
            ORDER BY t.departureTime ASC
            """)
    List<Trip> searchTrips(
            @Param("fromId") UUID fromId,
            @Param("toId") UUID toId,
            @Param("from") OffsetDateTime from,
            @Param("seats") int seats
    );

    /**
     * Fuzzy city/name search — used by the AI when exact location IDs don't match.
     * Matches trips where the departure city/name CONTAINS fromKeyword
     * AND the destination city/name CONTAINS toKeyword (case-insensitive).
     */
    @Query("""
            SELECT t FROM Trip t
            WHERE t.status = 'SCHEDULED'
              AND t.availableSeats >= :seats
              AND (LOWER(t.departureLocation.name) LIKE LOWER(CONCAT('%', :from, '%'))
                OR LOWER(t.departureLocation.city) LIKE LOWER(CONCAT('%', :from, '%')))
              AND (LOWER(t.destinationLocation.name) LIKE LOWER(CONCAT('%', :to, '%'))
                OR LOWER(t.destinationLocation.city) LIKE LOWER(CONCAT('%', :to, '%')))
            ORDER BY t.departureTime ASC
            """)
    List<Trip> searchTripsByLocationName(
            @Param("from") String fromKeyword,
            @Param("to") String toKeyword,
            @Param("seats") int seats
    );

    @Query("SELECT t FROM Trip t WHERE t.driver.id = :driverId ORDER BY t.departureTime DESC")
    List<Trip> findAllByDriverId(@Param("driverId") UUID driverId);
}
