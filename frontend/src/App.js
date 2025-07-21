import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import EmailVerification from './components/EmailVerification';
import AdminDashboard from './components/AdminDashboard';
import PaymentManager from './components/PaymentManager';
import Navbar from './components/Navbar';
import StatsPage from './components/StatsPage';
import './App.css';

// Configure axios defaults
const baseURL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_SERVER_ENDPOINT || 'https://affiliatelinkweb.onrender.com') + '/api'
  : (process.env.REACT_APP_SERVER_ENDPOINT || 'http://localhost:5000/api');

console.log('Axios baseURL:', baseURL);
console.log('NODE_ENV:', process.env.NODE_ENV);

axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/check');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} logout={logout} />}
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Home />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} logout={logout} setUser={setUser} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/payments" 
            element={user ? <PaymentManager user={user} setUser={setUser} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/forgot-password" 
            element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} 
          />
          <Route 
            path="/reset-password" 
            element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} 
          />
          <Route 
            path="/verify-email" 
            element={<EmailVerification />} 
          />
          <Route 
            path="/admin" 
            element={
              user && user.role === 'admin' 
                ? <AdminDashboard /> 
                : <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/stats/group/:groupId" 
            element={<StatsPage user={user} />} 
          />
          <Route 
            path="/stats/:linkId" 
            element={<StatsPage user={user} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
