package com.seedsanskriti.service;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.seedsanskriti.dto.AddReviewRequest;
import com.seedsanskriti.dto.ReviewResponse;

public interface ReviewService {

    ReviewResponse addOrUpdateReview(AddReviewRequest request, Authentication authentication);

    List<ReviewResponse> getProductReviews(Long productId);

    String deleteReview(Long reviewId, Authentication authentication);
}
