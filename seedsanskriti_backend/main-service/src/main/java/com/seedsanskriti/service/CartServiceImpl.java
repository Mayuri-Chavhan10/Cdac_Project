package com.seedsanskriti.service;


import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.dto.AddToCartRequest;
import com.seedsanskriti.dto.CartItemResponse;
import com.seedsanskriti.dto.CartResponse;

import com.seedsanskriti.dto.UpdateCartRequest;
import com.seedsanskriti.entity.Cart;
import com.seedsanskriti.entity.CartItem;


import com.seedsanskriti.entity.User;

import com.seedsanskriti.entity.Product;
import com.seedsanskriti.repository.ProductRepository;
import com.seedsanskriti.repository.UserRepository;
import com.seedsanskriti.repository.CartRepository;

import com.seedsanskriti.repository.CartItemRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
	
	private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
   
    
    @Override
    public String addToCart(AddToCartRequest request,
                            Authentication authentication) {
    	
    	// Validate Quantity
        if (request.getQuantity() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero");
        }

        // Logged-in user's email
        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found"));
        
        
        // Find Cart or Create New Cart
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
        
        

        // Find Product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"));

        // Check Stock
        if (product.getStock() < request.getQuantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock");
        }

        // Check if Product already exists in Cart
        CartItem cartItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElse(null);

        if (cartItem != null) {

            int updatedQuantity =
                    cartItem.getQuantity() + request.getQuantity();

            if (updatedQuantity > product.getStock()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock");
            }

            cartItem.setQuantity(updatedQuantity);
            cartItem.setPrice(product.getPrice());
            cartItem.setSubtotal(updatedQuantity * product.getPrice());

        } else {

            cartItem = new CartItem();
            
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setPrice(product.getPrice());
            cartItem.setSubtotal(
                    request.getQuantity() * product.getPrice());
        }

        cartItemRepository.save(cartItem);

        return "Product added to cart successfully";
    }

	@Override
	public CartResponse getMyCart(Authentication authentication) {
		
		String email = authentication.getName();

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "User not found"));

	    Cart cart = cartRepository.findByUser(user)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Cart is empty"));

	    List<CartItem> cartItems = cartItemRepository.findByCart(cart);

	    CartResponse response = new CartResponse();

	    response.setCartId(cart.getId());

	    List<CartItemResponse> itemResponses = new ArrayList<>();

	    double total = 0;

	    for (CartItem item : cartItems) {

	        CartItemResponse dto = new CartItemResponse();

	        dto.setId(item.getId());
	        dto.setProductId(item.getProduct().getId());
	        dto.setProductName(item.getProduct().getProductName());
	        dto.setImageUrl(item.getProduct().getImageUrl());

	        dto.setQuantity(item.getQuantity());
	        dto.setPrice(item.getPrice());
	        dto.setSubtotal(item.getSubtotal());

	        total += item.getSubtotal();

	        itemResponses.add(dto);
	    }

	    response.setItems(itemResponses);
	    response.setTotalAmount(total);

	    return response;
	}

	@Override
	public String updateCartItem(UpdateCartRequest request,
	                             Authentication authentication) {

	    // Logged-in user
	    String email = authentication.getName();

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "User not found"));

	    // Find Cart
	    Cart cart = cartRepository.findByUser(user)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Cart not found"));

	    // Find Cart Item
	    CartItem cartItem = cartItemRepository
	            .findById(request.getCartItemId())
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Cart item not found"));

	    // Ownership check
	    if (!cartItem.getCart().getId().equals(cart.getId())) {
	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "You are not authorized to update this cart");
	    }

	    Product product = cartItem.getProduct();

	    // Validate Quantity
	    if (request.getQuantity() <= 0) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "Quantity must be greater than zero");
	    }

	    // Check Stock
	    if (request.getQuantity() > product.getStock()) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "Insufficient stock");
	    }

	    // Update Cart Item
	    cartItem.setQuantity(request.getQuantity());
	    cartItem.setPrice(product.getPrice());
	    cartItem.setSubtotal(
	            request.getQuantity() * product.getPrice());

	    cartItemRepository.save(cartItem);

	    return "Cart updated successfully";
	}
	
	
	@Override
	public String removeCartItem(Long cartItemId,
	                             Authentication authentication) {

	    // Logged-in user's email
	    String email = authentication.getName();

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "User not found"));

	    // Find Cart
	    Cart cart = cartRepository.findByUser(user)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Cart not found"));

	    // Find Cart Item
	    CartItem cartItem = cartItemRepository.findById(cartItemId)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Cart item not found"));

	    // Ownership Check
	    if (!cartItem.getCart().getId().equals(cart.getId())) {

	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "You are not authorized to remove this item");
	    }

	    cartItemRepository.delete(cartItem);

	    return "Item removed from cart successfully";
	}
	
	@Override
	public String clearCart(Authentication authentication) {

	    // Logged-in user's email
	    String email = authentication.getName();

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "User not found"));

	    Cart cart = cartRepository.findByUser(user)
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.NOT_FOUND,
	                            "Cart not found"));

	    List<CartItem> cartItems = cartItemRepository.findByCart(cart);

	    if (cartItems.isEmpty()) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "Cart is already empty");
	    }

	    cartItemRepository.deleteAll(cartItems);

	    return "Cart cleared successfully";
	}


}
