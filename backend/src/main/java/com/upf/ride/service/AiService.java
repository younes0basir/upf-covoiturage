package com.upf.ride.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.upf.ride.dto.ai.AiRequest;
import com.upf.ride.dto.ai.AiResponse;
import com.upf.ride.dto.response.TripResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.*;

import com.upf.ride.repository.UserRepository;
import com.upf.ride.repository.DriverProfileRepository;
import com.upf.ride.repository.VehicleRepository;
import com.upf.ride.entity.User;
import com.upf.ride.entity.DriverProfile;
import com.upf.ride.entity.Vehicle;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiService {

    @Value("${app.ai.nvidia.api-key}")
    private String apiKey;

    @Value("${app.ai.nvidia.base-url}")
    private String baseUrl;

    @Value("${app.ai.nvidia.model}")
    private String model;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final TripService tripService;
    private final LocationResolver locationResolver;
    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;

    private static final String SYSTEM_PROMPT = """
        You are the UPF-Ride Omni-Agent, a helpful AI concierge for the University Privée de Fès (UPF).
        
        Available Actions:
        1. SEARCH_TRIPS: params { destination, date }
        2. CREATE_TRIP: params { departure, destination, date, time, seats, price, preferences }
        3. GET_MY_RIDES: no params
        
        Rules:
        - ALWAYS respond in JSON format containing 'thought', 'response', and 'action'.
        - Use French as the primary language for the 'response' field.
        
        CRITICAL RULE FOR CREATING TRIPS:
        If the user wants to create/publish a trip, DO NOT trigger any creation action immediately.
        You MUST ask the user for the following missing information one by one:
        1. Lieu de départ
        2. Destination finale
        3. Départ prévu (Date et Heure)
        The date value in the final action data MUST be ISO format YYYY-MM-DD.
        4. Nombre de places libres
        5. Prix par place (en DH)
        
        You MUST NOT skip asking for the price.
        If the user answers the seats question with natural text like "1 place", "1 palce", "2 seats", or "one seat", extract the numeric value and continue. Do not reject it only because it contains words or a typo.
        
        CRITICAL: While you are collecting this missing information, you MUST set the "action" field to null. Do NOT invent fake actions like "ASK_DEPARTURE".
        
        Example JSON for asking a question:
        {
          "thought": "I need to know the departure time.",
          "response": "A quelle heure prévoyez-vous de partir ?",
          "action": null
        }
        
        Once you have collected ALL 5 pieces of information, you MUST trigger the 'REQUEST_TRIP_CONFIRMATION' action to show the interactive confirmation buttons to the user in the UI.
        
        Example JSON when you have ALL information:
        {
          "thought": "I have all 5 parameters. I will request confirmation via buttons.",
          "response": "Voici le résumé de votre trajet. Veuillez cliquer sur le bouton ci-dessous pour confirmer.",
          "action": {
            "type": "REQUEST_TRIP_CONFIRMATION",
            "data": { "departure": "Casablanca", "destination": "Fès", "date": "2026-05-18", "time": "10:00", "seats": 1, "price": 80 }
          }
        }
        
        SECURITY RULE:
        You must never say a trip was created. The backend is the only source of truth.
        When a user confirms a trip, only request creation with action CREATE_TRIP.
        The backend will replace your message with a success message only after a real trip is persisted.
        """;

    public Mono<AiResponse> processChat(AiRequest request, java.security.Principal principal) {
        if (isSystemConfirmation(request)) {
            return Mono.just(handleTripConfirmation(request, principal));
        }

        WebClient client = webClientBuilder.baseUrl(baseUrl).build();

        boolean isLoggedIn = principal != null;
        String userContext = isLoggedIn 
            ? "User is logged in as: " + principal.getName() + ". They can search, create trips, and book rides."
            : "User is a GUEST (not logged in). They can SEARCH for trips, but if they try to BOOK or CREATE a trip, you MUST politely tell them they need to log in or register first.";

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT + "\n\n" + userContext));
        
        if (request.getHistory() != null) {
            request.getHistory().forEach(h -> 
                messages.add(Map.of("role", h.getRole(), "content", h.getContent()))
            );
        }
        
        messages.add(Map.of("role", "user", "content", request.getMessage()));

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", 0.1);
        body.put("response_format", Map.of("type", "json_object"));

        return client.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    try {
                        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                        String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
                        Map<String, Object> jsonResponse = objectMapper.readValue(content, Map.class);
                        
                        AiResponse aiResponse = new AiResponse();
                        aiResponse.setResponse((String) jsonResponse.get("response"));
                        
                        Object rawAction = jsonResponse.get("action");
                        Map<String, Object> actionMap = (rawAction instanceof Map) ? (Map<String, Object>) rawAction : null;
                        if (actionMap != null) {
                            AiResponse.Action action = new AiResponse.Action();
                            String type = (String) actionMap.get("type");
                            action.setType(type);
                            
                            // Some LLMs return "data" instead of "params"
                            Map<String, Object> params = (Map<String, Object>) actionMap.get("params");
                            if (params == null) {
                                params = (Map<String, Object>) actionMap.get("data");
                            }
                            Map<String, Object> actionResultData = new HashMap<>(params != null ? params : Map.of());
                            
                            // AUTO-EXECUTE SEARCH
                            if ("SEARCH_TRIPS".equals(type) && params != null) {
                                String destName = (String) params.get("destination");
                                Optional<UUID> destId = locationResolver.resolve(destName);
                                // Default departure from UPF
                                Optional<UUID> fromId = locationResolver.resolve("UPF");
                                
                                if (destId.isPresent() && fromId.isPresent()) {
                                    List<TripResponse> results = tripService.searchTrips(
                                        fromId.get(), destId.get(), OffsetDateTime.now(), 1
                                    );
                                    actionResultData.put("results", results);
                                }
                            } else if ("REQUEST_TRIP_CONFIRMATION".equals(type)) {
                                // Just pass the data to the UI to render the interactive buttons
                                actionResultData.putAll(params != null ? params : Map.of());
                            } else if ("CREATE_TRIP".equals(type) && isLoggedIn) {
                                action.setType("REQUEST_TRIP_CONFIRMATION");
                                aiResponse.setResponse("Voici le résumé de votre trajet. Veuillez confirmer avant la création.");
                                actionResultData.putAll(params != null ? params : Map.of());
                            } else if (!isLoggedIn && ("CREATE_TRIP".equals(type) || "BOOK_RIDE".equals(type))) {
                                // SECURITY FALLBACK: Reject restricted actions for guests
                                action = null;
                                aiResponse.setResponse("Vous devez être connecté pour effectuer cette action. Veuillez vous connecter ou créer un compte d'abord.");
                            }
                            
                            if (action != null) {
                                action.setData(actionResultData);
                            }
                            aiResponse.setAction(action);
                        }
                        
                        return aiResponse;
                    } catch (IllegalArgumentException | IllegalStateException businessError) {
                        log.warn("Business Logic Error during AI Action: {}", businessError.getMessage());
                        return AiResponse.builder()
                                .response("Impossible d'exécuter l'action : " + businessError.getMessage())
                                .build();
                    } catch (Exception e) {
                        log.error("AI Error", e);
                        return AiResponse.builder().response("Désolé, erreur technique AI.").build();
                    }
                });
    }

    private boolean isSystemConfirmation(AiRequest request) {
        return request != null
                && request.getMessage() != null
                && request.getMessage().trim().startsWith("[SYSTEM_CONFIRM]");
    }

    private AiResponse handleTripConfirmation(AiRequest request, java.security.Principal principal) {
        if (principal == null) {
            return AiResponse.builder()
                    .response("Vous devez être connecté pour créer un trajet.")
                    .build();
        }

        try {
            String payload = request.getMessage().trim().substring("[SYSTEM_CONFIRM]".length()).trim();
            if (payload.isBlank()) {
                throw new IllegalArgumentException("confirmation vide");
            }

            Map<String, Object> params = objectMapper.readValue(payload, Map.class);
            TripResponse created = createTripFromConfirmedDraft(params, principal.getName());

            Map<String, Object> data = new HashMap<>(params);
            data.put("createdTrip", created);

            return AiResponse.builder()
                    .response("Votre trajet a été créé avec succès.")
                    .action(AiResponse.Action.builder()
                            .type("CREATE_TRIP")
                            .data(data)
                            .build())
                    .build();
        } catch (IllegalArgumentException | IllegalStateException businessError) {
            log.warn("Trip confirmation rejected: {}", businessError.getMessage());
            return AiResponse.builder()
                    .response("Impossible de créer le trajet : " + businessError.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Trip confirmation failed", e);
            return AiResponse.builder()
                    .response("Impossible de créer le trajet pour le moment.")
                    .build();
        }
    }

    private TripResponse createTripFromConfirmedDraft(Map<String, Object> params, String driverEmail) {
        requireParam(params, "departure");
        requireParam(params, "destination");
        requireParam(params, "date");
        requireParam(params, "time");
        requireParam(params, "seats");
        requireParam(params, "price");

        String departure = params.get("departure").toString();
        String destination = params.get("destination").toString();

        UUID fromId = locationResolver.resolve(departure)
                .orElseThrow(() -> new IllegalArgumentException("lieu de départ introuvable"));
        UUID destId = locationResolver.resolve(destination)
                .orElseThrow(() -> new IllegalArgumentException("destination introuvable"));

        User user = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new IllegalStateException("utilisateur introuvable"));
        DriverProfile driver = driverProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("vous devez compléter votre profil conducteur d'abord"));
        List<Vehicle> vehicles = vehicleRepository.findByDriverId(driver.getId());
        if (vehicles.isEmpty()) {
            throw new IllegalStateException("vous devez d'abord ajouter un véhicule à votre profil");
        }

        com.upf.ride.dto.request.TripRequest tr = new com.upf.ride.dto.request.TripRequest();
        tr.setVehicleId(vehicles.get(0).getId());
        tr.setDepartureLocationId(fromId);
        tr.setDestinationLocationId(destId);
        tr.setDepartureTime(parseDepartureTime(params));
        tr.setAvailableSeats(parsePositiveInt(params.get("seats"), "nombre de places invalide"));
        tr.setDriverPrice(parsePrice(params.get("price")));

        return tripService.createTrip(tr, driverEmail);
    }

    private void requireParam(Map<String, Object> params, String key) {
        Object value = params.get(key);
        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException("information manquante : " + key);
        }
    }

    private OffsetDateTime parseDepartureTime(Map<String, Object> params) {
        Object departureTime = params.get("departureTime");
        if (departureTime != null && !departureTime.toString().isBlank()) {
            return OffsetDateTime.parse(departureTime.toString());
        }

        LocalDate date = parseDate(params.get("date"));
        LocalTime time = parseTime(params.get("time"));
        return LocalDateTime.of(date, time).atOffset(OffsetDateTime.now().getOffset());
    }

    private LocalDate parseDate(Object value) {
        String text = value.toString().trim().toLowerCase(Locale.ROOT);
        if (text.contains("demain") || text.equals("tomorrow")) {
            return LocalDate.now().plusDays(1);
        }
        if (text.contains("aujourd") || text.equals("today")) {
            return LocalDate.now();
        }
        return LocalDate.parse(text);
    }

    private LocalTime parseTime(Object value) {
        String text = value.toString().trim();
        boolean pm = text.toLowerCase(Locale.ROOT).contains("pm");
        text = text.replaceAll("(?i)\\s*(AM|PM)", "").trim();
        LocalTime time = LocalTime.parse(text.length() <= 2 ? text + ":00" : text);
        if (pm && time.getHour() < 12) {
            time = time.plusHours(12);
        }
        return time;
    }

    private int parsePositiveInt(Object value, String message) {
        try {
            String normalized = value.toString()
                    .trim()
                    .toLowerCase(Locale.ROOT)
                    .replace("one", "1")
                    .replace("un", "1")
                    .replace("une", "1");
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\\d+").matcher(normalized);
            if (!matcher.find()) {
                throw new NumberFormatException();
            }

            int parsed = Integer.parseInt(matcher.group());
            if (parsed < 1) {
                throw new NumberFormatException();
            }
            return parsed;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(message);
        }
    }

    private BigDecimal parsePrice(Object value) {
        try {
            String normalized = value.toString().replace(',', '.').replaceAll("[^0-9.]", "");
            BigDecimal price = new BigDecimal(normalized);
            if (price.compareTo(BigDecimal.ZERO) < 0) {
                throw new NumberFormatException();
            }
            return price;
        } catch (Exception e) {
            throw new IllegalArgumentException("prix invalide");
        }
    }
}
