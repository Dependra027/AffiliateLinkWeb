import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Achievements.css';
import './Leaderboard.css';

const AchievementsAndLeaderboard = () => {
  // Achievements state
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [achievementsError, setAchievementsError] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('clicks');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');

  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      setLoadingAchievements(true);
      setAchievementsError('');
      try {
        const res = await axios.get('/api/gamification/achievements');
        setAchievements(res.data.achievements || []);
        setProgress(res.data.progress || null);
        setStats(res.data.stats || null);
      } catch (err) {
        setAchievementsError(err.response?.data?.message || 'Failed to load achievements');
      } finally {
        setLoadingAchievements(false);
      }
    };
    fetchAchievements();
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      setLeaderboardError('');
      try {
        const response = await axios.get(`/api/gamification/leaderboard/${leaderboardType}`);
        setLeaderboard(response.data || []);
      } catch (err) {
        setLeaderboardError(err.response?.data?.message || 'Failed to fetch leaderboard');
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, [leaderboardType]);

  const leaderboardTitles = {
    clicks: 'Total Clicks',
    shares: 'Total Shares',
    links: 'Links Created',
    streak: 'Longest Streak',
    level: 'Level',
  };

  const columns = [
    { key: 'rank', label: '#' },
    { key: 'username', label: 'Username' },
    { key: 'level', label: 'Level' },
    { key: 'totalClicks', label: 'Clicks' },
    { key: 'totalShares', label: 'Shares' },
    { key: 'totalLinks', label: 'Links' },
    { key: 'longestStreak', label: 'Streak' },
  ];

  return (
    <div className="achievements-leaderboard-wrapper">
      {/* Achievements Section */}
      <div className="achievements-container">
        <h2>Achievements</h2>
        {loadingAchievements && <div className="loading">Loading achievements...</div>}
        {achievementsError && <div className="error-message">{achievementsError}</div>}
        {!loadingAchievements && !achievementsError && (
          <>
            {stats && (
              <div className="user-stats">
                <h3>Your Stats</h3>
                <ul>
                  <li><strong>Level:</strong> {stats.level}</li>
                  <li><strong>Total Clicks:</strong> {stats.totalClicks}</li>
                  <li><strong>Total Shares:</strong> {stats.totalShares}</li>
                  <li><strong>Total Links:</strong> {stats.totalLinks}</li>
                  <li><strong>Current Streak:</strong> {stats.currentStreak} days</li>
                  <li><strong>Longest Streak:</strong> {stats.longestStreak} days</li>
                </ul>
              </div>
            )}
            <div className="achievements-list">
              <h3>Your Achievements</h3>
              {achievements.length === 0 ? (
                <p>You haven't earned any achievements yet. Keep using the platform to unlock them!</p>
              ) : (
                <ul>
                  {achievements.map((a, idx) => (
                    <li key={a.achievementId?._id || idx} className="achievement-item">
                      <div className="achievement-title">{a.achievementId?.name || 'Achievement'}</div>
                      <div className="achievement-desc">{a.achievementId?.description}</div>
                      <div className="achievement-date">Earned: {a.earnedAt ? new Date(a.earnedAt).toLocaleDateString() : '-'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {progress && (
              <div className="achievement-progress">
                <h3>Progress Towards Next Achievement</h3>
                <ul>
                  {Object.entries(progress).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {value}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="leaderboard-modern-container">
        <div className="leaderboard-modern-header">
          <h2>Leaderboard</h2>
          <div className="leaderboard-modern-tabs">
            <button className={leaderboardType === 'clicks' ? 'active' : ''} onClick={() => setLeaderboardType('clicks')}>Clicks</button>
            <button className={leaderboardType === 'shares' ? 'active' : ''} onClick={() => setLeaderboardType('shares')}>Shares</button>
            <button className={leaderboardType === 'links' ? 'active' : ''} onClick={() => setLeaderboardType('links')}>Links</button>
            <button className={leaderboardType === 'streak' ? 'active' : ''} onClick={() => setLeaderboardType('streak')}>Streak</button>
            <button className={leaderboardType === 'level' ? 'active' : ''} onClick={() => setLeaderboardType('level')}>Level</button>
          </div>
        </div>
        <div className="leaderboard-modern-table-wrapper">
          {loadingLeaderboard ? (
            <div className="leaderboard-loading">Loading leaderboard...</div>
          ) : leaderboardError ? (
            <div className="leaderboard-error">Error: {leaderboardError}</div>
          ) : (
            <table className="leaderboard-modern-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="no-leaderboard">No data available for this leaderboard.</td>
                  </tr>
                ) : (
                  leaderboard.map((user, index) => (
                    <tr key={user._id} className={index < 3 ? `top-rank rank-${index + 1}` : ''}>
                      <td className="rank-cell">{index + 1}</td>
                      <td className="username-cell">{user.username}</td>
                      <td>{user.level}</td>
                      <td>{user.totalClicks}</td>
                      <td>{user.totalShares}</td>
                      <td>{user.totalLinks}</td>
                      <td>{user.longestStreak}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="leaderboard-modern-footer">
          <p>Leaderboards are updated in real-time. Your overall activity determines your rank.</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementsAndLeaderboard; 