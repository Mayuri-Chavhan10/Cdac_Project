package com.seedsanskriti.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seedsanskriti.dto.DashboardStatsResponse;
import com.seedsanskriti.dto.DeliveryResponse;
import com.seedsanskriti.dto.OrderResponse;
import com.seedsanskriti.dto.PaymentResponse;
import com.seedsanskriti.dto.ProductResponse;
import com.seedsanskriti.dto.SupplierResponse;
import com.seedsanskriti.dto.UpdateOrderStatusRequest;
import com.seedsanskriti.dto.UpdateSupplierStatusRequest;
import com.seedsanskriti.dto.UpdateUserStatusRequest;
import com.seedsanskriti.dto.UserResponse;
import com.seedsanskriti.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ==========================================================
    // USER MANAGEMENT
    // ==========================================================

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                adminService.getAllUsers());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                adminService.getUserById(userId));
    }

    @PutMapping("/users/status")
    public ResponseEntity<String> updateUserStatus(
            @Valid @RequestBody UpdateUserStatusRequest request) {

        return ResponseEntity.ok(
                adminService.updateUserStatus(request));
    }

    // ==========================================================
    // SUPPLIER MANAGEMENT
    // ==========================================================

    @GetMapping("/suppliers")
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {

        return ResponseEntity.ok(
                adminService.getAllSuppliers());
    }

    @GetMapping("/suppliers/{supplierId}")
    public ResponseEntity<SupplierResponse> getSupplierById(
            @PathVariable Long supplierId) {

        return ResponseEntity.ok(
                adminService.getSupplierById(supplierId));
    }

    @PutMapping("/suppliers/status")
    public ResponseEntity<String> updateSupplierStatus(
            @Valid @RequestBody UpdateSupplierStatusRequest request) {

        return ResponseEntity.ok(
                adminService.updateSupplierStatus(request));
    }

    // ==========================================================
    // PRODUCT MANAGEMENT
    // ==========================================================

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        return ResponseEntity.ok(
                adminService.getAllProducts());
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                adminService.deleteProduct(productId));
    }

    // ==========================================================
    // ORDER MANAGEMENT
    // ==========================================================

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(
                adminService.getAllOrders());
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                adminService.getOrderById(orderId));
    }

    @PutMapping("/orders/status")
    public ResponseEntity<String> updateOrderStatus(
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        return ResponseEntity.ok(
                adminService.updateOrderStatus(request));
    }

    // ==========================================================
    // PAYMENT MANAGEMENT
    // ==========================================================

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {

        return ResponseEntity.ok(
                adminService.getAllPayments());
    }

    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long paymentId) {

        return ResponseEntity.ok(
                adminService.getPaymentById(paymentId));
    }

    // ==========================================================
    // DELIVERY MANAGEMENT
    // ==========================================================

    @GetMapping("/deliveries")
    public ResponseEntity<List<DeliveryResponse>> getAllDeliveries() {

        return ResponseEntity.ok(
                adminService.getAllDeliveries());
    }

    @GetMapping("/deliveries/{deliveryId}")
    public ResponseEntity<DeliveryResponse> getDeliveryById(
            @PathVariable Long deliveryId) {

        return ResponseEntity.ok(
                adminService.getDeliveryById(deliveryId));
    }

    // ==========================================================
    // DASHBOARD
    // ==========================================================

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {

        return ResponseEntity.ok(
                adminService.getDashboardStats());
    }

}