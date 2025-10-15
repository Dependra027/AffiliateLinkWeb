import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import './App.css';

// Lazy load heavy components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const EmailVerification = lazy(() => import('./components/EmailVerification'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const PaymentManager = lazy(() => import('./components/PaymentManager'));
const StatsPage = lazy(() => import('./components/StatsPage'));

// Loading component for Suspense
const LoadingSpinner = () => (
  <motion.div 
    className="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div 
      className="spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      Loading...
    </motion.p>
  </motion.div>
);

// Configure axios defaults
const baseURL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_SERVER_ENDPOINT || 'https://affiliatelinkweb.onrender.com') + '/api'
  : (process.env.REACT_APP_SERVER_ENDPOINT || 'http://localhost:5000/api');

console.log('Axios baseURL:', baseURL);
console.log('NODE_ENV:', process.env.NODE_ENV);

axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: -20,
    scale: 0.98
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

// Page transition wrapper component
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

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

// Animated routes component
const AnimatedRoutes = ({ user, logout, setUser }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            user ? 
            <Navigate to="/dashboard" replace /> : 
            <PageTransition><Home /></PageTransition>
          } 
        />
        <Route 
          path="/login" 
          element={
            user ? 
            <Navigate to="/dashboard" replace /> : 
            <PageTransition><Login setUser={setUser} /></PageTransition>
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? 
            <Navigate to="/dashboard" replace /> : 
            <PageTransition><Register setUser={setUser} /></PageTransition>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? 
            <PageTransition>
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard user={user} logout={logout} setUser={setUser} />
              </Suspense>
            </PageTransition> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/payments" 
          element={
            user ? 
            <PageTransition>
              <Suspense fallback={<LoadingSpinner />}>
                <PaymentManager user={user} setUser={setUser} />
              </Suspense>
            </PageTransition> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            user ? 
            <Navigate to="/dashboard" replace /> : 
            <PageTransition>
              <Suspense fallback={<LoadingSpinner />}>
                <ForgotPassword />
              </Suspense>
            </PageTransition>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            user ? 
            <Navigate to="/dashboard" replace /> : 
            <PageTransition>
              <Suspense fallback={<LoadingSpinner />}>
                <ResetPassword />
              </Suspense>
            </PageTransition>
          } 
        />
        <Route 
          path="/verify-email" 
          element={
            <PageTransition>
              <Suspense fallback={<LoadingSpinner />}>
                <EmailVerification />
              </Suspense>
            </PageTransition>
          } 
        />
        <Route 
          path="/admin" 
          element={
            user && user.role === 'admin' 
              ? <PageTransition>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminDashboard />
                  </Suspense>
                </PageTransition>
              : <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/stats/group/:groupId" 
          element={
            <PageTransition>
              <Suspense fallback={<LoadingSpinner />}>
                <StatsPage user={user} />
              </Suspense>
            </PageTransition>
          } 
        />
        <Route 
          path="/stats/:linkId" 
          element={
            <PageTransition>
              <Suspense fallback={<LoadingSpinner />}>
                <StatsPage user={user} />
              </Suspense>
            </PageTransition>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

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
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} logout={logout} setUser={setUser} />}
        <AnimatedRoutes user={user} logout={logout} setUser={setUser} />
      </div>
    </Router>
  );
}

export default App;
