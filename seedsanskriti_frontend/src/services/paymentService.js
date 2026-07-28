import apiClient from './apiClient';

const paymentService = {
  // Existing flow - unchanged. Used for Cash on Delivery.
  pay: (payload) => apiClient.post('/payments/pay', payload).then((res) => res.data),

  getMyPayments: () => apiClient.get('/payments/my-payments').then((res) => res.data),

  getPaymentById: (paymentId) =>
    apiClient.get(`/payments/${paymentId}`).then((res) => res.data),

  // Razorpay
  createRazorpayOrder: (orderId) =>
    apiClient.post('/payments/razorpay/create-order', { orderId }).then((res) => res.data),

  verifyRazorpayPayment: (payload) =>
    apiClient.post('/payments/razorpay/verify', payload).then((res) => res.data),
};

export default paymentService;
