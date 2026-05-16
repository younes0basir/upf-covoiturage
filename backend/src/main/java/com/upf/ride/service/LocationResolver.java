package com.upf.ride.service;

import com.upf.ride.entity.Location;
import com.upf.ride.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class LocationResolver {

    private final LocationRepository locationRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${app.google.maps.api-key}")
    private String mapsApiKey;

    /**
     * Resolves a location name to a UUID.
     * 1. Checks local DB first.
     * 2. Falls back to Google Maps Geocoding API and saves the result.
     */
    public Optional<UUID> resolve(String name) {
        if (name == null || name.isBlank()) return Optional.empty();

        String trimmed = name.trim();
        String query = canonicalizeAmbiguousLocation(trimmed);

        // 1. Try name/address match in local DB
        List<Location> byName = locationRepository.findByNameContainingIgnoreCase(query);
        if (!byName.isEmpty()) return Optional.of(byName.get(0).getId());

        // 2. Try city match
        List<Location> byCity = locationRepository.findByCityIgnoreCase(query);
        if (!byCity.isEmpty()) return Optional.of(byCity.get(0).getId());

        // 3. Geocode via Google Maps API
        log.info("Location '{}' not found locally, geocoding via Google Maps as '{}'.", trimmed, query);
        return geocodeAndSave(query);
    }

    private String canonicalizeAmbiguousLocation(String query) {
        String normalized = normalize(query);

        if ((normalized.contains("fes") || normalized.contains("fez"))
                && (normalized.contains("madina") || normalized.contains("medina"))) {
            return "Fes el Bali, Fès";
        }

        return query;
    }

    private String normalize(String value) {
        String withoutAccents = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutAccents.toLowerCase().replaceAll("[^a-z0-9]+", " ").trim();
    }

    private Optional<UUID> geocodeAndSave(String query) {
        try {
            String geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json"
                    + "?address=" + java.net.URLEncoder.encode(query + ", Maroc", "UTF-8")
                    + "&key=" + mapsApiKey
                    + "&language=fr";

            WebClient client = webClientBuilder.build();
            Map<String, Object> response = client.get()
                    .uri(geocodeUrl)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || !"OK".equals(response.get("status"))) {
                log.warn("Geocoding failed for '{}': status={}", query, response != null ? response.get("status") : "null");
                return Optional.empty();
            }

            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results == null || results.isEmpty()) return Optional.empty();

            Map<String, Object> result = results.get(0);
            String formattedAddress = (String) result.get("formatted_address");
            String placeId = (String) result.get("place_id");

            Map<String, Object> geometry = (Map<String, Object>) result.get("geometry");
            Map<String, Object> location = (Map<String, Object>) geometry.get("location");
            double lat = ((Number) location.get("lat")).doubleValue();
            double lng = ((Number) location.get("lng")).doubleValue();

            // Extract city from address_components
            String city = extractCity(result);

            // Extract short name from address components
            String name = extractName(result, query);

            Location newLoc = Location.builder()
                    .name(name)
                    .address(formattedAddress)
                    .formattedAddress(formattedAddress)
                    .city(city)
                    .latitude(BigDecimal.valueOf(lat))
                    .longitude(BigDecimal.valueOf(lng))
                    .googlePlaceId(placeId)
                    .isUniversity(false)
                    .build();

            Location saved = locationRepository.save(newLoc);
            log.info("Auto-saved geocoded location: '{}' → {}", name, saved.getId());
            return Optional.of(saved.getId());

        } catch (Exception e) {
            log.error("Geocoding error for '{}': {}", query, e.getMessage());
            return Optional.empty();
        }
    }

    private String extractCity(Map<String, Object> result) {
        List<Map<String, Object>> components = (List<Map<String, Object>>) result.get("address_components");
        if (components == null) return "Maroc";
        for (Map<String, Object> comp : components) {
            List<String> types = (List<String>) comp.get("types");
            if (types != null && types.contains("locality")) {
                return (String) comp.get("long_name");
            }
        }
        return "Maroc";
    }

    private String extractName(Map<String, Object> result, String fallback) {
        List<Map<String, Object>> components = (List<Map<String, Object>>) result.get("address_components");
        if (components == null || components.isEmpty()) return fallback;
        // Use the most specific address component (first one)
        Object longName = components.get(0).get("long_name");
        return longName != null ? longName.toString() : fallback;
    }
}
