import apiClient from './apiClient';

const supplierService = {
  getMyProducts: () => apiClient.get('/supplier/products').then((res) => res.data),

  getSupplierOrders: () => apiClient.get('/supplier/orders').then((res) => res.data),

  acceptOrder: (orderId) =>
    apiClient.put(`/supplier/orders/${orderId}/accept`).then((res) => res.data),

  shipOrder: (orderId) =>
    apiClient.put(`/supplier/orders/${orderId}/ship`).then((res) => res.data),

  deliverOrder: (orderId) =>
    apiClient.put(`/supplier/orders/${orderId}/deliver`).then((res) => res.data),
};

export default supplierService;
