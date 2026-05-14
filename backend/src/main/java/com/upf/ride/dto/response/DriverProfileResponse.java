package com.upf.ride.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class DriverProfileResponse {
    private UUID id;
    private UUID userId;
    private String firstName;
    private String lastName;
    private String licenseNumber;
    private String bio;
    private BigDecimal averageRating;
    private Integer totalRides;
    private OffsetDateTime createdAt;
}
