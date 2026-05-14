package com.upf.ride.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class RatingRequest {
    @NotNull
    private UUID tripId;

    @NotNull
    private UUID reviewedId;

    @NotNull @Min(1) @Max(5)
    private Integer rating;

    private String comment;
}
