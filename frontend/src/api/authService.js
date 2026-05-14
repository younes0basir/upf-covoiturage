import api from './axios';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  getMe: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },
  verifyEmail: async (email, code) => {
    const response = await api.post('/api/auth/verify', { email, code });
    return response.data;
  },
  resendVerification: async (email) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  }
};
