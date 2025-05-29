// client/src/api/waitlist.ts - TypeScript version of your existing waitlist.js
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../config/env';

// Define TypeScript interfaces
export interface WaitlistResponse {
  success: boolean;
  message: string;
  entryId?: string;
  error?: string;
}

export interface WaitlistData {
  name: string;
  email: string;
  phone?: string;
}

// Configure axios for waitlist API
const waitlistAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling
waitlistAPI.interceptors.response.use(
  response => response,
  error => {
    console.error('Waitlist API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Submit to waitlist
export const submitToWaitlist = async (waitlistData: WaitlistData): Promise<WaitlistResponse> => {
  try {
    console.log('💡 Submitting to waitlist:', waitlistData.email);
    
    const response: AxiosResponse = await waitlistAPI.post('/waitlist', waitlistData);
    
    // Check for successful status code range (2xx)
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Waitlist submission successful!');
      return {
        success: true,
        message: response.data.message || 'Successfully added to waitlist!',
        entryId: response.data.entryId
      };
    } else {
      console.log('❌ Waitlist submission failed with status:', response.status);
      throw new Error(response.data?.message || `Submission failed with status ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ Waitlist submission error:', error);
    
    // Create a standardized error message
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Waitlist submission failed - check network connection';
    
    // Return error response instead of throwing
    return {
      success: false,
      message: errorMessage,
      error: String(error)
    };
  }
};

export default {
  submitToWaitlist
};