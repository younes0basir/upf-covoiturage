package com.upf.ride.repository;

import com.upf.ride.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByStudentCardNumber(String studentCardNumber);
    Optional<User> findByVerificationToken(String verificationToken);
    long countByVerified(Boolean verified);
}
