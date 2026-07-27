package com.seedsanskriti.service;
import java.util.List;

import org.springframework.security.core.Authentication;

import com.seedsanskriti.dto.OrderDetailsResponse;
import com.seedsanskriti.dto.OrderResponse;
import com.seedsanskriti.dto.PlaceOrderRequest;
import com.seedsanskriti.dto.PlaceOrderResponse;
import com.seedsanskriti.dto.SupplierOrderResponse;

public interface OrderService {
	
	PlaceOrderResponse placeOrder(Authentication authentication, PlaceOrderRequest request);
	
	List<OrderResponse> getMyOrders(Authentication authentication);
	
	OrderDetailsResponse getOrderById(Long orderId,Authentication authentication);
	
	String cancelOrder(Long orderId, Authentication authentication);
	
	List<SupplierOrderResponse> getSupplierOrders(Authentication authentication);
	
	String acceptOrder(Long orderId, Authentication authentication);

	String shipOrder(Long orderId, Authentication authentication);

	String deliverOrder(Long orderId, Authentication authentication);

}
