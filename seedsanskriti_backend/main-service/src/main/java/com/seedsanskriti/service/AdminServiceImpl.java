package com.seedsanskriti.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
import com.seedsanskriti.client.PaymentServiceClient;
import com.seedsanskriti.client.dto.PaymentInternalResponse;
import com.seedsanskriti.entity.Delivery;
import com.seedsanskriti.entity.Order;
import com.seedsanskriti.entity.Product;
import com.seedsanskriti.entity.Supplier;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.OrderStatus;
import com.seedsanskriti.enums.Role;
import com.seedsanskriti.enums.SupplierStatus;
import com.seedsanskriti.repository.DeliveryRepository;
import com.seedsanskriti.repository.OrderRepository;
import com.seedsanskriti.repository.ProductRepository;
import com.seedsanskriti.repository.SupplierRepository;
import com.seedsanskriti.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

	 private final UserRepository userRepository;
	 private final SupplierRepository supplierRepository;
	 private final ProductRepository productRepository;
	 private final OrderRepository orderRepository;
	 private final PaymentServiceClient paymentServiceClient;
	 private final DeliveryRepository deliveryRepository;
	 
	 @Override
	 public List<UserResponse> getAllUsers() {

	     List<User> users = userRepository.findAll();

	     List<UserResponse> responseList = new ArrayList<>();

	     for (User user : users) {
	         responseList.add(mapToUserResponse(user));
	     }

	     return responseList;
	 }
	 
	 @Override
	 public UserResponse getUserById(Long userId) {

	     User user = userRepository.findById(userId)
	             .orElseThrow(() -> new ResponseStatusException(
	                     HttpStatus.NOT_FOUND,
	                     "User not found"));

	     return mapToUserResponse(user);
	 }
	 
	 @Override
	 @Transactional
	 public String updateUserStatus(UpdateUserStatusRequest request) {

	     User user = userRepository.findById(request.getUserId())
	             .orElseThrow(() -> new ResponseStatusException(
	                     HttpStatus.NOT_FOUND,
	                     "User not found"));

	     user.setStatus(request.getStatus());

	     userRepository.save(user);

	     return "User status updated successfully";
	 }
	 
	 private UserResponse mapToUserResponse(User user) {

		    UserResponse response = new UserResponse();

		    response.setUserId(user.getId());
		    response.setName(user.getName());
		    response.setEmail(user.getEmail());
		    response.setPhoneNumber(user.getPhoneNumber());
		    response.setAddress(user.getAddress());
		    response.setCity(user.getCity());
		    response.setPincode(user.getPincode());
		    response.setRole(user.getRole());
		    response.setStatus(user.getStatus());

		    return response;
		}
	 
	 @Override
	 public List<SupplierResponse> getAllSuppliers() {

	     List<Supplier> suppliers = supplierRepository.findAll();

	     List<SupplierResponse> responseList = new ArrayList<>();

	     for (Supplier supplier : suppliers) {
	         responseList.add(mapToSupplierResponse(supplier));
	     }

	     return responseList;
	 }
	 
	 @Override
	 public SupplierResponse getSupplierById(Long supplierId) {

	     Supplier supplier = supplierRepository.findById(supplierId)
	             .orElseThrow(() -> new ResponseStatusException(
	                     HttpStatus.NOT_FOUND,
	                     "Supplier not found"));

	     return mapToSupplierResponse(supplier);
	 }
	 
	 @Override
	 @Transactional
	 public String updateSupplierStatus(UpdateSupplierStatusRequest request) {

	     Supplier supplier = supplierRepository.findById(request.getSupplierId())
	             .orElseThrow(() -> new ResponseStatusException(
	                     HttpStatus.NOT_FOUND,
	                     "Supplier not found"));

	     supplier.setSupplierStatus(request.getSupplierStatus());

	     supplierRepository.save(supplier);

	     return "Supplier status updated successfully";
	 }
	 
	 
	 private SupplierResponse mapToSupplierResponse(Supplier supplier) {

		    SupplierResponse response = new SupplierResponse();

		    response.setSupplierId(supplier.getId());
		    response.setBusinessName(supplier.getBusinessName());
		    response.setGstNumber(supplier.getGstNumber());

		    response.setAddress(supplier.getUser().getAddress());
		    response.setCity(supplier.getUser().getCity());

		    response.setSupplierStatus(supplier.getSupplierStatus());

		    response.setUserId(supplier.getUser().getId());
		    response.setOwnerName(supplier.getUser().getName());
		    response.setEmail(supplier.getUser().getEmail());
		    response.setPhoneNumber(supplier.getUser().getPhoneNumber());

		    return response;
		}
	 
	 @Override
	 public List<ProductResponse> getAllProducts() {

	     List<Product> products = productRepository.findAll();

	     List<ProductResponse> responseList = new ArrayList<>();

	     for (Product product : products) {
	         responseList.add(mapToProductResponse(product));
	     }

	     return responseList;
	 }
	 
	 @Override
	 @Transactional
	 public String deleteProduct(Long productId) {

	     Product product = productRepository.findById(productId)
	             .orElseThrow(() -> new ResponseStatusException(
	                     HttpStatus.NOT_FOUND,
	                     "Product not found"));

	     productRepository.delete(product);

	     return "Product deleted successfully";
	 }
	 
	 private ProductResponse mapToProductResponse(Product product) {

		    ProductResponse response = new ProductResponse();

		    response.setId(product.getId());
		    response.setProductName(product.getProductName());
		    response.setDescription(product.getDescription());
		    response.setPrice(product.getPrice());
		    response.setStock(product.getStock());
		    response.setImageUrl(product.getImageUrl());

		    response.setCategory(product.getCategory());

		    response.setSupplierName(
		            product.getSupplier().getBusinessName());

		    return response;
		}
	 
	 @Override
	 public List<OrderResponse> getAllOrders() {

	     List<Order> orders = orderRepository.findAll();

	     List<OrderResponse> responseList = new ArrayList<>();

	     for (Order order : orders) {
	         responseList.add(mapToOrderResponse(order));
	     }

	     return responseList;
	 }
	 
	 @Override
	 public OrderResponse getOrderById(Long orderId) {

	     Order order = orderRepository.findById(orderId)
	             .orElseThrow(() -> new ResponseStatusException(
	                     HttpStatus.NOT_FOUND,
	                     "Order not found"));

	     return mapToOrderResponse(order);
	 }
	 
	 @Override
	 @Transactional
	 public String updateOrderStatus(UpdateOrderStatusRequest request) {

	     Order order = orderRepository.findById(request.getOrderId())
	             .orElseThrow(() -> new ResponseStatusException(
	                     HttpStatus.NOT_FOUND,
	                     "Order not found"));

	     order.setOrderStatus(request.getOrderStatus());

	     orderRepository.save(order);

	     return "Order status updated successfully";
	 }
	 
	 
	 private OrderResponse mapToOrderResponse(Order order) {

		    OrderResponse response = new OrderResponse();

		    response.setOrderId(order.getId());
		    response.setOrderDate(order.getOrderDate());
		    response.setTotalAmount(order.getTotalAmount());
		    response.setOrderStatus(order.getOrderStatus());

		    return response;
		}

	 // Payment data now lives in the Payment Service - delegate via Feign
	 // instead of a local repository.
	 @Override
	 public List<PaymentResponse> getAllPayments() {

	     List<PaymentInternalResponse> payments = paymentServiceClient.getAllPayments();

	     List<PaymentResponse> responseList = new ArrayList<>();

	     for (PaymentInternalResponse payment : payments) {
	         responseList.add(mapToPaymentResponse(payment));
	     }

	     return responseList;
	 }

	 @Override
	 public PaymentResponse getPaymentById(Long paymentId) {

	     PaymentInternalResponse payment = paymentServiceClient.getPaymentByIdForAdmin(paymentId);

	     return mapToPaymentResponse(payment);
	 }
	 
	 private PaymentResponse mapToPaymentResponse(PaymentInternalResponse payment) {

		    PaymentResponse response = new PaymentResponse();

		    response.setPaymentId(payment.getPaymentId());
		    response.setOrderId(payment.getOrderId());
		    response.setAmount(payment.getAmount());
		    response.setPaymentMethod(payment.getPaymentMethod());
		    response.setPaymentStatus(payment.getPaymentStatus());
		    response.setTransactionId(payment.getTransactionId());
		    response.setPaymentDate(payment.getPaymentDate());

		    return response;
		}

	 @Override
	 public List<DeliveryResponse> getAllDeliveries() {

	     List<Delivery> deliveries = deliveryRepository.findAll();

	     List<DeliveryResponse> responseList = new ArrayList<>();

	     for (Delivery delivery : deliveries) {
	         responseList.add(mapToDeliveryResponse(delivery));
	     }

	     return responseList;
	 }

	 @Override
	 public DeliveryResponse getDeliveryById(Long deliveryId) {

	     Delivery delivery = deliveryRepository.findById(deliveryId)
	             .orElseThrow(() -> new ResponseStatusException(
	                     HttpStatus.NOT_FOUND,
	                     "Delivery not found"));

	     return mapToDeliveryResponse(delivery);
	 }
	 
	 private DeliveryResponse mapToDeliveryResponse(Delivery delivery) {

		    DeliveryResponse response = new DeliveryResponse();

		    response.setDeliveryId(delivery.getId());
		    response.setOrderId(delivery.getOrder().getId());
		    response.setDeliveryPartner(delivery.getDeliveryPartner());
		    response.setTrackingNumber(delivery.getTrackingNumber());
		    response.setEstimatedDeliveryDate(
		            delivery.getEstimatedDeliveryDate());
		    response.setDeliveryStatus(
		            delivery.getDeliveryStatus());

		    return response;
		}
	 

	 @Override
	 public DashboardStatsResponse getDashboardStats() {

	     long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
	     long totalSuppliers = userRepository.countByRole(Role.SUPPLIER);
	     long pendingSupplierApprovals =
	             supplierRepository.countBySupplierStatus(SupplierStatus.PENDING);

	     long totalProducts = productRepository.count();
	     long totalOrders = orderRepository.count();

	     Double revenue = paymentServiceClient.getTotalRevenue("SUCCESS");
	     double totalRevenue = revenue != null ? revenue : 0.0;

	     Map<String, Long> ordersByStatus = new LinkedHashMap<>();
	     for (OrderStatus status : OrderStatus.values()) {
	         ordersByStatus.put(
	                 status.name(),
	                 orderRepository.countByOrderStatus(status));
	     }

	     return DashboardStatsResponse.builder()
	             .totalCustomers(totalCustomers)
	             .totalSuppliers(totalSuppliers)
	             .pendingSupplierApprovals(pendingSupplierApprovals)
	             .totalProducts(totalProducts)
	             .totalOrders(totalOrders)
	             .totalRevenue(totalRevenue)
	             .ordersByStatus(ordersByStatus)
	             .build();
	 }
}
