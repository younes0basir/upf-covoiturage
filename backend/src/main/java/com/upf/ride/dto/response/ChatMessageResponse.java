package com.upf.ride.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class ChatMessageResponse {
    private UUID id;
    private UUID tripId;
    private UserResponse sender;
    private String content;
    private OffsetDateTime createdAt;
}
