// client/src/config/env.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ebfiwb-chft.vercel.app';
const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`;

// Ensure no double slashes in URLs
const cleanUrl = (url: string) => url.replace(/([^:]\/)\/+/g, '$1');
const API_URL_CLEAN = cleanUrl(API_URL);
const API_BASE_URL_CLEAN = cleanUrl(API_BASE_URL);

// Validate environment variables
if (!API_URL_CLEAN || !API_BASE_URL_CLEAN) {
  console.warn('⚠️ API URLs not properly configured in environment variables');
}

// Validate API URL format
if (!API_URL_CLEAN.endsWith('/api')) {
  console.warn('⚠️ API_URL should end with /api');
}

// Log the current configuration
console.log('🔧 API Configuration:', {
  API_URL: API_URL_CLEAN,
  API_BASE_URL: API_BASE_URL_CLEAN,
  NODE_ENV: import.meta.env.MODE
});

export { API_URL_CLEAN as API_URL, API_BASE_URL_CLEAN as API_BASE_URL }; 