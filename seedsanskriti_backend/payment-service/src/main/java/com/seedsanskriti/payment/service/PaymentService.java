package com.seedsanskriti.payment.service;

import java.util.List;

import com.seedsanskriti.payment.dto.PaymentRequest;
import com.seedsanskriti.payment.dto.PaymentResponse;
import com.seedsanskriti.payment.dto.RazorpayOrderRequest;
import com.seedsanskriti.payment.dto.RazorpayOrderResponse;
import com.seedsanskriti.payment.dto.RazorpayVerifyRequest;

public interface PaymentService {

    PaymentResponse pay(PaymentRequest request);

    List<PaymentResponse> getPaymentsForUser(Long userId);

    PaymentResponse getPaymentById(Long paymentId, Long userId);

    RazorpayOrderResponse createRazorpayOrder(RazorpayOrderRequest request);

    PaymentResponse verifyRazorpayPayment(RazorpayVerifyRequest request);

    // Admin-facing (no ownership filtering)
    List<PaymentResponse> getAllPayments();

    PaymentResponse getPaymentByIdForAdmin(Long paymentId);

    double getTotalRevenue(String statusName);

    /**
     * Marks the payment for this order as REFUNDED, if one exists. A no-op
     * (not an error) when no payment is on file for the order - mirrors the
     * monolith's Optional.ifPresent() behavior for order cancellation.
     */
    void markRefundedIfExists(Long orderId);
}
