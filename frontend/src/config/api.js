export const BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5001' 
    : 'https://ajc1church-2.onrender.com');
const API_BASE_URL = `${BASE_URL}/api`;

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/admin`,
  admin: `${API_BASE_URL}/admin`,
  allevents: `${API_BASE_URL}/events`,
  blogArticles: `${API_BASE_URL}/blog`,
  contact: `${API_BASE_URL}/contact`,
  eventRegistration: `${API_BASE_URL}/eventregistration`,
  adminEventRegistration: `${API_BASE_URL}/admin/eventregistration`,
  EVENT_REGISTRATIONS: `${API_BASE_URL}/eventregistration`,
  donations: `${API_BASE_URL}/donations`,
  adminDonations: `${API_BASE_URL}/admin/donations`,
  donationStats: `${API_BASE_URL}/admin/donations/stats`,
  prayerRequests: `${API_BASE_URL}/prayer-requests`
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};