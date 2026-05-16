package com.upf.ride.controller;

import com.upf.ride.dto.ai.AiRequest;
import com.upf.ride.dto.ai.AiResponse;
import com.upf.ride.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public Mono<AiResponse> chat(@RequestBody AiRequest request) {
        return aiService.processChat(request);
    }
}
