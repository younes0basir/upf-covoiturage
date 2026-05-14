package com.upf.ride.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LocationRequest {
    @NotBlank
    private String name;
    private String address;
    private String formattedAddress;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String googlePlaceId;
    private Boolean isUniversity = false;
}
