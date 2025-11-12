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

  /**
   * Save stall genres
   */
  async saveStallGenres(stallGenres) {
    return apiClient.post('/api/reservations/save-stall-genres', { stallGenres });
  },
};

export default reservationsApi;

