import api from './axios';

export const tripService = {
  searchTrips: async (params) => {
    const response = await api.get('/api/trips', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/trips/${id}`);
    return response.data;
  },
  createTrip: async (tripData) => {
    const response = await api.post('/api/trips', tripData);
    return response.data;
  },
  getMyTrips: async () => {
    const response = await api.get('/api/trips/mine');
    return response.data;
  },
  updateTripStatus: async (id, status) => {
    const response = await api.patch(`/api/trips/${id}/status`, null, { params: { status } });
    return response.data;
  }
};
