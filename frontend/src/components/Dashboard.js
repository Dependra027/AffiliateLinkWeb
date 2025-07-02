import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ user, logout }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    tags: ''
  });
  const [errors, setErrors] = useState({});

  const fetchLinks = useCallback(async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedTag) params.tag = selectedTag;
      
      const response = await axios.get('/links', { params });
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedTag]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const linkData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      const response = await axios.post('/links', linkData);
      setLinks([response.data, ...links]);
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.param] = err.msg;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Failed to add link' });
      }
    }
  };

  const handleEditLink = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const linkData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      const response = await axios.put(`/links/${editingLink._id}`, linkData);
      setLinks(links.map(link => link._id === editingLink._id ? response.data : link));
      resetForm();
      setEditingLink(null);
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.param] = err.msg;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Failed to update link' });
      }
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;

    try {
      await axios.delete(`/links/${linkId}`);
      setLinks(links.filter(link => link._id !== linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const startEdit = (link) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      tags: link.tags ? link.tags.join(', ') : ''
    });
  };

  const cancelEdit = () => {
    setEditingLink(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      tags: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = 'Please enter a valid URL starting with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  // Get unique tags from all links
  const allTags = [...new Set(links.flatMap(link => link.tags || []))];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Links</h1>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            {/* {!user.isEmailVerified && (
              <span className="email-warning">⚠️ Email not verified</span>
            )} */}
            {user.role === 'admin' && (
              <a href="/admin" className="admin-link">Manage Users</a>
            )}
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="controls">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="tag-filter"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
            disabled={editingLink}
          >
            Add New Link
          </button>
        </div>

        {(showAddForm || editingLink) && (
          <div className="form-container">
            <h3>{editingLink ? 'Edit Link' : 'Add New Link'}</h3>
            {errors.general && (
              <div className="error-message">{errors.general}</div>
            )}
            <form onSubmit={editingLink ? handleEditLink : handleAddLink}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? 'error' : ''}
                  placeholder="Enter link title"
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>
              
              <div className="form-group">
                <label>URL *</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className={errors.url ? 'error' : ''}
                  placeholder="https://example.com"
                />
                {errors.url && <span className="error-text">{errors.url}</span>}
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="tag1, tag2, tag3 (comma separated)"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingLink ? 'Update Link' : 'Add Link'}
                </button>
                <button
                  type="button"
                  onClick={editingLink ? cancelEdit : () => setShowAddForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="links-container">
          {loading ? (
            <div className="loading">Loading links...</div>
          ) : links.length === 0 ? (
            <div className="empty-state">
              <p>No links found. {searchTerm || selectedTag ? 'Try adjusting your search or filters.' : 'Add your first link to get started!'}</p>
            </div>
          ) : (
            <div className="links-grid">
              {links.map(link => (
                <div key={link._id} className="link-card">
                  <div className="link-header">
                    <h3>{link.title}</h3>
                    <div className="link-actions">
                      <button
                        onClick={() => startEdit(link)}
                        className="btn-icon"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link._id)}
                        className="btn-icon"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-url"
                  >
                    {link.url}
                  </a>
                  
                  {link.description && (
                    <p className="link-description">{link.description}</p>
                  )}
                  
                  {link.tags && link.tags.length > 0 && (
                    <div className="link-tags">
                      {link.tags.map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="link-meta">
                    <small>Added: {new Date(link.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 