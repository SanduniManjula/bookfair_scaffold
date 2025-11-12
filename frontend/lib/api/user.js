/**
 * User API endpoints
 */
import apiClient from './auth-client';

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
};

export default userApi;

