import api from './axios';

export const locationService = {
  getAll: async () => {
    const response = await api.get('/api/locations');
    return response.data;
  },
  getUniversity: async () => {
    const response = await api.get('/api/locations/university');
    return response.data;
  },
  search: async (q) => {
    const response = await api.get('/api/locations/search', { params: { q } });
    return response.data;
  },
  create: async (locationData) => {
    const response = await api.post('/api/locations', locationData);
    return response.data;
  }
};
