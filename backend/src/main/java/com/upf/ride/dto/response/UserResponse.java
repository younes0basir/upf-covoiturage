package com.upf.ride.dto.response;

import com.upf.ride.entity.enums.Gender;
import com.upf.ride.entity.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data @Builder
public class UserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String studentCardNumber;
    private Gender gender;
    private UserRole role;
    private Boolean verified;
    private Boolean enabled;
    private OffsetDateTime createdAt;
}
