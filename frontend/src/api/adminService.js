import api from './axios';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  },
  updateUserRole: async (id, role) => {
    const response = await api.patch(`/api/admin/users/${id}/role?role=${role}`);
    return response.data;
  },
  verifyUser: async (id) => {
    const response = await api.patch(`/api/admin/users/${id}/verify`);
    return response.data;
  },
  toggleUserStatus: async (id) => {
    const response = await api.patch(`/api/admin/users/${id}/toggle-status`);
    return response.data;
  },
  getReports: async () => {
    const response = await api.get('/api/admin/reports');
    return response.data;
  },
  updateReportStatus: async (id, status) => {
    const response = await api.patch(`/api/admin/reports/${id}/status?status=${status}`);
    return response.data;
  },
  getTrips: async () => {
    const response = await api.get('/api/admin/trips');
    return response.data;
  },
  deleteTrip: async (id) => {
    const response = await api.delete(`/api/admin/trips/${id}`);
    return response.data;
  },
  getReservations: async () => {
    const response = await api.get('/api/admin/reservations');
    return response.data;
  },
  deleteReservation: async (id) => {
    const response = await api.delete(`/api/admin/reservations/${id}`);
    return response.data;
  }
};

export default adminService;
