package com.upf.ride.repository;

import com.upf.ride.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findByDriverId(UUID driverId);
    boolean existsByPlateNumber(String plateNumber);
}
