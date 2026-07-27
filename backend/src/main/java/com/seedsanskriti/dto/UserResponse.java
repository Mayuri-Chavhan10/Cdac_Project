package com.seedsanskriti.dto;

import com.seedsanskriti.enums.Role;
import com.seedsanskriti.enums.UserStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {

    private Long userId;

    private String name;

    private String email;

    private String phoneNumber;

    private String address;

    private String city;

    private String pincode;

    private Role role;

    private UserStatus status;
}