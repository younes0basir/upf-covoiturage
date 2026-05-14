import api from './axios';

export const driverService = {
  getProfile: async () => {
    const response = await api.get('/api/driver/profile/me');
    return response.data;
  },
  createProfile: async (profileData) => {
    const response = await api.post('/api/driver/profile', profileData);
    return response.data;
  },
  getVehicles: async () => {
    const response = await api.get('/api/driver/vehicles');
    return response.data;
  },
  addVehicle: async (vehicleData) => {
    const response = await api.post('/api/driver/vehicles', vehicleData);
    return response.data;
  }
};
