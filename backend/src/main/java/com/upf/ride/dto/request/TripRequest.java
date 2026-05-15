package com.upf.ride.dto.request;

import com.upf.ride.entity.enums.PassengerGenderPreference;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class TripRequest {
    @NotNull
    private UUID vehicleId;

    @NotNull
    private UUID departureLocationId;

    @NotNull
    private UUID destinationLocationId;

    @NotNull @Future
    private OffsetDateTime departureTime;

    @NotNull @Min(1)
    private Integer availableSeats;

    @NotNull
    private BigDecimal driverPrice;

    private PassengerGenderPreference passengerGenderPreference = PassengerGenderPreference.ANY;

    private String notes;
    private String polyline;
}
