import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="home-container">
        <div className="hero-section">
          <h1>TrackLytics</h1>
          <p className="subtitle">Organize, save, and manage your favorite links in one place</p>
          <div className="features">
            <div className="feature">
              <span className="feature-icon">🔗</span>
              <h3>Save Links</h3>
              <p>Store your favorite websites with custom titles and descriptions</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🏷️</span>
              <h3>Tag & Organize</h3>
              <p>Use tags to categorize and easily find your saved links</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🔍</span>
              <h3>Search & Filter</h3>
              <p>Quickly find the links you need with powerful search</p>
            </div>
          </div>
        </div>
        
        <div className="cta-section">
          <p>Ready to organize your links?</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 