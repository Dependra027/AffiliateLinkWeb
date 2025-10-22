import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaCopy, FaCheck, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import './StatsPage.css';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Line, AreaChart, Area, CartesianGrid, ComposedChart,
  RadialBarChart, RadialBar
} from 'recharts';

const COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', 
  '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
  '#ff9a9e', '#fecfef', '#fecfef', '#ffecd2', '#fcb69f', '#667eea'
];

// Memoized style objects to prevent re-renders
const CHART_STYLES = {
  tooltip: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  cartesianGrid: {
    strokeDasharray: "3 3",
    stroke: "#f0f0f0"
  },
  xAxis: {
    fontSize: 11,
    fill: '#666'
  },
  yAxis: {
    fontSize: 11,
    fill: '#666'
  }
};

// Memoized chart margins
const CHART_MARGINS = {
  top: 20,
  right: 30,
  left: 20,
  bottom: 20
};

// Helper functions moved outside to prevent recreation
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

// Helper: Render full stats for a link (used in both single-link and group views)
const LinkStatsDetails = React.memo(({ stats, link, copied, copyToClipboard }) => {
  const { platformStats, totalClicks, recentAnalytics, trackingUrl, deviceCounts, browserCounts, countryCounts, referrerCounts, clicksOverTime, clicksByHour } = stats;
  
  // Memoize data processing to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    const sortedPlatforms = Object.entries(platformStats || {})
      .sort(([,a], [,b]) => b.clicks - a.clicks)
      .filter(([, data]) => data.clicks > 0);
    
    // Simple data conversion
    const toChartData = (obj) => {
      if (!obj || typeof obj !== 'object') return [];
      return Object.entries(obj)
        .filter(([name, value]) => name && value && value > 0)
        .map(([name, value]) => ({ name, value: Number(value) || 0 }));
    };
    
    const deviceData = toChartData(deviceCounts);
    const browserData = toChartData(browserCounts);
    const countryData = toChartData(countryCounts);
    const referrerData = toChartData(referrerCounts);
    
    // Time series data
    const clicksOverTimeData = clicksOverTime && typeof clicksOverTime === 'object' 
      ? Object.entries(clicksOverTime)
          .filter(([date, value]) => date && value !== undefined)
          .map(([date, value]) => ({ 
            date: date.length > 10 ? date.substring(5, 10) : date, 
            value: Number(value) || 0 
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      : [];
    
    // Hourly data
    const clicksByHourData = Array.isArray(clicksByHour) 
      ? clicksByHour
          .map((value, hour) => ({ 
            hour: hour.toString().padStart(2, '0') + ':00', 
            value: Number(value) || 0 
          }))
          .filter(item => item.value > 0)
      : [];

    return {
      sortedPlatforms,
      deviceData,
      browserData,
      countryData,
      referrerData,
      clicksOverTimeData,
      clicksByHourData
    };
  }, [platformStats, deviceCounts, browserCounts, countryCounts, referrerCounts, clicksOverTime, clicksByHour]);

  const { sortedPlatforms, deviceData, browserData, countryData, referrerData, clicksOverTimeData, clicksByHourData } = processedData;

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
              <div key={`platform-${platform}`} className="platform-card">
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
                    <tr key={`analytic-${idx}-${analytic.timestamp}`}>
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
          {/* Clicks Over Time (Area Chart) */}
          <div className="chart-card modern-chart">
            <h4>Clicks Over Time (Last 30 Days)</h4>
            {clicksOverTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280} key="clicks-over-time">
                <AreaChart data={clicksOverTimeData} margin={CHART_MARGINS}>
                  <defs>
                    <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_STYLES.cartesianGrid} />
                  <XAxis 
                    dataKey="date" 
                    tick={CHART_STYLES.xAxis} 
                    angle={-30} 
                    textAnchor="end" 
                    height={60}
                    stroke="#999"
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={CHART_STYLES.yAxis}
                    stroke="#999"
                  />
                  <Tooltip contentStyle={CHART_STYLES.tooltip} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    fill="url(#clicksGradient)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-chart">
                <p>No time series data available</p>
              </div>
            )}
          </div>
          
          {/* Clicks By Hour (Modern Bar Chart) */}
          <div className="chart-card modern-chart">
            <h4>Clicks By Hour (Last 30 Days)</h4>
            {clicksByHourData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280} key="clicks-by-hour">
                <BarChart data={clicksByHourData} margin={CHART_MARGINS}>
                  <defs>
                    <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f5576c" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_STYLES.cartesianGrid} />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12, fill: '#666' }} 
                    label={{ value: 'Hour', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#666' } }}
                    stroke="#999"
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={CHART_STYLES.yAxis}
                    stroke="#999"
                  />
                  <Tooltip contentStyle={CHART_STYLES.tooltip} />
                  <Bar 
                    dataKey="value" 
                    fill="url(#hourGradient)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-chart">
                <p>No hourly data available</p>
              </div>
            )}
          </div>
          
          {/* Device Breakdown (Enhanced Pie Chart) */}
          <div className="chart-card modern-chart">
            <h4>Device Type Distribution</h4>
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280} key="device-distribution">
                <PieChart>
                  <Pie 
                    data={deviceData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={90} 
                    innerRadius={30}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    isAnimationActive={false}
                  >
                    {deviceData.map((entry, idx) => (
                      <Cell 
                        key={`device-cell-${entry.name}-${idx}`} 
                        fill={COLORS[idx % COLORS.length]} 
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_STYLES.tooltip} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-chart">
                <p>No device data available</p>
              </div>
            )}
          </div>
          
          {/* Browser Breakdown (Radial Bar Chart) */}
          <div className="chart-card modern-chart">
            <h4>Browser Usage</h4>
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280} key="browser-usage">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={browserData}>
                  <RadialBar 
                    dataKey="value" 
                    cornerRadius={10} 
                    fill="#4facfe"
                    isAnimationActive={false}
                  />
                  <Tooltip contentStyle={CHART_STYLES.tooltip} />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-chart">
                <p>No browser data available</p>
              </div>
            )}
          </div>
          
          {/* Country Breakdown (Horizontal Bar Chart) */}
          <div className="chart-card modern-chart">
            <h4>Geographic Distribution</h4>
            {countryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280} key="geographic-distribution">
                <BarChart 
                  data={countryData.slice(0, 8)} 
                  layout="horizontal"
                  margin={CHART_MARGINS}
                >
                  <defs>
                    <linearGradient id="countryGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#38f9d7" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_STYLES.cartesianGrid} />
                  <XAxis 
                    type="number" 
                    tick={CHART_STYLES.xAxis}
                    stroke="#999"
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={CHART_STYLES.yAxis}
                    stroke="#999"
                  />
                  <Tooltip contentStyle={CHART_STYLES.tooltip} />
                  <Bar 
                    dataKey="value" 
                    fill="url(#countryGradient)"
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-chart">
                <p>No geographic data available</p>
              </div>
            )}
          </div>
          
          {/* Referrer Breakdown (Composed Chart) */}
          <div className="chart-card modern-chart">
            <h4>Traffic Sources</h4>
            {referrerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280} key="traffic-sources">
                <ComposedChart data={referrerData.slice(0, 6)} margin={CHART_MARGINS}>
                  <defs>
                    <linearGradient id="referrerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a8edea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#fed6e3" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_STYLES.cartesianGrid} />
                  <XAxis 
                    dataKey="name" 
                    tick={CHART_STYLES.xAxis}
                    stroke="#999"
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={CHART_STYLES.yAxis}
                    stroke="#999"
                  />
                  <Tooltip contentStyle={CHART_STYLES.tooltip} />
                  <Bar 
                    dataKey="value" 
                    fill="url(#referrerGradient)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ff9a9e" 
                    strokeWidth={3}
                    dot={{ fill: '#ff9a9e', strokeWidth: 2, r: 4 }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-chart">
                <p>No traffic source data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const StatsPage = ({ user }) => {
  const { linkId, groupId } = useParams();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedLinks, setExpandedLinks] = useState(new Set());

  useEffect(() => {
    let isMounted = true;
    
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
        if (isMounted) {
          setStats({ groupLinks: analyticsArr, totalClicks });
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch group analytics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    const fetchSingleAnalytics = async (linkId) => {
      try {
        setLoading(true);
        const response = await axios.get(`/links/${linkId}/analytics`);
        if (isMounted) {
          setStats(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch analytics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (location.pathname.startsWith('/stats/group/')) {
      fetchGroupAnalytics(groupId);
    } else {
      fetchSingleAnalytics(linkId);
    }
    
    return () => {
      isMounted = false;
    };
  }, [linkId, groupId, location.pathname]);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }, []);

  const toggleLink = useCallback((index) => {
    setExpandedLinks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

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

  const { link } = stats;

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

export default StatsPage;