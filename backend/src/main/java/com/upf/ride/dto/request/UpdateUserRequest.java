package com.upf.ride.dto.request;

import com.upf.ride.entity.enums.Gender;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String studentCardNumber;
    private Gender gender;
    private String currentPassword;
    private String newPassword;
}
