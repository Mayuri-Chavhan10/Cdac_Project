package com.seedsanskriti.payment.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seedsanskriti.payment.dto.PaymentRequest;
import com.seedsanskriti.payment.dto.PaymentResponse;
import com.seedsanskriti.payment.dto.RazorpayOrderRequest;
import com.seedsanskriti.payment.dto.RazorpayOrderResponse;
import com.seedsanskriti.payment.dto.RazorpayVerifyRequest;
import com.seedsanskriti.payment.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Internal, service-to-service API. Not exposed through the API Gateway -
 * only main-service calls these, authenticated via the shared
 * X-Internal-Api-Key header (see InternalApiKeyFilter). Ownership checks
 * that used to be "is this the logged-in user's payment" are done here with
 * an explicit userId parameter supplied by main-service, since this service
 * has no session/JWT-derived user of its own.
 */
@RestController
@RequestMapping("/internal/payments")
@RequiredArgsConstructor
@Validated
public class PaymentInternalController {

    private final PaymentService paymentService;

    @PostMapping("/pay")
    public PaymentResponse pay(@Valid @RequestBody PaymentRequest request) {
        return paymentService.pay(request);
    }

    @GetMapping("/user/{userId}")
    public List<PaymentResponse> getPaymentsForUser(@PathVariable Long userId) {
        return paymentService.getPaymentsForUser(userId);
    }

    @GetMapping("/{paymentId}")
    public PaymentResponse getPaymentById(
            @PathVariable Long paymentId,
            @RequestParam Long userId) {
        return paymentService.getPaymentById(paymentId, userId);
    }

    @PostMapping("/razorpay/create-order")
    public RazorpayOrderResponse createRazorpayOrder(@Valid @RequestBody RazorpayOrderRequest request) {
        return paymentService.createRazorpayOrder(request);
    }

    @PostMapping("/razorpay/verify")
    public PaymentResponse verifyRazorpayPayment(@Valid @RequestBody RazorpayVerifyRequest request) {
        return paymentService.verifyRazorpayPayment(request);
    }

    @PostMapping("/order/{orderId}/refund")
    public void markRefunded(@PathVariable Long orderId) {
        paymentService.markRefundedIfExists(orderId);
    }

    // ---- Admin-facing ----

    @GetMapping
    public List<PaymentResponse> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/admin/{paymentId}")
    public PaymentResponse getPaymentByIdForAdmin(@PathVariable Long paymentId) {
        return paymentService.getPaymentByIdForAdmin(paymentId);
    }

    @GetMapping("/revenue")
    public Double getTotalRevenue(@RequestParam String status) {
        return paymentService.getTotalRevenue(status);
    }
}
