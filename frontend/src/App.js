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
import './App.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

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
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
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
            element={user ? <Dashboard user={user} logout={logout} /> : <Navigate to="/login" />} 
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
