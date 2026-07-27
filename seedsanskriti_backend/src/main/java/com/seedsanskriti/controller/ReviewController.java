package com.seedsanskriti.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.seedsanskriti.dto.AddReviewRequest;
import com.seedsanskriti.dto.ReviewResponse;
import com.seedsanskriti.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> addOrUpdateReview(
            @Valid @RequestBody AddReviewRequest request,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.addOrUpdateReview(request, authentication));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(
            @PathVariable Long productId) {

        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    public ResponseEntity<String> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {

        return ResponseEntity.ok(reviewService.deleteReview(reviewId, authentication));
    }
}
