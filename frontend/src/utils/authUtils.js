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
  
  try {
    // Basic JWT decoding to check expiration
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return false;
    
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    
    if (!payload.exp) return true; // If no expiration, assume valid
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Refresh the authentication token
 * @returns {Promise<boolean>} True if token was successfully refreshed
 */
export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const response = await fetch(`${API_ENDPOINTS.admin}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        return true;
      }
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