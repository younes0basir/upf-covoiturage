package com.upf.ride.dto.request;

import com.upf.ride.entity.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 6)
    private String password;

    private String phone;

    private String studentCardNumber;

    @NotNull
    private Gender gender;
}
