package com.seedsanskriti.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.seedsanskriti.dto.PaymentRequest;
import com.seedsanskriti.dto.PaymentResponse;
import com.seedsanskriti.dto.RazorpayOrderRequest;
import com.seedsanskriti.dto.RazorpayOrderResponse;
import com.seedsanskriti.dto.RazorpayVerifyRequest;
import com.seedsanskriti.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Validated
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> pay(
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.pay(request, authentication));
    }

    @GetMapping("/my-payments")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.getMyPayments(authentication));
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long paymentId,
            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(
                        paymentId,
                        authentication));
    }

    // ==========================================================
    // RAZORPAY
    // ==========================================================

    @PostMapping("/razorpay/create-order")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(
            @Valid @RequestBody RazorpayOrderRequest request,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createRazorpayOrder(request, authentication));
    }

    @PostMapping("/razorpay/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> verifyRazorpayPayment(
            @Valid @RequestBody RazorpayVerifyRequest request,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.verifyRazorpayPayment(request, authentication));
    }
}