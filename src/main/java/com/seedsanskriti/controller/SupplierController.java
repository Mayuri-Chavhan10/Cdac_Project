package com.seedsanskriti.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seedsanskriti.dto.ProductResponse;
import com.seedsanskriti.dto.SupplierOrderResponse;
import com.seedsanskriti.service.OrderService;
import com.seedsanskriti.service.ProductService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/supplier")
@RequiredArgsConstructor
public class SupplierController {

	private final OrderService orderService;
	private final ProductService productService;

	@GetMapping("/products")
	@PreAuthorize("hasRole('SUPPLIER')")
	public ResponseEntity<List<ProductResponse>> getMyProducts(
	        Authentication authentication) {

	    return ResponseEntity.ok(
	            productService.getSupplierProducts(authentication));
	}
	
	@GetMapping("/orders")
	@PreAuthorize("hasRole('SUPPLIER')")
	public ResponseEntity<List<SupplierOrderResponse>> getSupplierOrders(
	        Authentication authentication) {

	    return ResponseEntity.ok(orderService.getSupplierOrders(authentication));
	}
	
	@PutMapping("/orders/{orderId}/accept")
	@PreAuthorize("hasRole('SUPPLIER')")
	public ResponseEntity<String> acceptOrder(
	        @PathVariable Long orderId,
	        Authentication authentication) {

	    return ResponseEntity.ok(
	            orderService.acceptOrder(orderId, authentication));
	}
	
	@PutMapping("/orders/{orderId}/ship")
	@PreAuthorize("hasRole('SUPPLIER')")
	public ResponseEntity<String> shipOrder(
	        @PathVariable Long orderId,
	        Authentication authentication) {

	    return ResponseEntity.ok(
	            orderService.shipOrder(orderId, authentication));
	}
	
	@PutMapping("/orders/{orderId}/deliver")
	@PreAuthorize("hasRole('SUPPLIER')")
	public ResponseEntity<String> deliverOrder(
	        @PathVariable Long orderId,
	        Authentication authentication) {

	    return ResponseEntity.ok(
	            orderService.deliverOrder(orderId, authentication));
	}

}
