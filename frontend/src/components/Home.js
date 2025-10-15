import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import './Home.css';

const Home = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const fabVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 1
      }
    },
    hover: {
      scale: 1.1,
      rotate: 90,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="home"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="main-panel">
        
        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="main-content">
          <div className="content-left">
            <motion.h1 
              className="app-title"
              variants={itemVariants}
            >
              Tracklytics
            </motion.h1>
            <motion.p 
              className="app-subtitle"
              variants={itemVariants}
            >
              Organize, save, and manage your favorite links in one place
            </motion.p>
            
            {/* Feature Cards */}
            <motion.div 
              className="feature-cards"
              variants={containerVariants}
            >
              <motion.div 
                className="feature-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <h3>Save Links</h3>
                <p>Store your favorite website URLs with custom titles and descriptions</p>
              </motion.div>
              
              <motion.div 
                className="feature-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <h3>Tag & Organize</h3>
                <p>Use tags to categorize and find your saved links</p>
              </motion.div>
              
              <motion.div 
                className="feature-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3>Search & Filter</h3>
                <p>Quickly find the links you need with a powerful search</p>
              </motion.div>
              <motion.div 
                className="action-buttons"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/register" className="btn-primary">Get Started</Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/login" className="btn-secondary">Sign In</Link>
                </motion.div>
              </motion.div>
            </motion.div>

          
          </div>

          <motion.div 
            className="content-right"
            variants={imageVariants}
          >
            <div className="modern-image-container">
              <div className="image-wrapper">
                <img
                  src={`${process.env.PUBLIC_URL}/photoW.png`}
                  alt="Tracklytics Preview"
                  loading="lazy"
                  decoding="async"
                  className="modern-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="image-fallback" style={{display: 'none'}}>
                  <div className="fallback-content">
                    <div className="fallback-icon">📱</div>
                    <h3>TrackLytics</h3>
                    <p>Link Management Made Simple</p>
                  </div>
                </div>
                <div className="image-overlay"></div>
                <div className="floating-elements">
                  <div className="floating-dot dot-1"></div>
                  <div className="floating-dot dot-2"></div>
                  <div className="floating-dot dot-3"></div>
                </div>
                <div className="image-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🔗</div>
                    <span>TrackLytics</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Action Button */}
        <motion.div 
          className="fab"
          variants={fabVariants}
          whileHover="hover"
        >
          <svg className="fab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default memo(Home); 