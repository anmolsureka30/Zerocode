// client/src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define API response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Define user types
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  github?: string;
  subscription?: {
    plan: 'Free' | 'Pro' | 'Enterprise';
    status: 'Active' | 'Inactive' | 'Cancelled';
    renewalDate?: string;
    price?: string;
  };
  preferences?: {
    darkMode: boolean;
    emailNotifications: boolean;
    projectUpdates: boolean;
    marketingEmails: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Auth response from server
export interface AuthResponse {
  user: UserProfile;
  token: string;
}

// Login/Register credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Profile update payload
export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  bio?: string;
  github?: string;
}

// Password change payload
export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

// Preferences update payload
export interface PreferencesUpdatePayload {
  preferences: {
    darkMode?: boolean;
    emailNotifications?: boolean;
    projectUpdates?: boolean;
    marketingEmails?: boolean;
  };
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token in headers
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized responses
        if (error.response && error.response.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.api(config);
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      if (error.response) {
        throw {
          data: error.response.data,
          status: error.response.status,
          statusText: error.response.statusText,
        };
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>({
      method: 'post',
      url: '/api/auth/login',
      data: credentials,
    });
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>({
      method: 'post',
      url: '/api/auth/register',
      data: credentials,
    });
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>({
      method: 'get',
      url: '/api/auth/me',
    });
  }

  async updateProfile(data: ProfileUpdatePayload): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>({
      method: 'put',
      url: '/api/auth/me',
      data,
    });
  }

  async changePassword(data: PasswordChangePayload): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>({
      method: 'post',
      url: '/api/auth/change-password',
      data,
    });
  }

  async updatePreferences(data: PreferencesUpdatePayload): Promise<ApiResponse<{ preferences: UserProfile['preferences'] }>> {
    return this.request<{ preferences: UserProfile['preferences'] }>({
      method: 'patch',
      url: '/api/auth/me/preferences',
      data,
    });
  }

  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user: { id: string; email: string } }>> {
    return this.request<{ valid: boolean; user: { id: string; email: string } }>({
      method: 'get',
      url: '/api/auth/verify-token',
    });
  }

  // Projects endpoints 
  async getProjects(userId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>({
      method: 'get',
      url: '/api/mongo/projects',
      params: { userId },
    });
  }

  // More API methods as needed...
}

export const apiService = new ApiService();
export default apiService;