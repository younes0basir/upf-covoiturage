package com.upf.ride.service;

import com.upf.ride.dto.request.RatingRequest;
import com.upf.ride.dto.response.RatingResponse;
import com.upf.ride.entity.*;
import com.upf.ride.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional
    public RatingResponse submitRating(RatingRequest req, String reviewerEmail) {
        User reviewer = userRepository.findByEmail(reviewerEmail).orElseThrow();
        User reviewed = userRepository.findById(req.getReviewedId())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur évalué introuvable"));
        Trip trip = tripRepository.findById(req.getTripId())
                .orElseThrow(() -> new IllegalArgumentException("Trajet introuvable"));

        if (ratingRepository.existsByTripIdAndReviewerIdAndReviewedId(trip.getId(), reviewer.getId(), reviewed.getId()))
            throw new IllegalStateException("Vous avez déjà évalué cet utilisateur pour ce trajet");

        Rating rating = Rating.builder()
                .trip(trip)
                .reviewer(reviewer)
                .reviewed(reviewed)
                .rating(req.getRating())
                .comment(req.getComment())
                .build();

        return toResponse(ratingRepository.save(rating));
    }

    public List<RatingResponse> getRatingsForUser(UUID userId) {
        return ratingRepository.findByReviewedId(userId)
                .stream().map(this::toResponse).toList();
    }

    private RatingResponse toResponse(Rating r) {
        return RatingResponse.builder()
                .id(r.getId())
                .tripId(r.getTrip().getId())
                .reviewer(AuthService.toUserResponse(r.getReviewer()))
                .reviewed(AuthService.toUserResponse(r.getReviewed()))
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
