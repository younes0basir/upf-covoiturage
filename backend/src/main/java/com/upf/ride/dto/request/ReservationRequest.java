package com.upf.ride.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReservationRequest {
    @NotNull
    private UUID tripId;

    @NotNull @Min(1)
    private Integer seatsReserved;
}
