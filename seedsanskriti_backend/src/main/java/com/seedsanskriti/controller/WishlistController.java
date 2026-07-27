package com.seedsanskriti.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.seedsanskriti.dto.WishlistItemResponse;
import com.seedsanskriti.service.WishlistService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{productId}")
    public ResponseEntity<String> addToWishlist(
            @PathVariable Long productId,
            Authentication authentication) {

        return ResponseEntity.ok(wishlistService.addToWishlist(productId, authentication));
    }

    @GetMapping
    public ResponseEntity<List<WishlistItemResponse>> getMyWishlist(
            Authentication authentication) {

        return ResponseEntity.ok(wishlistService.getMyWishlist(authentication));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication) {

        return ResponseEntity.ok(wishlistService.removeFromWishlist(productId, authentication));
    }
}
