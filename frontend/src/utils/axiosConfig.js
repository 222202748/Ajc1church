import { refreshToken, logout, isTokenValid } from './authUtils';
import { getAuthHeader, BASE_URL } from '../config/api';

// Helper to ensure URL is absolute
const getFullUrl = (url) => {
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
};

// Custom fetch wrapper with similar API to axios
const fetchWrapper = {
  // GET request
  get: async (url, options = {}) => {
    const fullUrl = getFullUrl(url);
    const requiresAuth = options.requiresAuth !== false;
    try {
      // Check if token is valid, try to refresh if needed
      if (requiresAuth && !isTokenValid()) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          // If refresh failed, redirect to login
          logout();
          throw new Error('Authentication failed');
        }
      }
      
      // Use the full URL as provided from API_ENDPOINTS
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      
      if (!response.ok) {
        // Handle 401 errors only for auth-required requests
        if (requiresAuth && response.status === 401) {
          // Try to refresh the token
          const refreshed = await refreshToken();
          
          if (refreshed) {
            // If token refresh was successful, retry the request
            return fetchWrapper.get(url, options);
          } else {
            // If refresh failed, logout
            logout();
            throw new Error('Authentication failed');
          }
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },
  
  // POST request
  post: async (url, body, options = {}) => {
    const fullUrl = getFullUrl(url);
    const requiresAuth = options.requiresAuth !== false;
    try {
      // Check if token is valid, try to refresh if needed
      if (requiresAuth && !isTokenValid()) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          // If refresh failed, redirect to login
          logout();
          throw new Error('Authentication failed');
        }
      }
      
      const isFormData = body instanceof FormData;
      
      // Use the full URL as provided from API_ENDPOINTS
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          ...(!isFormData && { 'Content-Type': 'application/json' }),
          ...getAuthHeader()
        },
        body: isFormData ? body : JSON.stringify(body)
      });
      
      if (!response.ok) {
        // Handle 401 errors only for auth-required requests
        if (requiresAuth && response.status === 401) {
          // Try to refresh the token
          const refreshed = await refreshToken();
          
          if (refreshed) {
            // If token refresh was successful, retry the request
            return fetchWrapper.post(url, body, options);
          } else {
            // If refresh failed, logout
            logout();
            throw new Error('Authentication failed');
          }
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },
  
  // DELETE request
  delete: async (url, options = {}) => {
    const fullUrl = getFullUrl(url);
    const requiresAuth = options.requiresAuth !== false;
    try {
      // Check if token is valid, try to refresh if needed
      if (requiresAuth && !isTokenValid()) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          // If refresh failed, redirect to login
          logout();
          throw new Error('Authentication failed');
        }
      }
      
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      
      if (!response.ok) {
        // Handle 401 errors only for auth-required requests
        if (requiresAuth && response.status === 401) {
          // Try to refresh the token
          const refreshed = await refreshToken();
          
          if (refreshed) {
            // If token refresh was successful, retry the request
            return fetchWrapper.delete(url, options);
          } else {
            // If refresh failed, logout
            logout();
            throw new Error('Authentication failed');
          }
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return { status: response.status };
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
  ,
  // PATCH request
  patch: async (url, body, options = {}) => {
    const fullUrl = getFullUrl(url);
    const requiresAuth = options.requiresAuth !== false;
    try {
      if (requiresAuth && !isTokenValid()) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          logout();
          throw new Error('Authentication failed');
        }
      }
      const isFormData = body instanceof FormData;
      const response = await fetch(fullUrl, {
        method: 'PATCH',
        headers: {
          ...(!isFormData && { 'Content-Type': 'application/json' }),
          ...getAuthHeader()
        },
        body: isFormData ? body : JSON.stringify(body)
      });
      if (!response.ok) {
        if (requiresAuth && response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            return fetchWrapper.patch(url, body, options);
          } else {
            logout();
            throw new Error('Authentication failed');
          }
        }
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
};

export default fetchWrapper;
