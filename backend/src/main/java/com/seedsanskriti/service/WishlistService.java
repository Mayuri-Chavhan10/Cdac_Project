package com.seedsanskriti.service;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.seedsanskriti.dto.WishlistItemResponse;

public interface WishlistService {

    String addToWishlist(Long productId, Authentication authentication);

    List<WishlistItemResponse> getMyWishlist(Authentication authentication);

    String removeFromWishlist(Long productId, Authentication authentication);
}
