import api from './axios';

export const userService = {
  getMe: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },
  updateMe: async (data) => {
    const response = await api.put('/api/users/me', data);
    return response.data;
  }
};
