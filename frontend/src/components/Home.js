import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="main-panel">
        
        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="main-content">
          <div className="content-left">
            <h1 className="app-title">Tracklytics</h1>
            <p className="app-subtitle">Organize, save, and manage your favorite links in one place</p>
            
            {/* Feature Cards */}
            <div className="feature-cards">
              <div className="feature-card">
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <h3>Save Links</h3>
                <p>Store your favorite website URLs with custom titles and descriptions</p>
              </div>
              
              <div className="feature-card">
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <h3>Tag & Organize</h3>
                <p>Use tags to categorize and find your saved links</p>
              </div>
              
              <div className="feature-card">
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3>Search & Filter</h3>
                <p>Quickly find the links you need with a powerful search</p>
              </div>
              <div className="action-buttons">
              <Link to="/register" className="btn-primary">Get Started</Link>
              <Link to="/login" className="btn-secondary">Sign In</Link>
            </div>
            </div>

          
          </div>

          <div className="content-right">
            {/* Photo placeholder - you can add your image here */}
            <div style={{
              width: '400px',
              height: '400px',
              backgroundColor: 'transparent',
              
             borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#aaa',
              fontSize: '1.2rem',
              
            }}>
            
            <img
      src={`${process.env.PUBLIC_URL}/photoW.png`}
      alt="Tracklytics Preview"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 'inherit',
        display: 'block'
      }}
    />
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fab">
          <svg className="fab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Home; 