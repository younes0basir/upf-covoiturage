package com.upf.ride.dto.response;

import com.upf.ride.entity.enums.ReservationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class ReservationResponse {
    private UUID id;
    private TripResponse trip;
    private UserResponse passenger;
    private Integer seatsReserved;
    private ReservationStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
