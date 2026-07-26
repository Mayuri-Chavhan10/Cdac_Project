package com.seedsanskriti.service;

import java.util.List;

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

public interface AdminService {

    // ==========================
    // User Management
    // ==========================

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long userId);

    String updateUserStatus(UpdateUserStatusRequest request);

    // ==========================
    // Supplier Management
    // ==========================

    List<SupplierResponse> getAllSuppliers();

    SupplierResponse getSupplierById(Long supplierId);

    String updateSupplierStatus(UpdateSupplierStatusRequest request);

    // ==========================
    // Product Management
    // ==========================

    List<ProductResponse> getAllProducts();

    String deleteProduct(Long productId);

    // ==========================
    // Order Management
    // ==========================

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(Long orderId);

    String updateOrderStatus(UpdateOrderStatusRequest request);

    // ==========================
    // Payment Management
    // ==========================

    List<PaymentResponse> getAllPayments();

    PaymentResponse getPaymentById(Long paymentId);

    // ==========================
    // Delivery Management
    // ==========================

    List<DeliveryResponse> getAllDeliveries();

    DeliveryResponse getDeliveryById(Long deliveryId);

    // ==========================
    // Dashboard
    // ==========================

    DashboardStatsResponse getDashboardStats();

}