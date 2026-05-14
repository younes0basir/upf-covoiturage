import api from './axios';

export const reservationService = {
  create: async (reservationData) => {
    const response = await api.post('/api/reservations', reservationData);
    return response.data;
  },
  getMyReservations: async () => {
    const response = await api.get('/api/reservations/mine');
    return response.data;
  },
  getTripReservations: async (tripId) => {
    const response = await api.get(`/api/reservations/trip/${tripId}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/reservations/${id}/status`, null, { params: { status } });
    return response.data;
  }
};
