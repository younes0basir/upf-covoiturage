package com.upf.ride.controller;

import com.upf.ride.dto.request.UpdateUserRequest;
import com.upf.ride.dto.response.UserResponse;
import com.upf.ride.entity.User;
import com.upf.ride.repository.UserRepository;
import com.upf.ride.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(AuthService.toUserResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateUserRequest req) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        if (req.getFirstName() != null && !req.getFirstName().isBlank())
            user.setFirstName(req.getFirstName());
        if (req.getLastName() != null && !req.getLastName().isBlank())
            user.setLastName(req.getLastName());
        if (req.getPhone() != null)
            user.setPhone(req.getPhone());
        if (req.getStudentCardNumber() != null)
            user.setStudentCardNumber(req.getStudentCardNumber());
        if (req.getGender() != null)
            user.setGender(req.getGender());

        // Password change
        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getCurrentPassword() == null || !passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().build();
            }
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(AuthService.toUserResponse(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable java.util.UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        return ResponseEntity.ok(AuthService.toUserResponse(user));
    }
}
