package com.upf.ride.service;

import com.upf.ride.dto.request.LoginRequest;
import com.upf.ride.dto.request.RegisterRequest;
import com.upf.ride.dto.response.AuthResponse;
import com.upf.ride.dto.response.UserResponse;
import com.upf.ride.entity.User;
import com.upf.ride.repository.UserRepository;
import com.upf.ride.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email déjà utilisé");

        String verificationCode = generateCode();

        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .studentCardNumber(req.getStudentCardNumber())
                .gender(req.getGender())
                .verificationToken(verificationCode)
                .tokenExpiry(OffsetDateTime.now().plusMinutes(15))
                .build();

        userRepository.save(user);

        emailService.sendVerificationCode(user.getEmail(), user.getFirstName(), verificationCode);

        String token = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        User user = userRepository.findByEmail(req.getEmail()).orElseThrow();
        String token = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(user))
                .build();
    }

    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        if (user.getVerified()) {
            throw new IllegalArgumentException("Email déjà vérifié");
        }

        if (user.getVerificationToken() == null || !user.getVerificationToken().equals(code)) {
            throw new IllegalArgumentException("Code de vérification incorrect");
        }

        if (user.getTokenExpiry().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Le code a expiré. Demandez un nouveau code.");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }

    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        if (user.getVerified()) {
            throw new IllegalArgumentException("Email déjà vérifié");
        }

        String newCode = generateCode();
        user.setVerificationToken(newCode);
        user.setTokenExpiry(OffsetDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendVerificationCode(user.getEmail(), user.getFirstName(), newCode);
    }

    private String generateCode() {
        return String.valueOf(100000 + new java.util.Random().nextInt(900000));
    }

    public static UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .studentCardNumber(u.getStudentCardNumber())
                .gender(u.getGender())
                .role(u.getRole())
                .verified(u.getVerified())
                .enabled(u.getEnabled())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
