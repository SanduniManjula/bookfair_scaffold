/**
 * Admin API endpoints
 */
import apiClient from './client';

export const adminApi = {
  /**
   * Get admin statistics
   */
  async getStats() {
    return apiClient.get('/api/admin/stats');
  },

  /**
   * Get all users
   */
  async getUsers() {
    return apiClient.get('/api/admin/users');
  },

  /**
   * Get all reservations
   */
  async getReservations() {
    return apiClient.get('/api/admin/reservations');
  },

  /**
   * Update user role
   */
  async updateUserRole(userId, role) {
    return apiClient.put(`/api/admin/users/${userId}/role`, { role });
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    return apiClient.delete(`/api/admin/users/${userId}`);
  },

  /**
   * Delete reservation
   */
  async deleteReservation(reservationId) {
    return apiClient.delete(`/api/admin/reservations/${reservationId}`);
  },

  /**
   * Get map layout
   */
  async getMapLayout() {
    return apiClient.get('/api/admin/map-layout');
  },

  /**
   * Save map layout
   */
  async saveMapLayout(layout) {
    return apiClient.post('/api/admin/map-layout', layout);
  },

  /**
   * Clear all reservations
   */
  async clearReservations() {
    return apiClient.delete('/api/admin/clear-reservations');
  },

  /**
   * Clear all data
   */
  async clearAllData(includeUsers = false) {
    const url = includeUsers 
      ? '/api/admin/clear-all-data?includeUsers=true'
      : '/api/admin/clear-all-data';
    return apiClient.delete(url);
  },
};

export default adminApi;

