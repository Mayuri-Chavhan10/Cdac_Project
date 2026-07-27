package com.seedsanskriti.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.dto.OrderDetailsResponse;
import com.seedsanskriti.dto.OrderItemResponse;
import com.seedsanskriti.dto.OrderResponse;
import com.seedsanskriti.dto.PlaceOrderRequest;
import com.seedsanskriti.dto.PlaceOrderResponse;
import com.seedsanskriti.dto.SupplierOrderResponse;
import com.seedsanskriti.entity.Cart;
import com.seedsanskriti.entity.CartItem;
import com.seedsanskriti.entity.Order;
import com.seedsanskriti.entity.OrderItem;

import com.seedsanskriti.entity.Product;
import com.seedsanskriti.entity.Supplier;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.OrderStatus;
import com.seedsanskriti.enums.PaymentStatus;


import org.springframework.stereotype.Service;

import com.seedsanskriti.repository.CartItemRepository;
import com.seedsanskriti.repository.CartRepository;
import com.seedsanskriti.repository.OrderItemRepository;
import com.seedsanskriti.repository.OrderRepository;
import com.seedsanskriti.repository.PaymentRepository;
import com.seedsanskriti.repository.ProductRepository;
import com.seedsanskriti.repository.SupplierRepository;
import com.seedsanskriti.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {
	
	private final UserRepository userRepository;
	private final CartRepository cartRepository;
	private final CartItemRepository cartItemRepository;
	private final ProductRepository productRepository;
	private final OrderRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final SupplierRepository supplierRepository;
	private final PaymentRepository paymentRepository;
	
	
	@Override
	public PlaceOrderResponse placeOrder(Authentication authentication, PlaceOrderRequest request) {

		User user = getLoggedInUser(authentication);

	    // Find Cart
	    Cart cart = cartRepository.findByUser(user)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Cart not found"));

	    // Get Cart Items
	    List<CartItem> cartItems = cartItemRepository.findByCart(cart);

	    if (cartItems.isEmpty()) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "Cart is empty");
	    }

	    // Calculate Total Amount
	    double totalAmount = 0;

	    for (CartItem item : cartItems) {
	        totalAmount += item.getSubtotal();
	    }

	    // Resolve shipping details: use the override from the request if
	    // provided, otherwise fall back to the customer's profile address.
	    String shippingAddress = hasText(request == null ? null : request.getShippingAddress())
	            ? request.getShippingAddress() : user.getAddress();
	    String shippingCity = hasText(request == null ? null : request.getShippingCity())
	            ? request.getShippingCity() : user.getCity();
	    String shippingPincode = hasText(request == null ? null : request.getShippingPincode())
	            ? request.getShippingPincode() : user.getPincode();
	    String contactPhone = hasText(request == null ? null : request.getContactPhone())
	            ? request.getContactPhone() : user.getPhoneNumber();

	    if (!hasText(shippingAddress) || !hasText(shippingCity) || !hasText(shippingPincode)) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "A shipping address (address, city, pincode) is required - "
	                        + "provide one with the order or set it on your profile");
	    }

	    // Create Order
	    Order order = new Order();
	    order.setUser(user);
	    order.setOrderDate(LocalDateTime.now());
	    order.setTotalAmount(totalAmount);
	    order.setOrderStatus(OrderStatus.PLACED);
	    order.setShippingAddress(shippingAddress);
	    order.setShippingCity(shippingCity);
	    order.setShippingPincode(shippingPincode);
	    order.setContactPhone(contactPhone);

	    order = orderRepository.save(order);

	    // Convert Cart Items to Order Items
	    for (CartItem cartItem : cartItems) {

	        Product product = cartItem.getProduct();

	        // Stock Validation
	        if (product.getStock() < cartItem.getQuantity()) {
	            throw new ResponseStatusException(
	                    HttpStatus.BAD_REQUEST,
	                    "Insufficient stock for "
	                            + product.getProductName());
	        }

	        // Reduce Product Stock
	        product.setStock(
	                product.getStock() - cartItem.getQuantity());

	        productRepository.save(product);

	        // Create Order Item
	        OrderItem orderItem = new OrderItem();
	        orderItem.setOrder(order);
	        orderItem.setProduct(product);
	        orderItem.setQuantity(cartItem.getQuantity());
	        orderItem.setPrice(cartItem.getPrice());
	        orderItem.setSubtotal(cartItem.getSubtotal());

	        orderItemRepository.save(orderItem);
	    }

	    // Clear Cart
	    cartItemRepository.deleteAll(cartItems);

	    // Prepare Response
	    PlaceOrderResponse response = new PlaceOrderResponse();
	    response.setOrderId(order.getId());
	    response.setTotalAmount(order.getTotalAmount());
	    response.setMessage("Order placed successfully");

	    return response;
	}


	
	@Override
	public List<OrderResponse> getMyOrders(Authentication authentication) {

		User user = getLoggedInUser(authentication);

	    // Fetch all orders of the user
	    List<Order> orders = orderRepository.findByUser(user);

	    List<OrderResponse> responseList = new ArrayList<>();

	    for (Order order : orders) {

	        OrderResponse response = new OrderResponse();

	        response.setOrderId(order.getId());
	        response.setOrderDate(order.getOrderDate());
	        response.setTotalAmount(order.getTotalAmount());
	        response.setOrderStatus(order.getOrderStatus());

	        responseList.add(response);
	    }

	    return responseList;
	}
	
	
	@Override
	public OrderDetailsResponse getOrderById(
	        Long orderId,
	        Authentication authentication) {

		User user = getLoggedInUser(authentication);

	    // Find Order
	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Order not found"));

	    // Ownership Check
	    if (!order.getUser().getId().equals(user.getId())) {

	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "You are not authorized to view this order");
	    }

	    // Fetch Order Items
	    List<OrderItem> orderItems =
	            orderItemRepository.findByOrder(order);

	    // Prepare Response
	    OrderDetailsResponse response =
	            new OrderDetailsResponse();

	    response.setOrderId(order.getId());
	    response.setOrderDate(order.getOrderDate());
	    response.setTotalAmount(order.getTotalAmount());
	    response.setOrderStatus(order.getOrderStatus());
	    response.setShippingAddress(order.getShippingAddress());
	    response.setShippingCity(order.getShippingCity());
	    response.setShippingPincode(order.getShippingPincode());
	    response.setContactPhone(order.getContactPhone());

	    List<OrderItemResponse> itemResponses =
	            new ArrayList<>();

	    for (OrderItem item : orderItems) {

	        OrderItemResponse dto =
	                new OrderItemResponse();

	        dto.setProductId(item.getProduct().getId());
	        dto.setProductName(item.getProduct().getProductName());
	        dto.setImageUrl(item.getProduct().getImageUrl());
	        dto.setQuantity(item.getQuantity());
	        dto.setPrice(item.getPrice());
	        dto.setSubtotal(item.getSubtotal());

	        itemResponses.add(dto);
	    }

	    response.setItems(itemResponses);

	    return response;
	}
	
	
	@Override
	public String cancelOrder(Long orderId,
	                          Authentication authentication) {

		User user = getLoggedInUser(authentication);

	    // Find Order
	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Order not found"));

	    // Ownership Check
	    if (!order.getUser().getId().equals(user.getId())) {
	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "You are not authorized to cancel this order");
	    }

	    // Check Order Status - allow cancellation any time before the
	    // supplier has accepted/shipped it
	    if (order.getOrderStatus() != OrderStatus.PLACED
	            && order.getOrderStatus() != OrderStatus.CONFIRMED) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "Only orders that have not yet been accepted by the supplier can be cancelled");
	    }

	    // Get Order Items
	    List<OrderItem> orderItems =
	            orderItemRepository.findByOrder(order);

	    // Restore Product Stock
	    for (OrderItem item : orderItems) {

	        Product product = item.getProduct();

	        product.setStock(
	                product.getStock() + item.getQuantity());

	        productRepository.save(product);
	    }

	    // Update Order Status
	    order.setOrderStatus(OrderStatus.CANCELLED);

	    orderRepository.save(order);

	    // If the order was already paid for, mark the payment as refunded
	    // so downstream reporting/reconciliation stays consistent.
	    paymentRepository.findByOrder(order).ifPresent(payment -> {
	        payment.setPaymentStatus(PaymentStatus.REFUNDED);
	        paymentRepository.save(payment);
	    });

	    return "Order cancelled successfully";
	}
	
	
	@Override
	public List<SupplierOrderResponse> getSupplierOrders(
	        Authentication authentication) {

		Supplier supplier = getLoggedInSupplier(authentication);

	    // Fetch all order items belonging to this supplier
	    List<OrderItem> orderItems =
	            orderItemRepository.findByProductSupplier(supplier);

	    List<SupplierOrderResponse> responseList =
	            new ArrayList<>();

	    Set<Long> addedOrders = new HashSet<>();

	    for (OrderItem item : orderItems) {

	        Order order = item.getOrder();

	        // Avoid duplicate orders
	        if (addedOrders.contains(order.getId())) {
	            continue;
	        }

	        SupplierOrderResponse response =
	                new SupplierOrderResponse();

	        response.setOrderId(order.getId());
	        response.setCustomerName(order.getUser().getName());
	        response.setOrderDate(order.getOrderDate());
	        response.setTotalAmount(order.getTotalAmount());
	        response.setOrderStatus(order.getOrderStatus());

	        responseList.add(response);

	        addedOrders.add(order.getId());
	    }

	    return responseList;
	}
	
	
	@Override
	public String acceptOrder(Long orderId,
	                          Authentication authentication) {

		Supplier supplier = getLoggedInSupplier(authentication);

	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Order not found"));

	    validateSupplierOrder(order, supplier);
	    
	    
	    if (order.getOrderStatus() != OrderStatus.CONFIRMED) {

	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "Only paid (confirmed) orders can be accepted");
	    }

	    order.setOrderStatus(OrderStatus.ACCEPTED);

	    orderRepository.save(order);

	    return "Order accepted successfully";
	}
	
	
	@Override
	public String shipOrder(Long orderId,
	                        Authentication authentication) {

		Supplier supplier = getLoggedInSupplier(authentication);

	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Order not found"));

	    validateSupplierOrder(order, supplier);

	    if (order.getOrderStatus() != OrderStatus.ACCEPTED) {

	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "Only accepted orders can be shipped");
	    }

	    order.setOrderStatus(OrderStatus.SHIPPED);

	    orderRepository.save(order);

	    return "Order shipped successfully";
	}
	

	@Override
	public String deliverOrder(Long orderId,
	                           Authentication authentication) {

		Supplier supplier = getLoggedInSupplier(authentication);

	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Order not found"));

	    validateSupplierOrder(order, supplier);

	    if (order.getOrderStatus() != OrderStatus.SHIPPED) {

	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "Only shipped orders can be delivered");
	    }

	    order.setOrderStatus(OrderStatus.DELIVERED);

	    orderRepository.save(order);

	    return "Order delivered successfully";
	}
	
	
	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}


	private User getLoggedInUser(Authentication authentication) {

	    return userRepository.findByEmail(authentication.getName())
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "User not found"));
	}

	private Supplier getLoggedInSupplier(Authentication authentication) {

	    User user = getLoggedInUser(authentication);

	    return supplierRepository.findByUser(user)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Supplier not found"));
	}
	
	
	private void validateSupplierOrder(Order order, Supplier supplier) {

	    List<OrderItem> items = orderItemRepository.findByOrder(order);

	    boolean hasProduct = false;

	    for (OrderItem item : items) {

	        if (item.getProduct()
	                .getSupplier()
	                .getId()
	                .equals(supplier.getId())) {

	            hasProduct = true;
	            break;
	        }
	    }

	    if (!hasProduct) {

	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "You are not authorized to update this order");
	    }
	}


}
