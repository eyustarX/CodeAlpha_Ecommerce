/**
 * Centralized API client for all network requests to the Express backend.
 */
const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = {
  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // If JWT token exists in localStorage, attach Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong with the request');
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
      throw error;
    }
  },

  // Helper HTTP methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
