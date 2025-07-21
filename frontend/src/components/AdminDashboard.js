import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingLink, setEditingLink] = useState(null);

  // Form states
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    userId: ''
  });

  const fetchData = useCallback(async (tab = activeTab) => {
    try {
      setLoading(true);
      setError('');

      if (tab === 'stats') {
        const response = await axios.get('/admin/stats');
        setStats(response.data);
      } else if (tab === 'users') {
        const response = await axios.get('/admin/users');
        setUsers(response.data);
      } else if (tab === 'links') {
        const response = await axios.get('/admin/links');
        setLinks(response.data);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (err.response?.status === 401) {
        setError('Please log in to access admin features.');
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData(activeTab);
  }, [fetchData, activeTab]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/admin/users/${editingUser._id}`, { ...userForm, password: undefined });
      } else {
        await axios.post('/admin/users', userForm);
      }
      
      setShowUserForm(false);
      setEditingUser(null);
      setUserForm({ username: '', email: '', password: '', role: 'user' });
      fetchData(activeTab);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...linkForm,
        tags: linkForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingLink) {
        await axios.put(`/admin/links/${editingLink._id}`, body);
      } else {
        await axios.post('/admin/links', body);
      }
      
      setShowLinkForm(false);
      setEditingLink(null);
      setLinkForm({ title: '', url: '', description: '', tags: '', userId: '' });
      fetchData(activeTab);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`/admin/users/${userId}`);
      fetchData(activeTab);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    
    try {
      await axios.delete(`/admin/links/${linkId}`);
      fetchData(activeTab);
    } catch (err) {
      setError(err.message);
    }
  };

  const editUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowUserForm(true);
  };

  const editLink = (link) => {
    setEditingLink(link);
    setLinkForm({
      title: link.title,
      url: link.url,
      description: link.description || '',
      tags: link.tags.join(', '),
      userId: link.userId._id
    });
    setShowLinkForm(true);
  };

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <a href='./dashboard'>Go back</a>
      <div className="admin-tabs">
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
        <button 
          className={activeTab === 'links' ? 'active' : ''} 
          onClick={() => setActiveTab('links')}
        >
          Manage Links
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="admin-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{stats.stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Links</h3>
              <p>{stats.stats.totalLinks}</p>
            </div>
            <div className="stat-card">
              <h3>Verified Users</h3>
              <p>{stats.stats.verifiedUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Admin Users</h3>
              <p>{stats.stats.adminUsers}</p>
            </div>
          </div>

          <div className="recent-data">
            <div className="recent-users">
              <h3>Recent Users</h3>
              <div className="data-list">
                {stats.recentUsers.filter(Boolean).map(user => (
                  user ? (
                    <div key={user._id} className="data-item">
                      <span>{user.username}</span>
                      <span className={`role ${user.role}`}>{user.role}</span>
                      <span className={`verified ${user.isEmailVerified ? 'yes' : 'no'}`}>
                        {user.isEmailVerified ? '✓' : '✗'}
                      </span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>

            <div className="recent-links">
              <h3>Recent Links</h3>
              <div className="data-list">
                {stats.recentLinks.filter(Boolean).map(link => (
                  link && link.userId && link.userId.username ? (
                    <div key={link._id} className="data-item">
                      <span>{link.title}</span>
                      <span className="user">{link.userId.username}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-users">
          <div className="section-header">
            <h2>Manage Users</h2>
            <button onClick={() => setShowUserForm(true)}>Add New User</button>
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role ${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`verified ${user.isEmailVerified ? 'yes' : 'no'}`}>
                        {user.isEmailVerified ? '✓' : '✗'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => editUser(user)}>Edit</button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="admin-links">
          <div className="section-header">
            <h2>Manage Links</h2>
            <button onClick={() => setShowLinkForm(true)}>Add New Link</button>
          </div>

          <div className="links-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>URL</th>
                  <th>User</th>
                  <th>Tags</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link._id}>
                    <td>{link.title}</td>
                    <td>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.url}
                      </a>
                    </td>
                    <td>{link.userId.username}</td>
                    <td>
                      <div className="tags">
                        {link.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td>{new Date(link.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => editLink(link)}>Edit</button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteLink(link._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleUserSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                />
              </div>
              {!editingUser && (
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Role:</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                    setUserForm({ username: '', email: '', password: '', role: 'user' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Form Modal */}
      {showLinkForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingLink ? 'Edit Link' : 'Add New Link'}</h2>
            <form onSubmit={handleLinkSubmit}>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={linkForm.title}
                  onChange={(e) => setLinkForm({...linkForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>URL:</label>
                <input
                  type="url"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({...linkForm, url: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={linkForm.description}
                  onChange={(e) => setLinkForm({...linkForm, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated):</label>
                <input
                  type="text"
                  value={linkForm.tags}
                  onChange={(e) => setLinkForm({...linkForm, tags: e.target.value})}
                />
              </div>
              {!editingLink && (
                <div className="form-group">
                  <label>User ID:</label>
                  <input
                    type="text"
                    value={linkForm.userId}
                    onChange={(e) => setLinkForm({...linkForm, userId: e.target.value})}
                    required
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowLinkForm(false);
                    setEditingLink(null);
                    setLinkForm({ title: '', url: '', description: '', tags: '', userId: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 