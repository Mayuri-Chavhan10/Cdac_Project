package com.seedsanskriti.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.seedsanskriti.dto.ChangePasswordRequest;
import com.seedsanskriti.dto.UpdateProfileRequest;
import com.seedsanskriti.dto.UserResponse;
import com.seedsanskriti.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {

        return ResponseEntity.ok(userService.getMyProfile(authentication));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(userService.updateMyProfile(request, authentication));
    }

    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(userService.changePassword(request, authentication));
    }
}
