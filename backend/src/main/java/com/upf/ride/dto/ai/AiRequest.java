package com.upf.ride.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AiRequest {
    private String message;
    private List<ChatMessage> history;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChatMessage {
        private String role; // user, assistant, system
        private String content;
    }
}
