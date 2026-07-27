import apiClient from './apiClient';

const productService = {
  getAllProducts: () => apiClient.get('/products').then((res) => res.data),

  // params: { keyword, category, minPrice, maxPrice, inStock, page, size, sortBy, sortDir }
  searchProducts: (params = {}) =>
    apiClient.get('/products/search', { params }).then((res) => res.data),

  getCategories: () => apiClient.get('/products/categories').then((res) => res.data),

  getProductById: (id) => apiClient.get(`/products/${id}`).then((res) => res.data),

  addProduct: (payload) => apiClient.post('/products', payload).then((res) => res.data),

  updateProduct: (id, payload) =>
    apiClient.put(`/products/${id}`, payload).then((res) => res.data),

  deleteProduct: (id) => apiClient.delete(`/products/${id}`).then((res) => res.data),
};

export default productService;
