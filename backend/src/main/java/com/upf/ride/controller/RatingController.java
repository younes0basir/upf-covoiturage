package com.upf.ride.controller;

import com.upf.ride.dto.request.RatingRequest;
import com.upf.ride.dto.response.RatingResponse;
import com.upf.ride.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    /** POST /api/ratings — Soumettre une évaluation */
    @PostMapping
    public ResponseEntity<RatingResponse> submit(
            @Valid @RequestBody RatingRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ratingService.submitRating(req, userDetails.getUsername()));
    }

    /** GET /api/ratings/user/{userId} — Évaluations reçues par un utilisateur */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RatingResponse>> forUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(ratingService.getRatingsForUser(userId));
    }
}
