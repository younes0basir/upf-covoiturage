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

import java.time.OffsetDateTime;
import java.util.*;

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

    private static final String SYSTEM_PROMPT = """
        You are the UPF-Ride Omni-Agent, a helpful AI concierge for the University Privée de Fès (UPF).
        
        Available Actions:
        1. SEARCH_TRIPS: params { destination, date }
        2. CREATE_TRIP: params { departure, destination, date, time, seats }
        3. GET_MY_RIDES: no params
        
        Rules:
        - ALWAYS respond in JSON.
        - Use French as the primary communication language for the 'response' field.
        - If the user is ambiguous, ask for clarification.
        - If you perform an action, the system will provide the results in the next turn, but for SEARCH_TRIPS, the backend will auto-fill the 'data' in this turn.
        
        Example JSON:
        {
          "thought": "User wants to find a ride.",
          "response": "Je cherche des trajets pour Rabat...",
          "action": { "type": "SEARCH_TRIPS", "params": { "destination": "Rabat", "date": "2026-05-16" } }
        }
        """;

    public Mono<AiResponse> processChat(AiRequest request) {
        WebClient client = webClientBuilder.baseUrl(baseUrl).build();

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        
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
                        
                        Map<String, Object> actionMap = (Map<String, Object>) jsonResponse.get("action");
                        if (actionMap != null) {
                            AiResponse.Action action = new AiResponse.Action();
                            String type = (String) actionMap.get("type");
                            action.setType(type);
                            
                            Map<String, Object> params = (Map<String, Object>) actionMap.get("params");
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
                            }
                            
                            action.setData(actionResultData);
                            aiResponse.setAction(action);
                        }
                        
                        return aiResponse;
                    } catch (Exception e) {
                        log.error("AI Error", e);
                        return AiResponse.builder().response("Désolé, erreur technique AI.").build();
                    }
                });
    }
}
