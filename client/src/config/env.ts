// client/src/config/env.ts

// Helper function to ensure proper URL formatting
const formatUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove trailing slashes
  let formatted = url.replace(/\/+$/, '');
  
  // Ensure protocol
  if (!formatted.startsWith('http')) {
    formatted = `https://${formatted}`;
  }
  
  return formatted;
};

// Get base URL and ensure proper formatting
const API_BASE_URL = formatUrl(import.meta.env.VITE_API_BASE_URL || 'ebfiwb-chft.vercel.app');

// Construct API URL - ensure it ends with /api
const rawApiUrl = import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`;
const API_URL = formatUrl(rawApiUrl).replace(/\/api$/, '') + '/api';

// Validate URLs
if (!API_URL || !API_BASE_URL) {
  console.error('❌ API URLs not properly configured in environment variables');
  throw new Error('API URLs not properly configured');
}

// Log the current configuration
console.log('🔧 API Configuration:', {
  API_URL,
  API_BASE_URL,
  NODE_ENV: import.meta.env.MODE,
  ENV_VARS: {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
  }
});

export { API_URL, API_BASE_URL }; 