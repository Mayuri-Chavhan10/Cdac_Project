package com.seedsanskriti.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seedsanskriti.dto.DeliveryResponse;
import com.seedsanskriti.dto.UpdateDeliveryRequest;
import com.seedsanskriti.service.DeliveryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    // Customer tracks delivery of an order
    @GetMapping("/track/{orderId}")
    public ResponseEntity<DeliveryResponse> trackDelivery(
            @PathVariable Long orderId,
            Authentication authentication) {

        return ResponseEntity.ok(
                deliveryService.trackDelivery(orderId, authentication));
    }

    // Admin updates delivery details
    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponse> updateDelivery(
            @Valid @RequestBody UpdateDeliveryRequest request) {

        return ResponseEntity.ok(
                deliveryService.updateDelivery(request));
    }
}