package com.seedsanskriti.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.seedsanskriti.dto.AddToCartRequest;
import com.seedsanskriti.dto.CartResponse;

import com.seedsanskriti.dto.UpdateCartRequest;
import com.seedsanskriti.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Validated
public class CartController {

	
	private final CartService cartService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cartService.addToCart(request, authentication));
    }
    
    @GetMapping("/my-cart")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> getMyCart(
            Authentication authentication) {

        return ResponseEntity.ok(
                cartService.getMyCart(authentication));
    }
    
    @PutMapping("/update")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> updateCartItem(
            @Valid @RequestBody UpdateCartRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                cartService.updateCartItem(request, authentication));
    }
    
    @DeleteMapping("/remove/{cartItemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> removeCartItem(
            @PathVariable Long cartItemId,
            Authentication authentication) {

        return ResponseEntity.ok(
                cartService.removeCartItem(
                        cartItemId,
                        authentication));
    }
    
    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> clearCart(
            Authentication authentication) {

        return ResponseEntity.ok(
                cartService.clearCart(authentication));
    }
    
    
    
    
}
