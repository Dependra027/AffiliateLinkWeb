import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Navbar.css';
import { FaBars, FaTimes, FaTachometerAlt, FaMoneyBillWave, FaUserShield } from 'react-icons/fa';

function Navbar({ user, logout, setUser }) {
  // const navigate = useNavigate(); // Removed unused variable
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  // Animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.2
      }
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const notificationVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      backgroundColor: '#f0f0f0',
      transition: {
        duration: 0.2
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (showNotifications) {
      fetch('/api/notifications', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          // Sort by createdAt descending (most recent first)
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.read).length);
        });
    }
  }, [showNotifications]);

  // Close dropdown on outside click (but not when clicking bell or dropdown)
  useEffect(() => {
    if (!showNotifications) return;
    function handleClickOutside(event) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        bellRef.current && !bellRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Refresh credits when component mounts and listen for credit updates
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await axios.get('/payments/credits');
        setUser(prev => ({ ...prev, credits: response.data.credits }));
      } catch (error) {
        console.error('Error refreshing credits in navbar:', error);
      }
    };
    
    // Fetch credits when component mounts
    if (user) {
      fetchCredits();
    }
    
    // Listen for custom credit update events
    const handleCreditUpdate = () => {
      if (user) {
        fetchCredits();
      }
    };
    
    // Add event listener for credit updates
    window.addEventListener('creditsUpdated', handleCreditUpdate);
    
    return () => {
      window.removeEventListener('creditsUpdated', handleCreditUpdate);
    };
  }, [user, setUser]);

  // Mark a single notification as read when clicked
  const handleNotificationClick = async (id, read) => {
    if (!read) {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Mark all notifications as seen (delete all)
  const markAllAsSeen = async () => {
    try {
      await fetch('/api/notifications/delete-all', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
      // The logout function in App.js will handle the redirect
    }
  };

  if (isMobile) {
    return (
      <motion.nav 
        className="navbar slim-navbar"
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mobile-navbar-content">
          <motion.div 
            className="navbar-title-left"
            variants={linkVariants}
          >
            <Link to="/dashboard" className="mobile-logo-container">
              <img 
                src={`${process.env.PUBLIC_URL}/tracklytics-icon.svg`} 
                alt="TrackLytics" 
                className="navbar-logo-mobile"
              />
              <span className="navbar-brand-text">TrackLytics</span>
            </Link>
          </motion.div>
          
          <div className="mobile-navbar-actions">
            <motion.div
              className="notification-bell"
              ref={bellRef}
              onClick={() => setShowNotifications(s => !s)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span role="img" aria-label="Notifications">🔔</span>
              {unreadCount > 0 && (
                <motion.span 
                  className="notification-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.div>
            
            <motion.button 
              className="navbar-menu-btn" 
              onClick={() => setMenuOpen(m => !m)} 
              aria-label="Menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </motion.button>
          </div>
        </div>
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                className="notification-dropdown" 
                ref={dropdownRef}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="notification-header">
                  <div className="notification-title">
                    <span>🔔</span>
                    Notifications
                  </div>
                  {notifications.length > 0 && (
                    <div className="notification-actions">
                      {unreadCount > 0 && (
                        <motion.button 
                          className="mark-all-btn" 
                          onClick={markAllAsRead}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Mark as read
                        </motion.button>
                      )}
                      <motion.button 
                        className="mark-seen-btn" 
                        onClick={markAllAsSeen}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Mark all as seen
                      </motion.button>
                    </div>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-item">(No notifications yet)</div>
                  ) : notifications.map(n => (
                    <motion.div
                      key={n._id}
                      className={`notification-item${!n.read ? ' unread' : ''}`}
                      onClick={() => handleNotificationClick(n._id, n.read)}
                      style={{ cursor: !n.read ? 'pointer' : 'default' }}
                      variants={notificationVariants}
                      whileHover="hover"
                    >
                      {!n.read && <span className="unread-dot" title="Unread"></span>}
                      {n.message}
                      {n.milestone && (
                        <span style={{ color: '#3498db', marginLeft: 8 }}>
                          (Milestone: {n.milestone})
                        </span>
                      )}
                      <div style={{ fontSize: '0.8em', color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            >
              <motion.ul 
                className="navbar-links-dropdown"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="mobile-menu-item">
                    <FaTachometerAlt className="menu-icon" />
                    <span className="menu-text">Dashboard</span>
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link to="/payments" onClick={() => setMenuOpen(false)} className="mobile-menu-item">
                    <FaMoneyBillWave className="menu-icon" />
                    <span className="menu-text">Payments</span>
                  </Link>
                </motion.li>
                {user && user.role === 'admin' && (
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="mobile-menu-item">
                      <FaUserShield className="menu-icon" />
                      <span className="menu-text">Admin Panel</span>
                    </Link>
                  </motion.li>
                )}
                <motion.div 
                  className="mobile-menu-divider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                />
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button onClick={handleLogout} className="mobile-menu-item logout-item">
                    <span className="menu-icon">🚪</span>
                    <span className="menu-text">Logout</span>
                  </button>
                </motion.li>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    );
  }

  // Desktop layout
  return (
    <motion.nav 
      className="navbar"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="navbar-logo"
        variants={linkVariants}
      >
        <Link to="/dashboard" className="navbar-logo-container">
          <img 
            src={`${process.env.PUBLIC_URL}/tracklytics-icon.svg`} 
            alt="TrackLytics" 
            className="navbar-logo-icon"
          />
          <span className="navbar-logo-text">TrackLytics</span>
        </Link>
      </motion.div>
      <motion.ul 
        className="navbar-links"
        variants={containerVariants}
      >
        <motion.li variants={linkVariants}>
          <motion.div whileHover="hover">
            <Link to="/dashboard" className="nav-icon-link" title="Dashboard" aria-label="Dashboard"><FaTachometerAlt /></Link>
          </motion.div>
        </motion.li>
        <motion.li variants={linkVariants}>
          <motion.div whileHover="hover">
            <Link to="/payments" className="nav-icon-link" title="Payments" aria-label="Payments"><FaMoneyBillWave /></Link>
          </motion.div>
        </motion.li>
        {user && user.role === 'admin' && (
          <motion.li variants={linkVariants}>
            <motion.div whileHover="hover">
              <Link to="/admin" className="nav-icon-link" title="Admin" aria-label="Admin"><FaUserShield /></Link>
            </motion.div>
          </motion.li>
        )}
      </motion.ul>
      <motion.div 
        className="navbar-user-info"
        variants={linkVariants}
      >
        {user && <span style={{ color: '#ffe082', marginRight: 12 }}>Welcome, {user.username}!</span>}
        {user && (
          <span 
            className={`credits-display ${user.credits === 1 ? 'free-credit-highlight' : ''}`} 
            style={{ color: '#fff', marginRight: 12 }}
          >
            Credits: {user.credits || 0}
            {user.credits === 1 && <span className="free-credit-badge">🎉 FREE!</span>}
          </span>
        )}
        <motion.div
          className="notification-bell"
          ref={bellRef}
          onClick={() => setShowNotifications(s => !s)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span role="img" aria-label="Notifications">🔔</span>
          {unreadCount > 0 && (
            <motion.span 
              className="notification-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {unreadCount}
            </motion.span>
          )}
        </motion.div>
        <AnimatePresence>
          {showNotifications && (
            <motion.div 
              className="notification-dropdown" 
              ref={dropdownRef}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="notification-header">
                <div className="notification-title">
                  <span>🔔</span>
                  Notifications
                </div>
                {notifications.length > 0 && (
                  <div className="notification-actions">
                    {unreadCount > 0 && (
                      <motion.button 
                        className="mark-all-btn" 
                        onClick={markAllAsRead}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Mark as read
                      </motion.button>
                    )}
                    <motion.button 
                      className="mark-seen-btn" 
                      onClick={markAllAsSeen}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Mark all as seen
                    </motion.button>
                  </div>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-item">(No notifications yet)</div>
                ) : notifications.map(n => (
                  <motion.div
                    key={n._id}
                    className={`notification-item${!n.read ? ' unread' : ''}`}
                    onClick={() => handleNotificationClick(n._id, n.read)}
                    style={{ cursor: !n.read ? 'pointer' : 'default' }}
                    variants={notificationVariants}
                    whileHover="hover"
                  >
                    {!n.read && <span className="unread-dot" title="Unread"></span>}
                    {n.message}
                    {n.milestone && (
                      <span style={{ color: '#3498db', marginLeft: 8 }}>
                        (Milestone: {n.milestone})
                      </span>
                    )}
                    <div style={{ fontSize: '0.8em', color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button 
          onClick={handleLogout} 
          className="navbar-logout"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Logout
        </motion.button>
      </motion.div>
    </motion.nav>
  );
}

export default Navbar; 