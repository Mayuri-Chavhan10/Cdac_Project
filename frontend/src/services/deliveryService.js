import apiClient from './apiClient';

const deliveryService = {
  trackDelivery: (orderId) =>
    apiClient.get(`/deliveries/track/${orderId}`).then((res) => res.data),

  updateDelivery: (payload) =>
    apiClient.put('/deliveries/update', payload).then((res) => res.data),
};

export default deliveryService;
