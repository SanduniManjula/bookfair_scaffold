/**
 * Centralized API Client
 * Handles all HTTP requests to the backend API
 * Uses environment variable for base URL configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Build headers for API requests
 */
function buildHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle API response
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    const error = new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Base API client methods
 */
export const apiClient = {
  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(options.headers),
      ...options,
    });
    return handleResponse(response);
  },

  /**
   * POST request
   */
  async post(endpoint, data = null, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(options.headers),
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
    return handleResponse(response);
  },

  /**
   * PUT request
   */
  async put(endpoint, data = null, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(options.headers),
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
    return handleResponse(response);
  },

  /**
   * PATCH request
   */
  async patch(endpoint, data = null, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: buildHeaders(options.headers),
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
    return handleResponse(response);
  },

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders(options.headers),
      ...options,
    });
    return handleResponse(response);
  },
};

export default apiClient;

