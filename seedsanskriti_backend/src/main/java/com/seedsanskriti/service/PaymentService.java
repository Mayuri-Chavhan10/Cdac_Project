package com.seedsanskriti.service;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.seedsanskriti.dto.PaymentRequest;
import com.seedsanskriti.dto.PaymentResponse;

public interface PaymentService {

    PaymentResponse pay(
            PaymentRequest request,
            Authentication authentication);

    List<PaymentResponse> getMyPayments(
            Authentication authentication);

    PaymentResponse getPaymentById(
            Long paymentId,
            Authentication authentication);
}