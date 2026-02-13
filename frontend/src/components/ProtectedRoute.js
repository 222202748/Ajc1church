import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isTokenValid, refreshToken, logout } from '../utils/authUtils';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists and is valid
        if (isTokenValid()) {
          setIsAuthenticated(true);
        } else {
          // Try to refresh the token if it exists but might be expired
          const token = localStorage.getItem('token');
          if (token) {
            const refreshed = await refreshToken();
            setIsAuthenticated(refreshed);
            if (!refreshed) {
              // If refresh failed, logout
              logout();
            }
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/Admin" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;