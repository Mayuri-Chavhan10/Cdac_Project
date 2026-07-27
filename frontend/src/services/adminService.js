import apiClient from './apiClient';

const adminService = {
  // Users
  getAllUsers: () => apiClient.get('/admin/users').then((res) => res.data),
  getUserById: (userId) => apiClient.get(`/admin/users/${userId}`).then((res) => res.data),
  updateUserStatus: (payload) =>
    apiClient.put('/admin/users/status', payload).then((res) => res.data),

  // Suppliers
  getAllSuppliers: () => apiClient.get('/admin/suppliers').then((res) => res.data),
  getSupplierById: (supplierId) =>
    apiClient.get(`/admin/suppliers/${supplierId}`).then((res) => res.data),
  updateSupplierStatus: (payload) =>
    apiClient.put('/admin/suppliers/status', payload).then((res) => res.data),

  // Products
  getAllProducts: () => apiClient.get('/admin/products').then((res) => res.data),
  deleteProduct: (productId) =>
    apiClient.delete(`/admin/products/${productId}`).then((res) => res.data),

  // Orders
  getAllOrders: () => apiClient.get('/admin/orders').then((res) => res.data),
  getOrderById: (orderId) => apiClient.get(`/admin/orders/${orderId}`).then((res) => res.data),
  updateOrderStatus: (payload) =>
    apiClient.put('/admin/orders/status', payload).then((res) => res.data),

  // Payments
  getAllPayments: () => apiClient.get('/admin/payments').then((res) => res.data),
  getPaymentById: (paymentId) =>
    apiClient.get(`/admin/payments/${paymentId}`).then((res) => res.data),

  // Deliveries
  getAllDeliveries: () => apiClient.get('/admin/deliveries').then((res) => res.data),
  getDeliveryById: (deliveryId) =>
    apiClient.get(`/admin/deliveries/${deliveryId}`).then((res) => res.data),

  // Dashboard
  getDashboardStats: () => apiClient.get('/admin/dashboard').then((res) => res.data),
};

export default adminService;
