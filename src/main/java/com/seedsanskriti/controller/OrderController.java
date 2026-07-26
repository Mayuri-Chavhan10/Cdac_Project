package com.seedsanskriti.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.seedsanskriti.dto.OrderDetailsResponse;
import com.seedsanskriti.dto.OrderResponse;
import com.seedsanskriti.dto.PlaceOrderRequest;
import com.seedsanskriti.dto.PlaceOrderResponse;
import com.seedsanskriti.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PlaceOrderResponse> placeOrder(
            @RequestBody(required = false) PlaceOrderRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.placeOrder(authentication, request));
    }
    
    
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.getMyOrders(authentication));
    }
    
    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDetailsResponse> getOrderById(
            @PathVariable Long orderId,
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.getOrderById(
                        orderId,
                        authentication));
    }
    
    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.cancelOrder(orderId, authentication));
    }

}