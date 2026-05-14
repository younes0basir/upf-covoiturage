package com.upf.ride.service;

import com.upf.ride.dto.request.DriverProfileRequest;
import com.upf.ride.dto.request.VehicleRequest;
import com.upf.ride.dto.response.DriverProfileResponse;
import com.upf.ride.dto.response.VehicleResponse;
import com.upf.ride.entity.DriverProfile;
import com.upf.ride.entity.User;
import com.upf.ride.entity.Vehicle;
import com.upf.ride.repository.DriverProfileRepository;
import com.upf.ride.repository.UserRepository;
import com.upf.ride.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Transactional
    public DriverProfileResponse createProfile(DriverProfileRequest req, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        if (driverProfileRepository.existsByUserId(user.getId()))
            throw new IllegalStateException("Vous avez déjà un profil conducteur");

        DriverProfile profile = DriverProfile.builder()
                .user(user)
                .licenseNumber(req.getLicenseNumber())
                .bio(req.getBio())
                .build();

        return toProfileResponse(driverProfileRepository.save(profile));
    }

    public DriverProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return toProfileResponse(driverProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Profil conducteur introuvable")));
    }

    public DriverProfileResponse getProfileById(UUID id) {
        return toProfileResponse(driverProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profil conducteur introuvable")));
    }

    @Transactional
    public VehicleResponse addVehicle(VehicleRequest req, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        DriverProfile driver = driverProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Profil conducteur introuvable"));

        Vehicle vehicle = Vehicle.builder()
                .driver(driver)
                .brand(req.getBrand())
                .model(req.getModel())
                .color(req.getColor())
                .plateNumber(req.getPlateNumber())
                .seats(req.getSeats())
                .build();

        return toVehicleResponse(vehicleRepository.save(vehicle));
    }

    public List<VehicleResponse> getMyVehicles(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        DriverProfile driver = driverProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Profil conducteur introuvable"));
        return vehicleRepository.findByDriverId(driver.getId())
                .stream().map(this::toVehicleResponse).toList();
    }

    @Transactional
    public void deleteVehicle(UUID vehicleId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Vehicle v = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Véhicule introuvable"));
        if (!v.getDriver().getUser().getId().equals(user.getId()))
            throw new IllegalStateException("Action non autorisée");
        vehicleRepository.delete(v);
    }

    private DriverProfileResponse toProfileResponse(DriverProfile dp) {
        return DriverProfileResponse.builder()
                .id(dp.getId())
                .userId(dp.getUser().getId())
                .firstName(dp.getUser().getFirstName())
                .lastName(dp.getUser().getLastName())
                .licenseNumber(dp.getLicenseNumber())
                .bio(dp.getBio())
                .averageRating(dp.getAverageRating())
                .totalRides(dp.getTotalRides())
                .createdAt(dp.getCreatedAt())
                .build();
    }

    private VehicleResponse toVehicleResponse(Vehicle v) {
        return VehicleResponse.builder()
                .id(v.getId())
                .brand(v.getBrand())
                .model(v.getModel())
                .color(v.getColor())
                .plateNumber(v.getPlateNumber())
                .seats(v.getSeats())
                .build();
    }
}
