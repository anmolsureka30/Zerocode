// client/src/config/env.ts
export const API_URL = import.meta.env.VITE_API_URL || 'https://ebfiwb-chft.vercel.app/api';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ebfiwb-chft.vercel.app';

// Validate environment variables
if (!API_URL || !API_BASE_URL) {
  console.warn('⚠️ API URLs not properly configured in environment variables');
} 