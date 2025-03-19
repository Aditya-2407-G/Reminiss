import axios from 'axios';

// Create Axios instance with proper defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true, // Important for handling cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to handle auth
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    // Log success response for debugging
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Prevent infinite loops
    if (!originalRequest || originalRequest._isRetry) {
      return Promise.reject(error);
    }
    
    // If the error is a 401 (Unauthorized)
    if (error.response?.status === 401) {
      originalRequest._isRetry = true;
      
      try {
        console.log('Attempting to refresh token...');
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/refresh`, 
          {}, 
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
        console.log('Token refresh successful:', refreshResponse.status);
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Only redirect to login if not already on login or register page
        if (window.location.pathname !== '/login' && 
            window.location.pathname !== '/register') {
          console.log('Redirecting to login...');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;