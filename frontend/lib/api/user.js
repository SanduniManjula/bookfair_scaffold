/**
 * User API endpoints
 */
import apiClient from './client';

export const userApi = {
  /**
   * Get user profile
   */
  async getProfile() {
    return apiClient.get('/api/user/profile');
  },

  /**
   * Update user genres
   */
  async updateGenres(email, genres) {
    return apiClient.post('/api/user/genres', { email, genres });
  },

  /**
   * Save stall genres
   */
  async saveStallGenres(stallGenres) {
    return apiClient.post('/api/user/save-stall-genres', { stallGenres });
  },
};

export default userApi;

