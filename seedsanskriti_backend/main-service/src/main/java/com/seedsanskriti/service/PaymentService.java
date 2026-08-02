package com.seedsanskriti.service;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.seedsanskriti.dto.PaymentRequest;
import com.seedsanskriti.dto.PaymentResponse;
import com.seedsanskriti.dto.RazorpayOrderRequest;
import com.seedsanskriti.dto.RazorpayOrderResponse;
import com.seedsanskriti.dto.RazorpayVerifyRequest;

public interface PaymentService {

    PaymentResponse pay(
            PaymentRequest request,
            Authentication authentication);

    List<PaymentResponse> getMyPayments(
            Authentication authentication);

    PaymentResponse getPaymentById(
            Long paymentId,
            Authentication authentication);

    // ---- Razorpay ----

    RazorpayOrderResponse createRazorpayOrder(
            RazorpayOrderRequest request,
            Authentication authentication);

    PaymentResponse verifyRazorpayPayment(
            RazorpayVerifyRequest request,
            Authentication authentication);
}