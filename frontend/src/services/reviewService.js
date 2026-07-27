import apiClient from './apiClient';

const reviewService = {
  addOrUpdateReview: (payload) => apiClient.post('/reviews', payload).then((res) => res.data),

  getProductReviews: (productId) =>
    apiClient.get(`/reviews/product/${productId}`).then((res) => res.data),

  deleteReview: (reviewId) =>
    apiClient.delete(`/reviews/${reviewId}`).then((res) => res.data),
};

export default reviewService;
