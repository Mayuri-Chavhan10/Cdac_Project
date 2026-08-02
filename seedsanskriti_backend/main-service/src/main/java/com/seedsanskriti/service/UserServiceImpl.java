package com.seedsanskriti.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.dto.ChangePasswordRequest;
import com.seedsanskriti.dto.UpdateProfileRequest;
import com.seedsanskriti.dto.UserResponse;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getMyProfile(Authentication authentication) {

        User user = getLoggedInUser(authentication);

        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(
            UpdateProfileRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setPincode(request.getPincode());

        userRepository.save(user);

        return mapToResponse(user);
    }

    @Override
    @Transactional
    public String changePassword(
            ChangePasswordRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);

        return "Password changed successfully";
    }

    private User getLoggedInUser(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserResponse mapToResponse(User user) {

        UserResponse response = new UserResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setAddress(user.getAddress());
        response.setCity(user.getCity());
        response.setPincode(user.getPincode());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());

        return response;
    }
}
