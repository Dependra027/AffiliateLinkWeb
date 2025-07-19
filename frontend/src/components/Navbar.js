import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, logout }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    if (!showNotifications) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

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

  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span style={{ fontWeight: 700, fontSize: '1.3rem', color: '#ffe082' }}>TrackLytics</span>
      </div>
      <ul className="navbar-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/payments">Payments</Link></li>
        {user && user.role === 'admin' && (
          <li><Link to="/admin">Admin</Link></li>
        )}
      </ul>
      <div className="navbar-user-info">
        {user && <span style={{ color: '#ffe082', marginRight: 12 }}>Welcome, {user.username}!</span>}
        {user && <span className="credits-display" style={{ color: '#fff', marginRight: 12 }}>Credits: {user.credits || 0}</span>}
        <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
          <span role="img" aria-label="Notifications">🔔</span>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>
        {showNotifications && (
          <div className="notification-dropdown" ref={dropdownRef}>
            <div className="notification-header">
              Notifications
              {unreadCount > 0 && (
                <button className="mark-all-btn" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-item">(No notifications yet)</div>
              ) : notifications.map(n => (
                <div
                  key={n._id}
                  className={`notification-item${!n.read ? ' unread' : ''}`}
                  onClick={() => handleNotificationClick(n._id, n.read)}
                  style={{ cursor: !n.read ? 'pointer' : 'default' }}
                >
                  {!n.read && <span className="unread-dot" title="Unread"></span>}
                  {n.message}
                  {n.milestone && (
                    <span style={{ color: '#3498db', marginLeft: 8 }}>
                      (Milestone: {n.milestone})
                    </span>
                  )}
                  <div style={{ fontSize: '0.8em', color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="navbar-logout">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar; 