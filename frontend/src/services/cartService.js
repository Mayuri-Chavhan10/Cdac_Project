import apiClient from './apiClient';

const cartService = {
  getMyCart: () => apiClient.get('/cart/my-cart').then((res) => res.data),

  addToCart: (payload) => apiClient.post('/cart/add', payload).then((res) => res.data),

  updateCartItem: (payload) => apiClient.put('/cart/update', payload).then((res) => res.data),

  removeCartItem: (cartItemId) =>
    apiClient.delete(`/cart/remove/${cartItemId}`).then((res) => res.data),

  clearCart: () => apiClient.delete('/cart/clear').then((res) => res.data),
};

export default cartService;
