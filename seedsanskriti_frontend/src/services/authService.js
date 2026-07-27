import apiClient from './apiClient';

const authService = {
  registerCustomer: (payload) =>
    apiClient.post('/auth/register/customer', payload).then((res) => res.data),

  registerSupplier: (payload) =>
    apiClient.post('/auth/register/supplier', payload).then((res) => res.data),

  // Backend returns the raw JWT string as the response body.
  login: (payload) =>
    apiClient
      .post('/auth/login', payload, { transformResponse: [(data) => data] })
      .then((res) => res.data),

  forgotPassword: (payload) =>
    apiClient.post('/auth/forgot-password', payload).then((res) => res.data),

  resetPassword: (payload) =>
    apiClient.post('/auth/reset-password', payload).then((res) => res.data),
};

export default authService;
