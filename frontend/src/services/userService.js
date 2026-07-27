import apiClient from './apiClient';

const userService = {
  getMyProfile: () => apiClient.get('/users/me').then((res) => res.data),

  updateMyProfile: (payload) =>
    apiClient.put('/users/me', payload).then((res) => res.data),

  changePassword: (payload) =>
    apiClient.put('/users/me/password', payload).then((res) => res.data),
};

export default userService;
