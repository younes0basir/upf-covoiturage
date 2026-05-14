package com.upf.ride.dto.response;

import com.upf.ride.entity.enums.ReportStatus;
import com.upf.ride.entity.enums.ReportType;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class ReportResponse {
    private UUID id;
    private UserResponse reporter;
    private UserResponse reported;
    private UUID tripId;
    private ReportType type;
    private String description;
    private ReportStatus status;
    private OffsetDateTime createdAt;
}
