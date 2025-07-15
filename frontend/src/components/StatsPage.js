import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaCopy, FaCheck, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import './StatsPage.css';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const COLORS = ['#764ba2', '#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#00BCD4', '#FFEB3B', '#9C27B0', '#FF5722', '#607D8B'];

const StatsPage = ({ user }) => {
  const { linkId, groupId } = useParams();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedLinks, setExpandedLinks] = useState(new Set());

  useEffect(() => {
    const fetchGroupAnalytics = async (groupId) => {
      try {
        setLoading(true);
        // Fetch all links in the group
        const linksRes = await axios.get('/links');
        const groupLinks = linksRes.data.filter(l => (l.groupId || l._id) === groupId);
        // Fetch analytics for each link
        const analyticsArr = await Promise.all(
          groupLinks.map(async link => {
            const res = await axios.get(`/links/${link._id}/analytics`);
            return { link, stats: res.data };
          })
        );
        // Compute group summary
        const totalClicks = analyticsArr.reduce((sum, a) => sum + (a.stats.totalClicks || 0), 0);
        setStats({ groupLinks: analyticsArr, totalClicks });
      } catch (err) {
        setError('Failed to fetch group analytics');
      } finally {
        setLoading(false);
      }
    };
    const fetchSingleAnalytics = async (linkId) => {
      try {
        setLoading(true);
        const response = await axios.get(`/links/${linkId}/analytics`);
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    if (location.pathname.startsWith('/stats/group/')) {
      fetchGroupAnalytics(groupId);
    } else {
      fetchSingleAnalytics(linkId);
    }
  }, [linkId, groupId, location.pathname]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: '📘',
      twitter: '🐦',
      instagram: '📷',
      whatsapp: '💬',
      linkedin: '💼',
      tiktok: '🎵',
      youtube: '📺',
      telegram: '📡',
      email: '📧',
      direct: '🔗',
      other: '🌐'
    };
    return icons[platform] || '🌐';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      facebook: '#1877F2',
      twitter: '#1DA1F2',
      instagram: '#E4405F',
      whatsapp: '#25D366',
      linkedin: '#0A66C2',
      tiktok: '#000000',
      youtube: '#FF0000',
      telegram: '#0088CC',
      email: '#EA4335',
      direct: '#6C757D',
      other: '#6F42C1'
    };
    return colors[platform] || '#6F42C1';
  };

  const toggleLink = (index) => {
    setExpandedLinks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Helper: Render full stats for a link (used in both single-link and group views)
  function LinkStatsDetails({ stats, link, copied, copyToClipboard }) {
    // Extract and prepare all the same data as in the single-link view
    const { platformStats, totalClicks, recentAnalytics, trackingUrl, deviceCounts, browserCounts, countryCounts, referrerCounts, clicksOverTime, clicksByHour } = stats;
    const sortedPlatforms = Object.entries(platformStats || {})
      .sort(([,a], [,b]) => b.clicks - a.clicks)
      .filter(([, data]) => data.clicks > 0);
    const toChartData = (obj) => Object.entries(obj).map(([name, value]) => ({ name, value }));
    const deviceData = toChartData(deviceCounts || {});
    const browserData = toChartData(browserCounts || {});
    const countryData = toChartData(countryCounts || {});
    const referrerData = toChartData(referrerCounts || {});
    const clicksOverTimeData = clicksOverTime ? Object.entries(clicksOverTime).map(([date, value]) => ({ date, value })) : [];
    const clicksByHourData = clicksByHour ? clicksByHour.map((value, hour) => ({ hour: hour.toString().padStart(2, '0'), value })) : [];

  return (
      <div className="link-stats-details">
        <div className="link-info">
          <h2>{link.title}</h2>
          <p className="original-url">{link.url}</p>
          <div className="tracking-url-section">
            <label>Tracking URL:</label>
            <div className="tracking-url-container">
              <input
                type="text"
                value={trackingUrl}
                readOnly
                className="tracking-url-input"
              />
              <button
                onClick={() => copyToClipboard(trackingUrl)}
                className={`copy-btn ${copied ? 'copied' : ''}`}
              >
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
        <div className="stats-overview">
          <div className="stat-card total-clicks">
            <h3>Total Clicks</h3>
            <div className="stat-number">{totalClicks}</div>
          </div>
          <div className="stat-card platforms">
            <h3>Active Platforms</h3>
            <div className="stat-number">{sortedPlatforms.length}</div>
          </div>
          <div className="stat-card recent">
            <h3>Last 30 Days</h3>
            <div className="stat-number">{recentAnalytics.length}</div>
          </div>
        </div>
        {sortedPlatforms.length > 0 && (
          <div className="platform-stats">
            <h3>Platform Performance</h3>
            <div className="platform-grid">
              {sortedPlatforms.map(([platform, data]) => (
                <div key={platform} className="platform-card">
                  <div className="platform-header">
                    <span className="platform-icon">{getPlatformIcon(platform)}</span>
                    <span className="platform-name">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </div>
                  <div className="platform-stats">
                    <div className="platform-clicks">
                      <span className="clicks-number">{data.clicks}</span>
                      <span className="clicks-label">clicks</span>
                    </div>
                    <div className="platform-percentage">
                      {data.percentage}% of total
                    </div>
                  </div>
                  <div className="platform-bar">
                    <div 
                      className="platform-bar-fill"
                      style={{ 
                        width: `${data.percentage}%`,
                        backgroundColor: getPlatformColor(platform)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {recentAnalytics.length > 0 && (
          <div className="recent-clicks">
            <h3>Recent Clicks (Last 30 Days)</h3>
            <div className="clicks-table-container">
              <table className="clicks-table">
          <thead>
                  <tr>
              <th>Time</th>
                    <th>Platform</th>
                    <th>Location</th>
              <th>Device</th>
              <th>Browser</th>
                    <th>IP</th>
            </tr>
          </thead>
          <tbody>
                  {recentAnalytics.slice(0, 20).map((analytic, idx) => {
                    const platform = detectPlatformFromAnalytics(analytic);
                    return (
                      <tr key={idx}>
                        <td>{new Date(analytic.timestamp).toLocaleString()}</td>
                        <td>
                          <span className="platform-badge" style={{ backgroundColor: getPlatformColor(platform) }}>
                            {getPlatformIcon(platform)} {platform}
                          </span>
                        </td>
                        <td>
                          {analytic.city && analytic.country ? 
                            `${analytic.city}, ${analytic.country}` : 
                            analytic.country || 'Unknown'
                          }
                        </td>
                        <td>{analytic.deviceType || 'Unknown'}</td>
                        <td>{analytic.browser || 'Unknown'}</td>
                        <td>{analytic.ip}</td>
              </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>
          </div>
        )}
        {recentAnalytics.length === 0 && (
          <div className="no-data">
            <p>No clicks recorded yet. Share your tracking link to start seeing analytics!</p>
          </div>
        )}
        {/* Advanced Analytics Section */}
        <div className="advanced-analytics">
          <h3>Advanced Analytics</h3>
          <div className="advanced-charts-grid">
            {/* Clicks Over Time (Line Chart) */}
            {clicksOverTimeData.length > 0 && (
              <div className="chart-card">
                <h4>Clicks Over Time (Last 30 Days)</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={clicksOverTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Clicks By Hour (Heatmap/Bar Chart) */}
            {clicksByHourData.length > 0 && (
              <div className="chart-card">
                <h4>Clicks By Hour (Last 30 Days)</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={clicksByHourData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#E91E63" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Device Breakdown */}
            {deviceData.length > 0 && (
              <div className="chart-card">
                <h4>Device Type</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {deviceData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Browser Breakdown */}
            {browserData.length > 0 && (
              <div className="chart-card">
                <h4>Browser</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={browserData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {browserData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Country Breakdown */}
            {countryData.length > 0 && (
              <div className="chart-card">
                <h4>Country</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={countryData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#764ba2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Referrer Breakdown */}
            {referrerData.length > 0 && (
              <div className="chart-card">
                <h4>Referrer</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={referrerData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (location.pathname.startsWith('/stats/group/')) {
    // Group stats view
    if (loading) return <div className="stats-container"><div className="loading">Loading group stats...</div></div>;
    if (error) return <div className="stats-container"><div className="error">{error}</div></div>;
    if (!stats || !stats.groupLinks) return <div className="stats-container"><div className="error">No group stats available</div></div>;
    return (
      <div className="stats-container">
        <div className="stats-header">
          <Link to="/dashboard" className="back-button"><FaArrowLeft /> Back to Dashboard</Link>
          <h1>Group Analytics</h1>
        </div>
        <div className="group-summary">
          <h2>Total Clicks (All Links): {stats.totalClicks}</h2>
          <p>Links in this group: {stats.groupLinks.length}</p>
        </div>
        <div className="group-links-stats">
          {stats.groupLinks.map((item, idx) => {
            const { link, stats: s } = item;
            const isExpanded = expandedLinks.has(idx);
            return (
              <div key={link._id} className={`group-link-card${isExpanded ? ' expanded' : ''}`}>
                <div className={`group-link-header${isExpanded ? ' active' : ''}`} onClick={() => toggleLink(idx)}>
                  <div>
                    <b>{link.title}</b> <span style={{ color: '#888' }}>({link.customAlias || link.trackingId})</span>
                    <div style={{ fontSize: '0.95em', color: '#555' }}>{link.url}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{s.totalClicks} clicks</span>
                    <span className={`chevron${isExpanded ? ' open' : ''}`}>{isExpanded ? <FaChevronDown /> : <FaChevronRight />}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="group-link-stats-content">
                    <LinkStatsDetails stats={s} link={link} copied={copied} copyToClipboard={copyToClipboard} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="stats-container">
      <div className="loading">Loading stats...</div>
    </div>
  );
  
  if (error) return (
    <div className="stats-container">
      <div className="error">{error}</div>
    </div>
  );

  if (!stats) return (
    <div className="stats-container">
      <div className="error">No stats available</div>
    </div>
  );

  const { link, platformStats, totalClicks, recentAnalytics, trackingUrl, deviceCounts, browserCounts, countryCounts, referrerCounts, clicksOverTime, clicksByHour, destinationStats } = stats;

  // Debug logging
  console.log('StatsPage Debug:', {
    linkId,
    link: link ? { title: link.title, destinations: link.destinations } : null,
    destinationStats: destinationStats ? destinationStats.length : 'undefined',
    destinationStatsData: destinationStats,
    shouldShowDestinationAnalytics: destinationStats && destinationStats.length > 1
  });

  // Sort platforms by clicks (descending)
  const sortedPlatforms = Object.entries(platformStats || {})
    .sort(([,a], [,b]) => b.clicks - a.clicks)
    .filter(([, data]) => data.clicks > 0);

  // Convert breakdowns to chart data
  const toChartData = (obj) => Object.entries(obj).map(([name, value]) => ({ name, value }));
  const deviceData = toChartData(deviceCounts || {});
  const browserData = toChartData(browserCounts || {});
  const countryData = toChartData(countryCounts || {});
  const referrerData = toChartData(referrerCounts || {});
  const clicksOverTimeData = clicksOverTime ? Object.entries(clicksOverTime).map(([date, value]) => ({ date, value })) : [];
  const clicksByHourData = clicksByHour ? clicksByHour.map((value, hour) => ({ hour: hour.toString().padStart(2, '0'), value })) : [];

  return (
    <div className="stats-container">
      <div className="stats-header">
        <Link to="/dashboard" className="back-button">
          <FaArrowLeft /> Back to Dashboard
        </Link>
        <h1>Link Analytics</h1>
      </div>

      <LinkStatsDetails stats={stats} link={link} copied={copied} copyToClipboard={copyToClipboard} />

    </div>
  );
};

// Helper function to detect platform from analytics data
const detectPlatformFromAnalytics = (analytic) => {
  const referrer = (analytic.referrer || '').toLowerCase();
  const userAgent = (analytic.userAgent || '').toLowerCase();
  
  if (!referrer) return 'direct';
  
  if (referrer.includes('facebook.com') || referrer.includes('fb.com')) return 'facebook';
  if (referrer.includes('twitter.com') || referrer.includes('x.com')) return 'twitter';
  if (referrer.includes('instagram.com')) return 'instagram';
  if (referrer.includes('whatsapp.com') || userAgent.includes('whatsapp')) return 'whatsapp';
  if (referrer.includes('linkedin.com')) return 'linkedin';
  if (referrer.includes('tiktok.com')) return 'tiktok';
  if (referrer.includes('youtube.com') || referrer.includes('youtu.be')) return 'youtube';
  if (referrer.includes('t.me') || userAgent.includes('telegram')) return 'telegram';
  if (referrer.includes('mail.google.com') || referrer.includes('outlook.com') || referrer.includes('yahoo.com')) return 'email';
  
  return 'other';
};

export default StatsPage; 