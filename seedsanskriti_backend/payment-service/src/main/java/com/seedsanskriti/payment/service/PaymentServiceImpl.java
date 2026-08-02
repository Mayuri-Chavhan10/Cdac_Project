package com.seedsanskriti.payment.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.seedsanskriti.payment.dto.PaymentRequest;
import com.seedsanskriti.payment.dto.PaymentResponse;
import com.seedsanskriti.payment.dto.RazorpayOrderRequest;
import com.seedsanskriti.payment.dto.RazorpayOrderResponse;
import com.seedsanskriti.payment.dto.RazorpayVerifyRequest;
import com.seedsanskriti.payment.entity.Payment;
import com.seedsanskriti.payment.enums.PaymentMethod;
import com.seedsanskriti.payment.enums.PaymentStatus;
import com.seedsanskriti.payment.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Business logic ported from the monolith's PaymentServiceImpl. The core
 * Razorpay integration (create order, verify signature, resolve payment
 * method) and payment persistence is unchanged. What's gone is everything
 * that used to touch Order/Delivery/User directly - order/user validation
 * now happens in main-service *before* it calls in here, and confirming the
 * order + creating the delivery record happens in main-service *after* this
 * returns successfully. See main-service's PaymentServiceImpl for that side.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public PaymentResponse pay(PaymentRequest request) {

        assertNoExistingPayment(request.getOrderId());

        String transactionId = "TXN-" + UUID.randomUUID().toString()
                .substring(0, 8)
                .toUpperCase();

        Payment payment = recordSuccessfulPayment(
                request.getOrderId(),
                request.getUserId(),
                request.getAmount(),
                request.getPaymentMethod(),
                transactionId,
                null,
                null);

        return mapToResponse(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsForUser(Long userId) {

        List<Payment> payments = paymentRepository.findByUserIdOrderByPaymentDateDesc(userId);

        List<PaymentResponse> responseList = new ArrayList<>();
        for (Payment payment : payments) {
            responseList.add(mapToResponse(payment));
        }
        return responseList;
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId, Long userId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"));

        if (!payment.getUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to view this payment");
        }

        return mapToResponse(payment);
    }

    // ==========================================================
    // RAZORPAY
    // ==========================================================

    @Override
    public RazorpayOrderResponse createRazorpayOrder(RazorpayOrderRequest request) {

        assertNoExistingPayment(request.getOrderId());

        // Razorpay expects the amount in the smallest currency unit (paise).
        long amountInPaise = Math.round(request.getAmount() * 100);

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "order_rcpt_" + request.getOrderId());
            orderRequest.put("payment_capture", 1);

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            RazorpayOrderResponse response = new RazorpayOrderResponse();
            response.setOrderId(request.getOrderId());
            response.setRazorpayOrderId(razorpayOrder.get("id"));
            response.setAmount(amountInPaise);
            response.setCurrency("INR");
            response.setKeyId(razorpayKeyId);

            return response;

        } catch (RazorpayException ex) {
            log.error("Failed to create Razorpay order for order {}", request.getOrderId(), ex);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to initiate payment with Razorpay. Please try again.");
        }
    }

    @Override
    @Transactional
    public PaymentResponse verifyRazorpayPayment(RazorpayVerifyRequest request) {

        assertNoExistingPayment(request.getOrderId());

        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", request.getRazorpayOrderId());
        attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
        attributes.put("razorpay_signature", request.getRazorpaySignature());

        boolean signatureValid;
        try {
            signatureValid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
        } catch (RazorpayException ex) {
            log.error("Razorpay signature verification error for order {}", request.getOrderId(), ex);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment verification failed. Please contact support if the amount was debited.");
        }

        if (!signatureValid) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment verification failed: signature mismatch.");
        }

        PaymentMethod method = resolveRazorpayPaymentMethod(request.getRazorpayPaymentId());

        Payment payment = recordSuccessfulPayment(
                request.getOrderId(),
                request.getUserId(),
                request.getAmount(),
                method,
                request.getRazorpayPaymentId(),
                request.getRazorpayOrderId(),
                request.getRazorpaySignature());

        return mapToResponse(payment);
    }

    /**
     * Best-effort lookup of the actual payment method the customer used
     * inside the Razorpay Checkout widget (card / upi / netbanking / wallet).
     * Falls back to CARD if the lookup fails for any reason - this is purely
     * cosmetic (for display in Payment History) and must never block a
     * payment that Razorpay has already confirmed via signature.
     */
    private PaymentMethod resolveRazorpayPaymentMethod(String razorpayPaymentId) {
        try {
            com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(razorpayPaymentId);

            String method = razorpayPayment.get("method");

            if (method == null) {
                return PaymentMethod.CARD;
            }

            return switch (method) {
                case "upi" -> PaymentMethod.UPI;
                case "netbanking" -> PaymentMethod.NET_BANKING;
                default -> PaymentMethod.CARD;
            };
        } catch (Exception ex) {
            log.warn("Could not resolve Razorpay payment method for {}", razorpayPaymentId, ex);
            return PaymentMethod.CARD;
        }
    }

    // ==========================================================
    // ADMIN
    // ==========================================================

    @Override
    public List<PaymentResponse> getAllPayments() {

        List<Payment> payments = paymentRepository.findAll();

        List<PaymentResponse> responseList = new ArrayList<>();
        for (Payment payment : payments) {
            responseList.add(mapToResponse(payment));
        }
        return responseList;
    }

    @Override
    public PaymentResponse getPaymentByIdForAdmin(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"));

        return mapToResponse(payment);
    }

    @Override
    @Transactional
    public void markRefundedIfExists(Long orderId) {
        paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        });
    }

    @Override
    public double getTotalRevenue(String statusName) {

        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(statusName);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown payment status: " + statusName);
        }

        return paymentRepository.sumAmountByPaymentStatus(status);
    }

    // ==========================================================
    // SHARED HELPERS
    // ==========================================================

    /**
     * Preserves the monolith's "one payment per order" invariant. This used
     * to be checked as part of validateOrderForPayment() in the same
     * service that owned Order; now that Payment is the only entity this
     * service knows about, it enforces the rule itself (also backed by a DB
     * unique constraint on order_id as a second line of defense).
     */
    private void assertNoExistingPayment(Long orderId) {
        if (paymentRepository.existsByOrderId(orderId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payment already exists for this order");
        }
    }

    private Payment recordSuccessfulPayment(
            Long orderId,
            Long userId,
            double amount,
            PaymentMethod paymentMethod,
            String transactionId,
            String razorpayOrderId,
            String razorpaySignature) {

        Payment payment = new Payment();

        payment.setOrderId(orderId);
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId(transactionId);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {

        PaymentResponse response = new PaymentResponse();

        response.setPaymentId(payment.getId());
        response.setOrderId(payment.getOrderId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentDate(payment.getPaymentDate());
        response.setRazorpayOrderId(payment.getRazorpayOrderId());

        return response;
    }
}
