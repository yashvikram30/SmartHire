import axios from 'axios';
import useAuthStore from '@store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api/v1',
  withCredentials: true, // Important for httpOnly cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Set Content-Type to application/json for non-FormData requests
    // For FormData, axios will automatically set multipart/form-data with boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if a token refresh is in progress
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if:
    // 1. Response is not 401
    // 2. Request was already retried (_retry flag prevents infinite loops)
    // 3. Request is to the refresh-token endpoint itself (prevents infinite refresh loops)
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }
    
    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }
    
    // Mark this request as retried to prevent infinite loops
    originalRequest._retry = true;
    isRefreshing = true;
    
    try {
      // Attempt to refresh token using the refresh token stored in httpOnly cookie
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh-token`,
        {},
        { 
          withCredentials: true // Send httpOnly cookie with refresh token
        }
      );
      
      // Check if refresh was successful and we have the new access token
      if (data.success && data.data?.accessToken) {
        // Update access token in store
        const { setAuth } = useAuthStore.getState();
        // Note: Refresh token endpoint returns only accessToken, not user data
        // User data is already in the store from initial login
        const currentUser = useAuthStore.getState().user;
        setAuth(currentUser, data.data.accessToken);
        
        // Process all queued requests with the new token
        processQueue(null, data.data.accessToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } else {
        // Unexpected response format - treat as refresh failure
        throw new Error('Invalid refresh token response');
      }
    } catch (refreshError) {
      // Refresh token failed (expired, invalid, or network error)
      // Process failed queue to reject all pending requests
      processQueue(refreshError, null);
      
      // Logout user and clear all auth data
      const { logout } = useAuthStore.getState();
      logout();
      
      // The logout function in authStore should handle navigation
      // If it doesn't, the route protection will redirect to login
      // when user tries to access protected routes
      
      // Reject with the refresh error
      return Promise.reject(refreshError);
    } finally {
      // Always reset the refreshing flag
      isRefreshing = false;
    }
  }
);

export default api;
