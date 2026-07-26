package com.seedsanskriti.service;

import org.springframework.security.core.Authentication;

import com.seedsanskriti.dto.AddToCartRequest;
import com.seedsanskriti.dto.CartResponse;

import com.seedsanskriti.dto.UpdateCartRequest;

public interface CartService {

	String addToCart(AddToCartRequest request,
            Authentication authentication);
	
	CartResponse getMyCart(Authentication authentication);
	
	String updateCartItem(UpdateCartRequest request,Authentication authentication);
	
	String removeCartItem(Long cartItemId,
            Authentication authentication);
	
	String clearCart(Authentication authentication);
	
	
	
}
