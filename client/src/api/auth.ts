// client/src/api/auth.ts - TypeScript version of your existing auth.js
import axios, { AxiosResponse } from 'axios';

// Use absolute URL to your backend server
const API_URL = 'http://localhost:5001/api';

// Define TypeScript interfaces
export interface AuthResponse {
  success?: boolean;
  message?: string;
  user?: any;
  token?: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

// Configure axios with detailed debugging
const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to log all outgoing requests
authAPI.interceptors.request.use(request => {
  console.log('🚀 REQUEST:', request.method?.toUpperCase(), request.url);
  console.log('📤 Request Headers:', request.headers);
  console.log('📦 Request Data:', request.data);
  return request;
});

// Add response interceptor to log all incoming responses
authAPI.interceptors.response.use(
  response => {
    console.log('📥 RESPONSE:', response.status, response.statusText);
    console.log('📥 Response Headers:', response.headers);
    console.log('📥 Response Data:', response.data);
    return response;
  },
  error => {
    console.error('❌ ERROR RESPONSE:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

// Register a new user with enhanced debugging
export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  try {
    console.log('💡 Starting registration process for:', userData.email);
    console.log('📡 Full registration URL:', `${API_URL}/auth/register`);
    
    // Try using fetch directly instead of axios
    console.log('🧪 Trying with fetch API first:');
    try {
      const fetchResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Add CORS mode
        body: JSON.stringify(userData)
      });
      
      console.log('🧪 Fetch Response Status:', fetchResponse.status);
      const fetchData = await fetchResponse.json();
      console.log('🧪 Fetch Response Data:', fetchData);
      
      // If fetch works, return its data
      if (fetchResponse.ok) {
        return { success: true, ...fetchData };
      }
      // If fetch fails, continue to axios attempt
    } catch (fetchError) {
      console.error('🧪 Fetch attempt failed:', fetchError);
      // Continue with axios attempt
    }
    
    // Try with axios as backup
    console.log('📡 Trying with axios as backup:');
    const response: AxiosResponse = await authAPI.post('/auth/register', userData);
    
    // Check for successful status code range (2xx)
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Registration successful!');
      return { success: true, ...response.data };
    } else {
      console.log('❌ Registration failed with status:', response.status);
      throw new Error(response.data?.message || `Registration failed with status ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ Registration error details:', error);
    
    // Create a standardized error message
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Registration failed - check network connection';
    
    // Return error response instead of throwing
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Login user with enhanced debugging
export const loginUser = async (credentials: LoginUserData): Promise<AuthResponse> => {
  try {
    console.log('💡 Starting login process for:', credentials.email);
    console.log('📡 Full login URL:', `${API_URL}/auth/login`);
    
    const response: AxiosResponse = await authAPI.post('/auth/login', credentials);
    
    // Check for successful status code range (2xx)
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Login successful!');
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return { success: true, ...response.data };
    } else {
      console.log('❌ Login failed with status:', response.status);
      throw new Error(response.data?.message || `Login failed with status ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ Login error details:', error);
    
    // Extract error message from response if available
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Login failed - check network connection';
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Get current user's profile
export const getUserProfile = async (): Promise<any> => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Set authorization header
    authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const response: AxiosResponse = await authAPI.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  delete authAPI.defaults.headers.common['Authorization'];
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser
};