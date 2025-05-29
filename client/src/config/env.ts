// client/src/config/env.ts
const API_URL = import.meta.env.VITE_API_URL || 'https://ebfiwb-chft.vercel.app/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ebfiwb-chft.vercel.app';

// Validate environment variables
if (!API_URL || !API_BASE_URL) {
  console.warn('⚠️ API URLs not properly configured in environment variables');
}

// Validate API URL format
if (!API_URL.endsWith('/api')) {
  console.warn('⚠️ API_URL should end with /api');
}

// Log the current configuration
console.log('🔧 API Configuration:', {
  API_URL,
  API_BASE_URL,
  NODE_ENV: import.meta.env.MODE
});

export { API_URL, API_BASE_URL }; 