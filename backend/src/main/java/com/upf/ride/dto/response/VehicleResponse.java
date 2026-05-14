package com.upf.ride.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @Builder
public class VehicleResponse {
    private UUID id;
    private String brand;
    private String model;
    private String color;
    private String plateNumber;
    private Integer seats;
}
