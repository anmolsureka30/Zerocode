// client/src/ApiService.ts - Create this new file
import axios from 'axios';
import { API_URL } from './config/env';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? "http://localhost:3000" 
    : "https://zerocode-anmol.vercel.app",
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  timeoutErrorMessage: 'Request timed out. Please try again.',
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // If this is a preview request, use the VM endpoint
    if (config.url === '/preview') {
      config.baseURL = 'http://34.100.168.179';
      config.timeout = 60000; // 60 second timeout for preview requests
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to a timeout or network error, retry the request
    if ((error.code === 'ECONNABORTED' || !error.response) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Retry the request
      return apiClient(originalRequest);
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Auth-related API calls
export const authService = {
  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      console.log('Login request to:', `${API_URL}/auth/login`);
      console.log('Login payload:', { email, password });
      
      // Try fetch API first
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register new user
  register: async (name: string, email: string, password: string) => {
    try {
      console.log('Register request to:', `${API_URL}/auth/register`);
      console.log('Register payload:', { name, email, password });
      
      // Try fetch API first
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      console.log('Register response status:', response.status);
      const data = await response.json();
      console.log('Register response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  // Get user profile
  getProfile: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
      
      return data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },
};

export default apiClient;