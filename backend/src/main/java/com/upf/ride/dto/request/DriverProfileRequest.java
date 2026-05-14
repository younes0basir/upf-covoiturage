package com.upf.ride.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DriverProfileRequest {
    @NotBlank
    private String licenseNumber;

    private String bio;
}
