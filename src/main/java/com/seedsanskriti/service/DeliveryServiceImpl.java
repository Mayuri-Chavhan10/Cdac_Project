package com.seedsanskriti.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.dto.DeliveryResponse;
import com.seedsanskriti.dto.UpdateDeliveryRequest;
import com.seedsanskriti.entity.Delivery;
import com.seedsanskriti.entity.Order;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.repository.DeliveryRepository;
import com.seedsanskriti.repository.OrderRepository;
import com.seedsanskriti.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    public DeliveryResponse trackDelivery(
            Long orderId,
            Authentication authentication) {

        // Logged-in user
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        // Find Order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"));

        // Ownership Check
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to view this delivery");
        }

        // Find Delivery
        Delivery delivery = deliveryRepository.findByOrder(order)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Delivery not found"));

        return mapToResponse(delivery);
    }

    @Override
    @Transactional
    public DeliveryResponse updateDelivery(
            UpdateDeliveryRequest request) {

        Delivery delivery = deliveryRepository.findById(request.getDeliveryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Delivery not found"));

        // Update only if values are provided
        if (request.getDeliveryPartner() != null) {
            delivery.setDeliveryPartner(request.getDeliveryPartner());
        }

        if (request.getTrackingNumber() != null) {
            delivery.setTrackingNumber(request.getTrackingNumber());
        }

        if (request.getEstimatedDeliveryDate() != null) {
            delivery.setEstimatedDeliveryDate(
                    request.getEstimatedDeliveryDate());
        }

        if (request.getDeliveryStatus() != null) {
            delivery.setDeliveryStatus(
                    request.getDeliveryStatus());
        }

        delivery = deliveryRepository.save(delivery);

        return mapToResponse(delivery);
    }

    /**
     * Converts Delivery entity to DeliveryResponse DTO
     */
    private DeliveryResponse mapToResponse(Delivery delivery) {

        DeliveryResponse response = new DeliveryResponse();

        response.setDeliveryId(delivery.getId());
        response.setOrderId(delivery.getOrder().getId());
        response.setDeliveryPartner(delivery.getDeliveryPartner());
        response.setTrackingNumber(delivery.getTrackingNumber());
        response.setEstimatedDeliveryDate(
                delivery.getEstimatedDeliveryDate());
        response.setDeliveryStatus(delivery.getDeliveryStatus());

        return response;
    }

}