package com.upf.ride.dto.request;

import com.upf.ride.entity.enums.ReportType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReportRequest {
    @NotNull
    private UUID reportedId;

    private UUID tripId;

    @NotNull
    private ReportType type;

    private String description;
}
