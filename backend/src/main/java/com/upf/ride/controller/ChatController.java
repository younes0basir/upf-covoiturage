package com.upf.ride.controller;

import com.upf.ride.dto.response.ChatMessageResponse;
import com.upf.ride.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{tripId}")
    public void processMessage(
            @DestinationVariable UUID tripId,
            @Payload String content,
            Principal principal) {

        if (principal == null) {
            return; // Unauthenticated — silently ignore
        }

        ChatMessageResponse response = chatService.saveMessage(tripId, principal.getName(), content);
        messagingTemplate.convertAndSend("/topic/trip/" + tripId, response);
    }

    @GetMapping("/{tripId}/history")
    public ResponseEntity<List<ChatMessageResponse>> getHistory(@PathVariable UUID tripId) {
        return ResponseEntity.ok(chatService.getMessagesByTrip(tripId));
    }
}
