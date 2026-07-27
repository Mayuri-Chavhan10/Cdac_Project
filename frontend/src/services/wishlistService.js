import apiClient from './apiClient';

const wishlistService = {
  getMyWishlist: () => apiClient.get('/wishlist').then((res) => res.data),

  addToWishlist: (productId) =>
    apiClient.post(`/wishlist/${productId}`).then((res) => res.data),

  removeFromWishlist: (productId) =>
    apiClient.delete(`/wishlist/${productId}`).then((res) => res.data),
};

export default wishlistService;
