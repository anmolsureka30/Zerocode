// client/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define API URL - using Vite's import.meta.env format
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Define user interface
interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  github?: string;
  subscription?: {
    plan: string;
    status: string;
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

// Define the auth context types
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  authToken: string | null;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  authToken: null
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Check for existing auth token and user data on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');
    
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      
      // Configure axios to use the token for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data if available
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse user data from localStorage', error);
        }
      } else {
        // If we have a token but no user data, fetch user profile
        fetchUserProfile(token);
      }
    }
  }, []);

  // Fetch user profile using token
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If fetching profile fails, token might be invalid
      logout();
    }
  };

  // Login function
  const login = () => {
    // This function is now just for demo login without credentials
    // Real login is handled in AuthScreen component with proper API calls
    const token = "demo-token-" + Date.now();
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setIsAuthenticated(true);
    
    // Set a demo user
    const demoUser = {
      _id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      subscription: {
        plan: 'Free',
        status: 'Active'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setUser(demoUser);
    localStorage.setItem('userData', JSON.stringify(demoUser));
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    authToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};