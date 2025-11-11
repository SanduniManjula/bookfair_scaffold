/**
 * Authentication API endpoints
 */
import apiClient from './client';

export const authApi = {
  /**
   * Register a new user
   */
  async register(userData) {
    return apiClient.post('/api/auth/register', userData);
  },

  /**
   * Login user
   */
  async login(credentials) {
    return apiClient.post('/api/auth/login', credentials);
  },

  /**
   * Get user profile
   */
  async getProfile() {
    return apiClient.get('/api/user/profile');
  },
};

export default authApi;

