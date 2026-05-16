package com.upf.ride.service;

import com.upf.ride.entity.Location;
import com.upf.ride.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocationResolver {

    private final LocationRepository locationRepository;

    public Optional<UUID> resolve(String name) {
        if (name == null || name.isEmpty()) return Optional.empty();

        // 1. Try exact match
        List<Location> locations = locationRepository.findByNameContainingIgnoreCase(name);
        if (!locations.isEmpty()) {
            return Optional.of(locations.get(0).getId());
        }

        // 2. Try city match
        List<Location> byCity = locationRepository.findByCityIgnoreCase(name);
        if (!byCity.isEmpty()) {
            return Optional.of(byCity.get(0).getId());
        }

        return Optional.empty();
    }
}
