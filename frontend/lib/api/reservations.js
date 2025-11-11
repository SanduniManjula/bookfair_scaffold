/**
 * Reservations API endpoints
 */
import apiClient from './client';

export const reservationsApi = {
  /**
   * Get all available stalls
   */
  async getAllStalls() {
    return apiClient.get('/api/reservations/all');
  },

  /**
   * Get user's reservations
   */
  async getMyReservations() {
    return apiClient.get('/api/reservations/my-reservations');
  },

  /**
   * Reserve a stall
   */
  async reserveStall(stallId) {
    return apiClient.post('/api/reservations/reserve', { stallId });
  },

  /**
   * Get map layout
   */
  async getMapLayout() {
    return apiClient.get('/api/reservations/map-layout');
  },
};

export default reservationsApi;

