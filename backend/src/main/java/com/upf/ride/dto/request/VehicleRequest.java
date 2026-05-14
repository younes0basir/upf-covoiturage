package com.upf.ride.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VehicleRequest {
    @NotBlank
    private String brand;

    @NotBlank
    private String model;

    private String color;

    @NotBlank
    private String plateNumber;

    @NotNull @Min(1)
    private Integer seats;
}
