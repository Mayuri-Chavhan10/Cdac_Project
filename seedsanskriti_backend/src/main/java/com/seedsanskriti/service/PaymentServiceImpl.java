package com.seedsanskriti.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.seedsanskriti.dto.PaymentRequest;
import com.seedsanskriti.dto.PaymentResponse;
import com.seedsanskriti.dto.RazorpayOrderRequest;
import com.seedsanskriti.dto.RazorpayOrderResponse;
import com.seedsanskriti.dto.RazorpayVerifyRequest;
import com.seedsanskriti.entity.Delivery;
import com.seedsanskriti.entity.Order;
import com.seedsanskriti.entity.Payment;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.DeliveryStatus;
import com.seedsanskriti.enums.OrderStatus;
import com.seedsanskriti.enums.PaymentMethod;
import com.seedsanskriti.enums.PaymentStatus;
import com.seedsanskriti.repository.DeliveryRepository;
import com.seedsanskriti.repository.OrderRepository;
import com.seedsanskriti.repository.PaymentRepository;
import com.seedsanskriti.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ==========================================================
    // EXISTING FLOW - unchanged behavior/response shape.
    // Now delegates the shared "confirm order + create delivery"
    // logic to finalizePayment() so the Razorpay flow below can
    // reuse it exactly, instead of duplicating it.
    // ==========================================================

    @Override
    @Transactional
    public PaymentResponse pay(
            PaymentRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Order order = validateOrderForPayment(request.getOrderId(), user);

        String transactionId = "TXN-" + UUID.randomUUID().toString()
                .substring(0, 8)
                .toUpperCase();

        Payment payment = finalizePayment(
                order,
                request.getPaymentMethod(),
                transactionId,
                null,
                null);

        return mapToResponse(payment);
    }

    @Override
    public List<PaymentResponse> getMyPayments(
            Authentication authentication) {

        // Logged-in user
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        List<Payment> payments =
                paymentRepository.findByOrderUserId(user.getId());

        List<PaymentResponse> responseList = new ArrayList<>();

        for (Payment payment : payments) {
            responseList.add(mapToResponse(payment));
        }

        return responseList;
    }

    @Override
    public PaymentResponse getPaymentById(
            Long paymentId,
            Authentication authentication) {

        // Logged-in user
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"));

        // Ownership Check
        if (!payment.getOrder().getUser().getId().equals(user.getId())) {
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
    public RazorpayOrderResponse createRazorpayOrder(
            RazorpayOrderRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Order order = validateOrderForPayment(request.getOrderId(), user);

        // Razorpay expects the amount in the smallest currency unit (paise).
        long amountInPaise = Math.round(order.getTotalAmount() * 100);

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "order_rcpt_" + order.getId());
            orderRequest.put("payment_capture", 1);

            com.razorpay.Order razorpayOrder =
                    razorpayClient.orders.create(orderRequest);

            RazorpayOrderResponse response = new RazorpayOrderResponse();
            response.setOrderId(order.getId());
            response.setRazorpayOrderId(razorpayOrder.get("id"));
            response.setAmount(amountInPaise);
            response.setCurrency("INR");
            response.setKeyId(razorpayKeyId);

            return response;

        } catch (RazorpayException ex) {
            log.error("Failed to create Razorpay order for order {}", order.getId(), ex);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to initiate payment with Razorpay. Please try again.");
        }
    }

    @Override
    @Transactional
    public PaymentResponse verifyRazorpayPayment(
            RazorpayVerifyRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Order order = validateOrderForPayment(request.getOrderId(), user);

        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", request.getRazorpayOrderId());
        attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
        attributes.put("razorpay_signature", request.getRazorpaySignature());

        boolean signatureValid;
        try {
            signatureValid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
        } catch (RazorpayException ex) {
            log.error("Razorpay signature verification error for order {}", order.getId(), ex);
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

        Payment payment = finalizePayment(
                order,
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
            com.razorpay.Payment razorpayPayment =
                    razorpayClient.payments.fetch(razorpayPaymentId);

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
    // SHARED HELPERS
    // ==========================================================

    private User getLoggedInUser(Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));
    }

    /**
     * Shared guard used by both the legacy /pay flow and the new Razorpay
     * flow: order must exist, belong to the caller, be in PLACED status, and
     * not already have a payment recorded against it.
     */
    private Order validateOrderForPayment(Long orderId, User user) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to pay for this order");
        }

        if (order.getOrderStatus() != OrderStatus.PLACED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment can only be made for placed orders");
        }

        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment already exists for this order");
        }

        return order;
    }

    /**
     * Records a successful payment, confirms the order, and creates the
     * (initially unassigned) delivery record - exactly what the original
     * pay() method did inline, now shared by both payment flows.
     */
    private Payment finalizePayment(
            Order order,
            PaymentMethod paymentMethod,
            String transactionId,
            String razorpayOrderId,
            String razorpaySignature) {

        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId(transactionId);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setRazorpaySignature(razorpaySignature);

        payment = paymentRepository.save(payment);

        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        Delivery delivery = new Delivery();

        delivery.setOrder(order);
        delivery.setDeliveryStatus(DeliveryStatus.PENDING);

        // These will be assigned later by the admin
        delivery.setDeliveryPartner(null);
        delivery.setTrackingNumber(null);
        delivery.setEstimatedDeliveryDate(null);

        deliveryRepository.save(delivery);

        return payment;
    }

    /**
     * Converts Payment entity to PaymentResponse DTO
     */
    private PaymentResponse mapToResponse(Payment payment) {

        PaymentResponse response = new PaymentResponse();

        response.setPaymentId(payment.getId());
        response.setOrderId(payment.getOrder().getId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentDate(payment.getPaymentDate());
        response.setRazorpayOrderId(payment.getRazorpayOrderId());

        return response;
    }

}
