package com.upf.ride.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AiResponse {
    private String response;
    private Action action;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Action {
        private String type; // e.g., "SEARCH_TRIPS", "CREATE_TRIP"
        private Map<String, Object> data;
    }
}
