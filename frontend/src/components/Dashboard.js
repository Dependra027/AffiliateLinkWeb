import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Dashboard.css';
import { FaChartBar, FaCopy, FaCheck, FaTimes, FaPlus, FaWhatsapp, FaFacebook, FaTwitter, FaDownload, FaShareAlt, FaEllipsisV } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import OnboardingModal from './OnboardingModal';
import TourGuide from './TourGuide';
import useDebounce from '../hooks/useDebounce';

// Memoized LinkCard component to prevent unnecessary re-renders
const LinkCard = memo(({ 
  group, 
  cardVariants, 
  startEdit, 
  handleDeleteLink, 
  navigate, 
  setGenerateGroupId, 
  setShowGenerateModal, 
  setGenerateAlias, 
  setGenerateError,
  copiedLinks,
  copyToClipboard,
  sharePopup,
  setSharePopup,
  downloadQrCode
}) => {
  const mainLink = group.links[0];
  
  return (
    <motion.div 
      key={group.groupId} 
      className="link-card"
      variants={cardVariants}
      whileHover="hover"
    >
      <div className="link-header">
        <h3>{mainLink.title}</h3>
        <div className="link-actions">
          <motion.button
            onClick={() => startEdit(mainLink)}
            className="btn-icon"
            title="Edit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✏️
          </motion.button>
          <motion.button
            onClick={() => handleDeleteLink(mainLink._id)}
            className="btn-icon"
            title="Delete"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            🗑️
          </motion.button>
          <motion.button
            className="stats-btn"
            title="View Stats"
            onClick={() => navigate(`/stats/group/${group.groupId}`)}
            style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChartBar size={18} color="#764ba2" />
          </motion.button>
          <motion.button
            className="generate-btn"
            title="Generate New Link"
            onClick={() => { setGenerateGroupId(group.groupId); setShowGenerateModal(true); setGenerateAlias(''); setGenerateError(''); }}
            style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaPlus size={18} color="#333" />
          </motion.button>
        </div>
      </div>
      <a
        href={mainLink.url}
        target="_blank"
        rel="noopener noreferrer"
        className="link-url"
      >
        {mainLink.url}
      </a>
      {mainLink.description && (
        <p className="link-description">{mainLink.description}</p>
      )}
      {mainLink.tags && mainLink.tags.length > 0 && (
        <div className="link-tags">
          {mainLink.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
      <div className="tracking-url-section">
        <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px', display: 'block' }}>
          Tracking URLs (Share any of these links):
        </label>
        {group.links.map(link => {
          const trackingIdOrAlias = link.customAlias || link.trackingId;
          const trackingUrl = `${process.env.NODE_ENV === 'production' ? (process.env.REACT_APP_SERVER_ENDPOINT || 'https://affiliatelinkweb.onrender.com') : (process.env.REACT_APP_SERVER_ENDPOINT || 'http://localhost:5000')}/api/links/t/${trackingIdOrAlias}`;
          const isCopied = copiedLinks.has(link._id);
          return (
            <div key={link._id} className="tracking-url-container" style={{ marginBottom: 6, position: 'relative', overflow: 'visible', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={trackingUrl}
                readOnly
                className="tracking-url-input"
                style={{
                  flex: '1 1 0%',
                  minWidth: 0,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  backgroundColor: '#f9f9f9'
                }}
              />
              <motion.button
                onClick={() => copyToClipboard(trackingUrl, link._id)}
                className="copy-btn"
                style={{
                  flexShrink: 0,
                  padding: '8px 12px',
                  marginLeft: 4,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: isCopied ? '#4CAF50' : '#764ba2',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '38px',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCopied ? <FaCheck size={14} /> : <FaCopy size={14} />}
                {isCopied ? 'Copied!' : 'Copy'}
              </motion.button>
              {/* Three Dots Menu Button */}
              <div style={{ position: 'relative', display: 'inline-block', marginLeft: 4 }}>
                <button
                  className="btn-icon"
                  title="More actions"
                  style={{
                    flexShrink: 0,
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    background: '#fff',
                    color: '#333',
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    height: '38px',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onClick={() => setSharePopup(p => ({ ...p, [link._id]: !p[link._id] }))}
                >
                  <FaEllipsisV />
                </button>
                {/* Dropdown menu for share and delete */}
                {sharePopup[link._id] && (
                  <div className="share-popup" style={{ position: 'absolute', top: 38, right: 0, minWidth: 120, zIndex: 20, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: 0, display: 'flex', flexDirection: 'column' }}>
                    <button
                      onClick={() => setSharePopup(p => ({ ...p, [link._id]: false, [`share-${link._id}`]: true }))}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#764ba2',
                        padding: '10px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: 16,
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <FaShareAlt style={{ marginRight: 8 }} /> Share
                    </button>
                    <button
                      onClick={() => { setSharePopup(p => ({ ...p, [link._id]: false })); handleDeleteLink(link._id); }}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#e74c3c',
                        padding: '10px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: 16,
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
                {/* Actual share popup (reuse existing logic) */}
                {sharePopup[`share-${link._id}`] && (
                  <div className="share-popup" style={{ position: 'absolute', top: 38, left: 0, minWidth: 180, zIndex: 30, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: 10, display: 'flex', gap: 10 }}>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(trackingUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share on WhatsApp"
                      style={{ color: '#25D366', fontSize: 22 }}
                    >
                      <FaWhatsapp />
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackingUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share on Facebook"
                      style={{ color: '#1877F3', fontSize: 22 }}
                    >
                      <FaFacebook />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(trackingUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share on Twitter"
                      style={{ color: '#1DA1F2', fontSize: 22 }}
                    >
                      <FaTwitter />
                    </a>
                    <button
                      onClick={() => downloadQrCode(trackingUrl, `qr-${trackingIdOrAlias}.png`)}
                      title="Download QR Code"
                      style={{ color: '#764ba2', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => setSharePopup(p => ({ ...p, [`share-${link._id}`]: false }))}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', color: '#333', fontSize: 18, cursor: 'pointer' }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="link-meta">
        <small>Added: {new Date(mainLink.createdAt).toLocaleDateString()}</small>
      </div>
    </motion.div>
  );
});

const Dashboard = ({ user, logout, setUser }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation variants - memoized for performance
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }), []);

  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      y: -2,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }), []);

  const modalVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }), []);

  const overlayVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  }), []);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    customAlias: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [copiedLinks, setCopiedLinks] = useState(new Set());
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateGroupId, setGenerateGroupId] = useState(null);
  const [generateAlias, setGenerateAlias] = useState('');
  const [generateError, setGenerateError] = useState('');
  const navigate = useNavigate();
  const [sharePopup, setSharePopup] = useState({}); // { [linkId]: boolean }
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Function to start tour manually
  const startTour = () => {
    setShowTour(true);
  };

  const fetchLinks = useCallback(async () => {
    try {
      const params = {};
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (selectedTag) params.tag = selectedTag;
      
      const response = await axios.get('/links', { params });
      console.log('Fetched links:', response.data);
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedTag]);

  // Fetch links when dependencies change
  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Show onboarding once per user in this browser
  useEffect(() => {
    if (user && user.id) {
      const onboardingKey = `onboarding_seen_${user.id}`;
      const tourKey = `tour_completed_${user.id}`;
      const onboardingSeen = localStorage.getItem(onboardingKey);
      const tourCompleted = localStorage.getItem(tourKey);
      
      // Only show onboarding if user hasn't seen it before
      if (!onboardingSeen) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  useEffect(() => {
    // Refetch credits after a successful purchase
    const fetchCredits = async () => {
      try {
        const response = await axios.get('/payments/credits');
        setUser(prev => ({ ...prev, credits: response.data.credits }));
        // Dispatch custom event to notify navbar of credit update
        window.dispatchEvent(new CustomEvent('creditsUpdated'));
      } catch (error) {
        console.error('Error refreshing credits:', error);
      }
    };
    
    // Only fetch credits if user exists and we have a credits value
    if (user && user.credits !== undefined) {
      fetchCredits();
    }
  }, [user?.credits, setUser]);

  // Helper to close share popups when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.share-popup') && !e.target.closest('.share-btn')) {
        setSharePopup({});
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

    setFormLoading(true);
    setSuccessMessage('');

    try {
      const linkData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      console.log('Submitting link data:', linkData);
      
      const response = await axios.post('/links', linkData);
      console.log('Link created:', response.data);
      setLinks([response.data, ...links]);
      resetForm();
      setShowAddForm(false);
      setSuccessMessage('Link added successfully!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error creating link:', error.response?.data || error);
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.param] = err.msg;
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        // Try to match message to a field
        if (error.response.data.message.toLowerCase().includes('alias')) {
          setErrors({ customAlias: error.response.data.message });
        } else {
          setErrors({ general: error.response.data.message });
        }
      } else {
        setErrors({ general: 'Failed to add link, add Credits!' });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditLink = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setFormLoading(true);
    setSuccessMessage('');

    try {
      const linkData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      const response = await axios.put(`/links/${editingLink._id}`, linkData);
      setLinks(links.map(link => link._id === editingLink._id ? response.data : link));
      resetForm();
      setEditingLink(null);
      setSuccessMessage('Link updated successfully!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.param] = err.msg;
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        if (error.response.data.message.toLowerCase().includes('alias')) {
          setErrors({ customAlias: error.response.data.message });
        } else {
          setErrors({ general: error.response.data.message });
        }
      } else {
        setErrors({ general: 'Failed to update link' });
      }
    } finally {
      setFormLoading(false);
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
      tags: link.tags ? link.tags.join(', ') : '',
      customAlias: link.customAlias || '',
      destinations: link.destinations || ['']
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
      tags: '',
      customAlias: ''
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

    // Add customAlias min length and character validation
    if (formData.customAlias) {
      if (formData.customAlias.length < 3) {
        newErrors.customAlias = 'Custom alias must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.customAlias)) {
        newErrors.customAlias = 'Custom alias can only contain letters, numbers, dashes, and underscores';
      }
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

  const navigateToPayments = () => {
    navigate('/payments');
  };

  const copyToClipboard = async (text, linkId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinks(prev => new Set([...prev, linkId]));
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(linkId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Helper to download QR code as image
  const downloadQrCode = (url, filename) => {
    const canvas = document.createElement('canvas');
    const qr = document.createElement('div');
    document.body.appendChild(qr);
    import('qrcode.react').then(({ QRCodeCanvas }) => {
      const qrElem = document.createElement('div');
      qr.appendChild(qrElem);
      const qrComponent = <QRCodeCanvas value={url} size={220} level="H" includeMargin={true} />;
      import('react-dom').then(ReactDOM => {
        ReactDOM.render(qrComponent, qrElem, () => {
          setTimeout(() => {
            const canvasElem = qrElem.querySelector('canvas');
            if (canvasElem) {
              const link = document.createElement('a');
              link.href = canvasElem.toDataURL('image/png');
              link.download = filename;
              link.click();
            }
            document.body.removeChild(qr);
          }, 500);
        });
      });
    });
  };

  // Get unique tags from all links - memoized to prevent unnecessary recalculations
  const allTags = useMemo(() => {
    return [...new Set(links.flatMap(link => link.tags || []))];
  }, [links]);

  // Group links by groupId (or _id if no groupId) - memoized to prevent unnecessary recalculations
  const groupedLinks = useMemo(() => {
    return Object.values(
    links.reduce((acc, link) => {
      const groupKey = link.groupId || link._id;
      if (!acc[groupKey]) acc[groupKey] = { groupId: groupKey, links: [] };
      acc[groupKey].links.push(link);
      return acc;
    }, {})
  );
  }, [links]);

  // Tour steps configuration
  const tourSteps = [
    {
      target: '.navbar-links',
      title: 'Navigation Menu',
      content: 'Use these icons to navigate between Dashboard, Payments, and Admin (if you\'re an admin).'
    },
    {
      target: '.notification-bell',
      title: 'Notifications',
      content: 'Click the bell icon to see your notifications and milestone achievements.'
    },
    {
      target: '.search-input',
      title: 'Search Your Links',
      content: 'Use this search bar to quickly find your saved links by title, URL, or tags.'
    },
    {
      target: '.tag-filter',
      title: 'Filter by Tags',
      content: 'Filter your links by specific tags to organize and find related content easily.'
    },
    {
      target: '.btn-primary',
      title: 'Add New Link',
      content: 'Click here to add a new link. You can set a custom title, description, and tags.'
    },
    {
      target: '.link-card',
      title: 'Your Links',
      content: 'Each link card shows your saved links with tracking URLs you can share.'
    },
    {
      target: '.stats-btn',
      title: 'View Statistics',
      content: 'Click the chart icon to see detailed analytics for each link or group.'
    }
  ];

  return (
    <motion.div 
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <OnboardingModal
        open={showOnboarding}
        onStart={() => { 
          setShowOnboarding(false); 
          setShowTour(true); 
          localStorage.setItem(`onboarding_seen_${user.id}`, '1'); 
        }}
        onSkip={() => { 
          setShowOnboarding(false); 
          localStorage.setItem(`onboarding_seen_${user.id}`, '1');
          localStorage.setItem(`tour_completed_${user.id}`, '1');
        }}
      />
      <TourGuide
        steps={tourSteps}
        isOpen={showTour}
        onClose={() => { 
          setShowTour(false);
          localStorage.setItem(`tour_completed_${user.id}`, '1');
        }}
        onComplete={() => { 
          setShowTour(false);
          localStorage.setItem(`tour_completed_${user.id}`, '1');
        }}
      />
      {isMobile && user && (
        <motion.div 
          className="dashboard-header-info"
          variants={itemVariants}
        >
          <span className="dashboard-welcome">Welcome, {user.username}!</span>
          <span className={`dashboard-credits ${user.credits === 1 ? 'free-credit-highlight' : ''}`}>
            Credits: {user.credits || 0}
            {user.credits === 1 && <span className="free-credit-badge">🎉 FREE!</span>}
          </span>
        </motion.div>
      )}
      <motion.div 
        className="dashboard-content"
        variants={containerVariants}
      >
        {/* Welcome banner for new users with free credit */}
        {user && user.credits === 1 && (
          <motion.div 
            className="welcome-banner"
            variants={itemVariants}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2em' }}>🎉 Welcome to TrackLytics!</h3>
            <p style={{ margin: '0', opacity: 0.9 }}>
              You have received <strong>1 free credit</strong> to get started. Add your first link now!
            </p>
          </motion.div>
        )}

        <motion.div 
          className="controls"
          variants={itemVariants}
        >
          <div className="search-filter">
            <motion.input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
            <motion.select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="tag-filter"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </motion.select>
          </div>
          
          <div className="dashboard-actions">
            <motion.button
              onClick={startTour}
              className="btn btn-secondary"
              title="Take a tour of the dashboard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ marginRight: '10px' }}
            >
              🎯 Take Tour
            </motion.button>
            
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
              disabled={editingLink || (user.credits <= 0)}
              title={user.credits <= 0 ? 'You need credits to add a new link' : ''}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add New Link
            </motion.button>
          </div>
          
          {user.credits <= 0 && (
            <motion.button
              onClick={navigateToPayments}
              className="btn btn-secondary"
              style={{ marginLeft: 8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Buy Credits
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence>
          {(showAddForm || editingLink) && (
            <motion.div 
              className="form-container"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h3>{editingLink ? 'Edit Link' : 'Add New Link'}</h3>
              {successMessage && (
                <motion.div 
                  className="success-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {successMessage}
                </motion.div>
              )}
              {errors.general && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {errors.general}
                </motion.div>
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
                  disabled={formLoading}
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>
              
              <div className="form-group">
                <label>Destination URL *</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className={errors.url ? 'error' : ''}
                  placeholder="https://example.com"
                  style={{ flex: 1 }}
                  disabled={formLoading}
                />
                {errors.url && <span className="error-text">{errors.url}</span>}
              </div>
              
              <div className="form-group">
                <label>Custom Alias <span style={{ color: '#888', fontWeight: 400, fontSize: '0.9em' }}>(optional, e.g. my-offer)</span></label>
                <input
                  type="text"
                  name="customAlias"
                  value={formData.customAlias}
                  onChange={handleChange}
                  className={errors.customAlias ? 'error' : ''}
                  placeholder="Enter custom short URL (letters, numbers, - or _)"
                  maxLength={64}
                  disabled={formLoading}
                />
                {errors.customAlias && <span className="error-text">{errors.customAlias}</span>}
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description (optional)"
                  rows="3"
                  disabled={formLoading}
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
                  disabled={formLoading}
                />
              </div>
              
              <div className="form-actions">
                <motion.button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={formLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {formLoading ? (editingLink ? 'Updating...' : 'Adding...') : (editingLink ? 'Update Link' : 'Add Link')}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={editingLink ? cancelEdit : () => setShowAddForm(false)}
                  className="btn btn-secondary"
                  disabled={formLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="links-container"
          variants={itemVariants}
        >
          {loading ? (
            <motion.div 
              className="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Loading links...
            </motion.div>
          ) : groupedLinks.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>No links found. {searchTerm || selectedTag ? 'Try adjusting your search or filters.' : 'Add your first link to get started!'}</p>
            </motion.div>
          ) : (
            <motion.div 
              className="links-grid"
              variants={containerVariants}
            >
              {groupedLinks.map((group, index) => (
                <LinkCard
                    key={group.groupId} 
                  group={group}
                  cardVariants={cardVariants}
                  startEdit={startEdit}
                  handleDeleteLink={handleDeleteLink}
                  navigate={navigate}
                  setGenerateGroupId={setGenerateGroupId}
                  setShowGenerateModal={setShowGenerateModal}
                  setGenerateAlias={setGenerateAlias}
                  setGenerateError={setGenerateError}
                  copiedLinks={copiedLinks}
                  copyToClipboard={copyToClipboard}
                  sharePopup={sharePopup}
                  setSharePopup={setSharePopup}
                  downloadQrCode={downloadQrCode}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
        {/* QR Code Modal */}
        <AnimatePresence>
          {qrModalOpen && (
            <motion.div 
              className="qr-modal-overlay" 
              onClick={() => setQrModalOpen(false)}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className="qr-modal" 
                onClick={e => e.stopPropagation()}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.button 
                  className="qr-modal-close" 
                  onClick={() => setQrModalOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes size={20} />
                </motion.button>
                <h3>Scan QR Code</h3>
                <QRCodeCanvas value={qrValue} size={220} level="H" includeMargin={true} />
                <div style={{ marginTop: 16, wordBreak: 'break-all', fontSize: '0.95rem', color: '#333' }}>{qrValue}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Generate New Link Modal */}
        <AnimatePresence>
          {showGenerateModal && (
            <motion.div 
              className="qr-modal-overlay" 
              onClick={() => setShowGenerateModal(false)}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className="qr-modal" 
                onClick={e => e.stopPropagation()}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.button 
                  className="qr-modal-close" 
                  onClick={() => setShowGenerateModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes size={20} />
                </motion.button>
                <h3>Generate New Link</h3>
              <form onSubmit={async e => {
                e.preventDefault();
                setGenerateError('');
                // Frontend validation for customAlias and URL
                if (generateAlias) {
                  if (generateAlias.length < 3) {
                    setGenerateError('Custom alias must be at least 3 characters');
                    return;
                  } else if (!/^[a-zA-Z0-9_-]+$/.test(generateAlias)) {
                    setGenerateError('Custom alias can only contain letters, numbers, dashes, and underscores');
                    return;
                  }
                }
                const group = groupedLinks.find(g => g.groupId === generateGroupId);
                const mainLink = group ? group.links[0] : null;
                if (!mainLink || !/^https?:\/\/.+/.test(mainLink.url)) {
                  setGenerateError('The original link URL must start with http:// or https://');
                  return;
                }
                try {
                  setFormLoading(true);
                  const res = await axios.post(`/links/${generateGroupId}/generate`, { customAlias: generateAlias });
                  setLinks(prev => {
                    // Add new link to the correct group
                    const updated = [...prev, res.data];
                    return updated;
                  });
                  setShowGenerateModal(false);
                  setSuccessMessage('Link generated successfully!');
                  setTimeout(() => setSuccessMessage(''), 2000);
                } catch (err) {
                  if (err.response?.data?.message) {
                    setGenerateError(err.response.data.message);
                  } else {
                    setGenerateError('Failed to generate link');
                  }
                } finally {
                  setFormLoading(false);
                }
              }}>
                <div className="form-group">
                  <label>Custom Alias (optional)</label>
                  <input
                    type="text"
                    value={generateAlias}
                    onChange={e => setGenerateAlias(e.target.value)}
                    placeholder="Enter custom short URL (letters, numbers, - or _)"
                    maxLength={64}
                  />
                </div>
                {generateError && <div className="error-message">{generateError}</div>}
                <motion.button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={formLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {formLoading ? 'Generating...' : 'Generate'}
                </motion.button>
              </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 