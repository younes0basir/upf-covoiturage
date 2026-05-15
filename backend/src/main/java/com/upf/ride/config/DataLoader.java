package com.upf.ride.config;

import com.upf.ride.entity.User;
import com.upf.ride.entity.enums.Gender;
import com.upf.ride.entity.enums.UserRole;
import com.upf.ride.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@upf.ac.ma").isEmpty()) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("UPF")
                    .email("admin@upf.ac.ma")
                    .password(passwordEncoder.encode("admin123"))
                    .gender(Gender.MALE)
                    .role(UserRole.ADMIN)
                    .verified(true)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Admin user created: admin@upf.ac.ma / admin123");
        }
    }
}
