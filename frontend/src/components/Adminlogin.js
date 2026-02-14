import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Use the correct endpoint path with axiosInstance
      // API_ENDPOINTS already includes the correct base URL
      const response = await axiosInstance.post(`${API_ENDPOINTS.admin}/login`, { 
        username, 
        password 
      }, { requiresAuth: false });
      
      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      // Redirect to admin dashboard
      navigate('/Admin/dashboard');
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.message.includes('buffering timed out') || error.message.includes('not connected')) {
        errorMessage = 'Database connection error. Please ensure the backend can reach MongoDB Atlas (check IP whitelist).';
      } else if (error.message.toLowerCase().includes('invalid credentials') || error.message.includes('401')) {
        errorMessage = 'Invalid username or password.';
      } else if (error.message.includes('Server configuration error')) {
        errorMessage = 'Server configuration error. Please ensure all environment variables (like JWT_SECRET) are set on the production server.';
      } else {
        errorMessage = error.message || 'Login failed. Please check your credentials.';
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '40px',
    backgroundColor: '#1e3a2e',
    color: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    textAlign: 'center'
  },
  title: {
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: 'bold'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    pointerEvents: 'auto', // ✅ Ensure input is not blocked
    backgroundColor: '#fff',
    color: '#000'
  },
  button: {
    padding: '12px',
    backgroundColor: '#d4b896',
    color: '#2d5a4a',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  },
  error: {
    color: '#ff6b6b',
    fontSize: '14px'
  }
};

export default AdminLogin;
