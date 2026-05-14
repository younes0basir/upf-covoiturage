package com.upf.ride.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class RatingResponse {
    private UUID id;
    private UUID tripId;
    private UserResponse reviewer;
    private UserResponse reviewed;
    private Integer rating;
    private String comment;
    private OffsetDateTime createdAt;
}
