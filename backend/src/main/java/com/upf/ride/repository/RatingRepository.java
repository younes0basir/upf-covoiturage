package com.upf.ride.repository;

import com.upf.ride.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RatingRepository extends JpaRepository<Rating, UUID> {
    List<Rating> findByReviewedId(UUID reviewedId);
    List<Rating> findByReviewerId(UUID reviewerId);
    List<Rating> findByTripId(UUID tripId);
    boolean existsByTripIdAndReviewerIdAndReviewedId(UUID tripId, UUID reviewerId, UUID reviewedId);
}
