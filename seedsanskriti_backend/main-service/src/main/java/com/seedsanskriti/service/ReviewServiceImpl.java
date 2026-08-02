package com.seedsanskriti.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.dto.AddReviewRequest;
import com.seedsanskriti.dto.ReviewResponse;
import com.seedsanskriti.entity.Product;
import com.seedsanskriti.entity.Review;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.OrderStatus;
import com.seedsanskriti.enums.Role;
import com.seedsanskriti.repository.OrderItemRepository;
import com.seedsanskriti.repository.ProductRepository;
import com.seedsanskriti.repository.ReviewRepository;
import com.seedsanskriti.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public ReviewResponse addOrUpdateReview(
            AddReviewRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"));

        // Only customers who have actually received this product may review it.
        boolean hasPurchased = orderItemRepository
                .existsByUserAndProductAndOrderStatus(
                        user, product, OrderStatus.DELIVERED);

        if (!hasPurchased) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only review products from your delivered orders");
        }

        // One review per user per product - update it if it already exists
        // rather than allowing duplicates.
        Review review = reviewRepository.findByProductAndUser(product, user)
                .orElseGet(() -> {
                    Review r = new Review();
                    r.setProduct(product);
                    r.setUser(user);
                    return r;
                });

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        review = reviewRepository.save(review);

        return mapToResponse(review);
    }

    @Override
    public List<ReviewResponse> getProductReviews(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"));

        return reviewRepository.findByProductOrderByCreatedAtDesc(product)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public String deleteReview(Long reviewId, Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Review not found"));

        boolean isOwner = review.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to delete this review");
        }

        reviewRepository.delete(review);

        return "Review deleted successfully";
    }

    private User getLoggedInUser(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));
    }

    private ReviewResponse mapToResponse(Review review) {

        return ReviewResponse.builder()
                .reviewId(review.getId())
                .productId(review.getProduct().getId())
                .customerName(review.getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
