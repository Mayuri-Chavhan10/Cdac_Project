import apiClient from './apiClient';

const paymentService = {
  pay: (payload) => apiClient.post('/payments/pay', payload).then((res) => res.data),

  getMyPayments: () => apiClient.get('/payments/my-payments').then((res) => res.data),

  getPaymentById: (paymentId) =>
    apiClient.get(`/payments/${paymentId}`).then((res) => res.data),
};

export default paymentService;
