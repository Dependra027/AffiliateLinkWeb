import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const verifyEmail = useCallback(async (token) => {
    try {
      const response = await axios.get(`/auth/verify-email/${token}`);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred during email verification');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams, verifyEmail]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verifying Email</h2>
          <p className="auth-subtitle">Please wait while we verify your email address...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Email Verification</h2>
        
        {error ? (
          <>
            <div className="error-message">{error}</div>
            <p className="auth-subtitle">Please try again or contact support if the problem persists.</p>
            <div className="auth-footer">
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                Go to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="success-message">{message}</div>
            <p className="auth-subtitle">You will be redirected to your dashboard shortly...</p>
            <div className="auth-footer">
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification; 