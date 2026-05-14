package com.upf.ride.repository;

import com.upf.ride.entity.DriverProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DriverProfileRepository extends JpaRepository<DriverProfile, UUID> {
    Optional<DriverProfile> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}
