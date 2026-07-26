package com.seedsanskriti.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.dto.WishlistItemResponse;
import com.seedsanskriti.entity.Product;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.entity.WishlistItem;
import com.seedsanskriti.repository.ProductRepository;
import com.seedsanskriti.repository.UserRepository;
import com.seedsanskriti.repository.WishlistItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public String addToWishlist(Long productId, Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"));

        if (wishlistItemRepository.existsByUserAndProduct(user, product)) {
            return "Product is already in your wishlist";
        }

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);

        wishlistItemRepository.save(item);

        return "Product added to wishlist";
    }

    @Override
    public List<WishlistItemResponse> getMyWishlist(Authentication authentication) {

        User user = getLoggedInUser(authentication);

        return wishlistItemRepository.findByUser(user)
                .stream()
                .map(item -> WishlistItemResponse.builder()
                        .wishlistItemId(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getProductName())
                        .price(item.getProduct().getPrice())
                        .imageUrl(item.getProduct().getImageUrl())
                        .stock(item.getProduct().getStock())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public String removeFromWishlist(Long productId, Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"));

        wishlistItemRepository.deleteByUserAndProduct(user, product);

        return "Product removed from wishlist";
    }

    private User getLoggedInUser(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }
}
