package com.upf.ride.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class LocationResponse {
    private UUID id;
    private String name;
    private String address;
    private String formattedAddress;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isUniversity;
}
