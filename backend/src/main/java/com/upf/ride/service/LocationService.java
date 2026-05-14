package com.upf.ride.service;

import com.upf.ride.dto.request.LocationRequest;
import com.upf.ride.dto.response.LocationResponse;
import com.upf.ride.entity.Location;
import com.upf.ride.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    public List<LocationResponse> getAll() {
        return locationRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<LocationResponse> getUniversityLocations() {
        return locationRepository.findByIsUniversity(true).stream().map(this::toResponse).toList();
    }

    public List<LocationResponse> search(String query) {
        return locationRepository.findByNameContainingIgnoreCase(query)
                .stream().map(this::toResponse).toList();
    }

    public LocationResponse getById(UUID id) {
        return toResponse(locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lieu introuvable")));
    }

    public LocationResponse create(LocationRequest req) {
        Location location = Location.builder()
                .name(req.getName())
                .address(req.getAddress())
                .formattedAddress(req.getFormattedAddress())
                .city(req.getCity())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .googlePlaceId(req.getGooglePlaceId())
                .isUniversity(req.getIsUniversity())
                .build();
        return toResponse(locationRepository.save(location));
    }

    private LocationResponse toResponse(Location l) {
        return LocationResponse.builder()
                .id(l.getId())
                .name(l.getName())
                .address(l.getAddress())
                .formattedAddress(l.getFormattedAddress())
                .city(l.getCity())
                .latitude(l.getLatitude())
                .longitude(l.getLongitude())
                .isUniversity(l.getIsUniversity())
                .build();
    }
}
