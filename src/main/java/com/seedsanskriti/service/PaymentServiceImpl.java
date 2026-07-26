package com.seedsanskriti.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.dto.PaymentRequest;
import com.seedsanskriti.dto.PaymentResponse;
import com.seedsanskriti.entity.Delivery;
import com.seedsanskriti.entity.Order;
import com.seedsanskriti.entity.Payment;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.DeliveryStatus;
import com.seedsanskriti.enums.OrderStatus;
import com.seedsanskriti.enums.PaymentStatus;
import com.seedsanskriti.repository.DeliveryRepository;
import com.seedsanskriti.repository.OrderRepository;
import com.seedsanskriti.repository.PaymentRepository;
import com.seedsanskriti.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;

    @Override
    @Transactional
    public PaymentResponse pay(
            PaymentRequest request,
            Authentication authentication) {

        // Logged-in user
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        // Find Order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"));

        // Ownership Check
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to pay for this order");
        }

        // Order must be placed
        if (order.getOrderStatus() != OrderStatus.PLACED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment can only be made for placed orders");
        }

        // Already paid?
        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment already exists for this order");
        }

        // Create Payment
        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());

        payment.setTransactionId(
                "TXN-" + UUID.randomUUID().toString()
                        .substring(0, 8)
                        .toUpperCase());

        // Save Payment
        payment = paymentRepository.save(payment);

        // Update Order Status
        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        
     // Create Delivery
        Delivery delivery = new Delivery();

        delivery.setOrder(order);
        delivery.setDeliveryStatus(DeliveryStatus.PENDING);

        // These will be assigned later by the admin
        delivery.setDeliveryPartner(null);
        delivery.setTrackingNumber(null);
        delivery.setEstimatedDeliveryDate(null);

        deliveryRepository.save(delivery);

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

        return response;
    }

}