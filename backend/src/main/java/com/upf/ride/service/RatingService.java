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
    private final DriverProfileRepository driverProfileRepository;
    private final ReservationRepository reservationRepository;

    @Transactional
    public RatingResponse submitRating(RatingRequest req, String reviewerEmail) {
        User reviewer = userRepository.findByEmail(reviewerEmail).orElseThrow();
        User reviewed = userRepository.findById(req.getReviewedId())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur évalué introuvable"));
        Trip trip = tripRepository.findById(req.getTripId())
                .orElseThrow(() -> new IllegalArgumentException("Trajet introuvable"));

        // Validation: Reviewer must be part of the trip (either driver or passenger)
        boolean isDriverReviewing = trip.getDriver().getUser().getId().equals(reviewer.getId());
        boolean isPassengerReviewing = reservationRepository.existsByTripIdAndPassengerId(trip.getId(), reviewer.getId());
        
        if (!isDriverReviewing && !isPassengerReviewing) {
            throw new IllegalStateException("Vous ne pouvez évaluer que les participants d'un trajet que vous avez effectué");
        }

        // Validation: Reviewer must be rating a DIFFERENT participant of the same trip
        boolean isReviewedDriver = trip.getDriver().getUser().getId().equals(reviewed.getId());
        boolean isReviewedPassenger = reservationRepository.existsByTripIdAndPassengerId(trip.getId(), reviewed.getId());
        
        if (!isReviewedDriver && !isReviewedPassenger) {
            throw new IllegalStateException("L'utilisateur évalué ne fait pas partie de ce trajet");
        }
        
        if (reviewer.getId().equals(reviewed.getId())) {
            throw new IllegalStateException("Vous ne pouvez pas vous évaluer vous-même");
        }

        if (ratingRepository.existsByTripIdAndReviewerIdAndReviewedId(trip.getId(), reviewer.getId(), reviewed.getId()))
            throw new IllegalStateException("Vous avez déjà évalué cet utilisateur pour ce trajet");

        Rating rating = Rating.builder()
                .trip(trip)
                .reviewer(reviewer)
                .reviewed(reviewed)
                .rating(req.getRating())
                .comment(req.getComment())
                .build();

        Rating saved = ratingRepository.save(rating);

        // Update DriverProfile stats if the reviewed person is a driver
        driverProfileRepository.findByUserId(reviewed.getId()).ifPresent(profile -> {
            List<Rating> allRatings = ratingRepository.findByReviewedId(reviewed.getId());
            double avg = allRatings.stream()
                    .mapToInt(Rating::getRating)
                    .average()
                    .orElse(0.0);
            profile.setAverageRating(java.math.BigDecimal.valueOf(avg));
            profile.setTotalRides(profile.getTotalRides() + 1); // This is an approximation of activity
            driverProfileRepository.save(profile);
        });

        return toResponse(saved);
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
