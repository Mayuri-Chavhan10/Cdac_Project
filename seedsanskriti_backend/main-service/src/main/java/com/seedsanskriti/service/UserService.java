package com.seedsanskriti.service;

import org.springframework.security.core.Authentication;

import com.seedsanskriti.dto.ChangePasswordRequest;
import com.seedsanskriti.dto.UpdateProfileRequest;
import com.seedsanskriti.dto.UserResponse;

public interface UserService {

    UserResponse getMyProfile(Authentication authentication);

    UserResponse updateMyProfile(UpdateProfileRequest request, Authentication authentication);

    String changePassword(ChangePasswordRequest request, Authentication authentication);
}
