package com.seedsanskriti.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.client.PaymentServiceClient;
import com.seedsanskriti.client.dto.PaymentInternalRequest;
import com.seedsanskriti.client.dto.PaymentInternalResponse;
import com.seedsanskriti.client.dto.RazorpayOrderInternalRequest;
import com.seedsanskriti.client.dto.RazorpayOrderInternalResponse;
import com.seedsanskriti.client.dto.RazorpayVerifyInternalRequest;
import com.seedsanskriti.dto.PaymentRequest;
import com.seedsanskriti.dto.PaymentResponse;
import com.seedsanskriti.dto.RazorpayOrderRequest;
import com.seedsanskriti.dto.RazorpayOrderResponse;
import com.seedsanskriti.dto.RazorpayVerifyRequest;
import com.seedsanskriti.entity.Delivery;
import com.seedsanskriti.entity.Order;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.DeliveryStatus;
import com.seedsanskriti.enums.OrderStatus;
import com.seedsanskriti.repository.DeliveryRepository;
import com.seedsanskriti.repository.OrderRepository;
import com.seedsanskriti.repository.UserRepository;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Orchestrates payment for an order.
 *
 * Order/Delivery data lives in this service's own database, so validating
 * "does this order exist, does it belong to me, is it in a payable state"
 * still happens here exactly as before. Everything about actually recording
 * a payment and talking to Razorpay has moved to the Payment Service and is
 * reached through {@link PaymentServiceClient}.
 *
 * Because confirming the order and creating its Delivery record now happens
 * in a separate step *after* the remote payment-service call returns (rather
 * than in one local database transaction like the original monolith), this
 * is no longer a single atomic unit of work. If the Delivery/Order update
 * below were to fail after the Payment Service already recorded a
 * successful payment, the two services would disagree about order state
 * until reconciled. For this project's scope we log loudly and surface a
 * 500 so the customer/ops can retry; a production system would want a retry
 * queue, an outbox table, or a saga/compensating transaction here instead.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;
    private final PaymentServiceClient paymentServiceClient;

    @Override
    @Transactional
    public PaymentResponse pay(
            PaymentRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);
        Order order = validateOrderForPayment(request.getOrderId(), user);

        PaymentInternalRequest internalRequest = new PaymentInternalRequest(
                order.getId(),
                user.getId(),
                order.getTotalAmount(),
                request.getPaymentMethod());

        PaymentInternalResponse paymentResponse;
        try {
            paymentResponse = paymentServiceClient.pay(internalRequest);
        } catch (FeignException ex) {
            throw translateFeignException(ex, "Unable to record payment");
        }

        confirmOrderAndCreateDelivery(order);

        return mapToResponse(paymentResponse);
    }

    @Override
    public List<PaymentResponse> getMyPayments(Authentication authentication) {

        User user = getLoggedInUser(authentication);

        List<PaymentInternalResponse> payments;
        try {
            payments = paymentServiceClient.getPaymentsForUser(user.getId());
        } catch (FeignException ex) {
            throw translateFeignException(ex, "Unable to fetch payments");
        }

        List<PaymentResponse> responseList = new ArrayList<>();
        for (PaymentInternalResponse payment : payments) {
            responseList.add(mapToResponse(payment));
        }
        return responseList;
    }

    @Override
    public PaymentResponse getPaymentById(
            Long paymentId,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        PaymentInternalResponse payment;
        try {
            payment = paymentServiceClient.getPaymentById(paymentId, user.getId());
        } catch (FeignException ex) {
            throw translateFeignException(ex, "Unable to fetch payment");
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

        RazorpayOrderInternalRequest internalRequest = new RazorpayOrderInternalRequest(
                order.getId(),
                user.getId(),
                order.getTotalAmount());

        RazorpayOrderInternalResponse response;
        try {
            response = paymentServiceClient.createRazorpayOrder(internalRequest);
        } catch (FeignException ex) {
            throw translateFeignException(ex, "Unable to initiate payment with Razorpay");
        }

        RazorpayOrderResponse orderResponse = new RazorpayOrderResponse();
        orderResponse.setOrderId(response.getOrderId());
        orderResponse.setRazorpayOrderId(response.getRazorpayOrderId());
        orderResponse.setAmount(response.getAmount());
        orderResponse.setCurrency(response.getCurrency());
        orderResponse.setKeyId(response.getKeyId());
        return orderResponse;
    }

    @Override
    @Transactional
    public PaymentResponse verifyRazorpayPayment(
            RazorpayVerifyRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);
        Order order = validateOrderForPayment(request.getOrderId(), user);

        RazorpayVerifyInternalRequest internalRequest = new RazorpayVerifyInternalRequest(
                order.getId(),
                user.getId(),
                order.getTotalAmount(),
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature());

        PaymentInternalResponse paymentResponse;
        try {
            paymentResponse = paymentServiceClient.verifyRazorpayPayment(internalRequest);
        } catch (FeignException ex) {
            throw translateFeignException(ex, "Payment verification failed");
        }

        confirmOrderAndCreateDelivery(order);

        return mapToResponse(paymentResponse);
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
     * Order must exist, belong to the caller, and be in PLACED status.
     * Whether a payment already exists for it is now enforced by the
     * Payment Service (unique constraint on orderId) rather than checked
     * here, since that data no longer lives in this service's database.
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

        return order;
    }

    /**
     * Confirms the order and creates its (initially unassigned) delivery
     * record - same behavior the monolith performed inline inside
     * finalizePayment(), now run locally after the Payment Service has
     * confirmed the payment succeeded.
     */
    private void confirmOrderAndCreateDelivery(Order order) {

        try {
            order.setOrderStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            Delivery delivery = new Delivery();
            delivery.setOrder(order);
            delivery.setDeliveryStatus(DeliveryStatus.PENDING);
            delivery.setDeliveryPartner(null);
            delivery.setTrackingNumber(null);
            delivery.setEstimatedDeliveryDate(null);

            deliveryRepository.save(delivery);

        } catch (Exception ex) {
            // The Payment Service has already recorded a successful payment
            // at this point. Failing to reflect that locally is a
            // cross-service consistency problem, not something the customer
            // caused - log loudly so ops can reconcile manually or via a
            // retry job.
            log.error("Payment succeeded for order {} but confirming the order/creating "
                    + "the delivery record failed - manual reconciliation required", order.getId(), ex);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Payment was recorded but order confirmation failed. Please contact support.");
        }
    }

    private ResponseStatusException translateFeignException(FeignException ex, String defaultMessage) {

        HttpStatus status = HttpStatus.resolve(ex.status());
        if (status == null) {
            status = HttpStatus.BAD_GATEWAY;
        }

        log.error("Payment Service call failed with status {}: {}", ex.status(), ex.getMessage());
        return new ResponseStatusException(status, defaultMessage);
    }

    private PaymentResponse mapToResponse(PaymentInternalResponse payment) {

        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getPaymentId());
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
