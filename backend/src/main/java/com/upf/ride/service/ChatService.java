package com.upf.ride.service;

import com.upf.ride.dto.response.ChatMessageResponse;
import com.upf.ride.entity.ChatMessage;
import com.upf.ride.entity.Trip;
import com.upf.ride.entity.User;
import com.upf.ride.repository.ChatMessageRepository;
import com.upf.ride.repository.TripRepository;
import com.upf.ride.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessageResponse saveMessage(UUID tripId, String senderEmail, String content) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trajet introuvable"));
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        ChatMessage message = ChatMessage.builder()
                .trip(trip)
                .sender(sender)
                .content(content)
                .build();

        return toResponse(chatMessageRepository.save(message));
    }

    public List<ChatMessageResponse> getMessagesByTrip(UUID tripId) {
        return chatMessageRepository.findByTripIdOrderByCreatedAtAsc(tripId)
                .stream().map(this::toResponse).toList();
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        return ChatMessageResponse.builder()
                .id(m.getId())
                .tripId(m.getTrip().getId())
                .sender(AuthService.toUserResponse(m.getSender()))
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
