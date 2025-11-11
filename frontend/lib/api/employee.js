/**
 * Employee API endpoints
 * Note: Employee service runs on port 8085, so we need a separate client
 */
const EMPLOYEE_API_BASE_URL = process.env.NEXT_PUBLIC_EMPLOYEE_API_URL || 'http://localhost:8085';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

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

export const employeeApi = {
  /**
   * Employee login
   */
  async login(credentials) {
    const response = await fetch(`${EMPLOYEE_API_BASE_URL}/api/employee/login`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  /**
   * Get all stalls (for employee dashboard)
   */
  async getStalls() {
    const response = await fetch(`${EMPLOYEE_API_BASE_URL}/api/employee/dashboard/stalls`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Get all reservations (for employee dashboard)
   */
  async getReservations() {
    const response = await fetch(`${EMPLOYEE_API_BASE_URL}/api/employee/dashboard/reservations`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    return handleResponse(response);
  },
};

export default employeeApi;

