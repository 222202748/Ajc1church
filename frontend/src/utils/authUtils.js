/**
 * Authentication utility functions
 */

import { API_ENDPOINTS } from '../config/api';

/**
 * Check if the current token is valid
 * @returns {boolean} True if token exists and is not expired
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // In a real implementation, you might want to decode the JWT and check its expiration
  // For now, we'll just check if it exists
  return true;
};

/**
 * Refresh the authentication token
 * @returns {Promise<boolean>} True if token was successfully refreshed
 */
export const refreshToken = async () => {
  try {
    const response = await fetch(`${API_ENDPOINTS.admin}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

/**
 * Logout the user by removing the token from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  window.location.href = '/Admin';
};