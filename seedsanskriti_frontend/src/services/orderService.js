import apiClient from './apiClient';

const orderService = {
  placeOrder: (payload) => apiClient.post('/orders/place', payload || {}).then((res) => res.data),

  getMyOrders: () => apiClient.get('/orders/my-orders').then((res) => res.data),

  getOrderById: (orderId) => apiClient.get(`/orders/${orderId}`).then((res) => res.data),

  cancelOrder: (orderId) => apiClient.put(`/orders/${orderId}/cancel`).then((res) => res.data),
};

export default orderService;
