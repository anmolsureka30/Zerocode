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
  timeout: 10000, // 10 seconds timeout
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
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
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