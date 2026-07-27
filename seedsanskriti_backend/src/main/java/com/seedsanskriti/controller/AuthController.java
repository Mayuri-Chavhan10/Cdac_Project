package com.seedsanskriti.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.seedsanskriti.dto.ForgotPasswordRequest;
import com.seedsanskriti.dto.LoginRequest;
import com.seedsanskriti.dto.RegisiterCustomerRequest;
import com.seedsanskriti.dto.RegisterSupplierRequest;
import com.seedsanskriti.dto.ResetPasswordRequest;
import com.seedsanskriti.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/customer")
    public ResponseEntity<String> registerCustomer(
            @Valid @RequestBody RegisiterCustomerRequest request) {

        return ResponseEntity.ok(
                authService.registerCustomer(request));
    }
    
    @PostMapping("/register/supplier")
    public ResponseEntity<String> registerSupplier(
            @Valid @RequestBody RegisterSupplierRequest request) {

        return ResponseEntity.ok(
                authService.registerSupplier(request));
    }
    
    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        return ResponseEntity.ok(
                authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        return ResponseEntity.ok(
                authService.resetPassword(request));
    }
}