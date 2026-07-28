import apiClient from './apiClient';

const authService = {
  registerCustomer: (payload) =>
    apiClient.post('/auth/register/customer', payload).then((res) => res.data),

  registerSupplier: (payload) =>
    apiClient.post('/auth/register/supplier', payload).then((res) => res.data),

  // Backend returns the raw JWT string as the response body on success,
  // but a normal JSON error object ({ timestamp, status, error, message,
  // path }) on failure (e.g. wrong email/password). Disabling axios's
  // JSON parsing entirely would leave that error JSON as one big raw
  // string, so we parse it ourselves when it *is* valid JSON and only
  // fall back to the raw string for the plain-text token case.
  login: (payload) =>
    apiClient
      .post('/auth/login', payload, {
        transformResponse: [
          (data) => {
            if (typeof data !== 'string') return data;
            try {
              return JSON.parse(data);
            } catch {
              return data;
            }
          },
        ],
      })
      .then((res) => res.data),

  forgotPassword: (payload) =>
    apiClient.post('/auth/forgot-password', payload).then((res) => res.data),

  resetPassword: (payload) =>
    apiClient.post('/auth/reset-password', payload).then((res) => res.data),
};

export default authService;
