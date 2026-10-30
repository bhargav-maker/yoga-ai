import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllSessionRecords, deleteSessionRecord, clearAllSessionRecords } from './utils/db';
import './Progress.css';

export default function Progress() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const records = await getAllSessionRecords();
      setSessions(records);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this practice session record?')) {
      await deleteSessionRecord(id);
      loadData();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all practice history?')) {
      await clearAllSessionRecords();
      loadData();
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Yoga_AI_Progress_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Aggregated stats
  const totalSessions = sessions.length;
  const totalSeconds = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / totalSessions)
    : 0;
  const totalAlertsPrevented = sessions.reduce((acc, s) => acc + ((s.metrics && s.metrics.hyperextensionCount) || 0), 0);

  // Group stats by pose for the Pose Performance Bar Chart
  const poseStatsMap = {};
  sessions.forEach((s) => {
    const p = s.poseName || 'Unknown';
    if (!poseStatsMap[p]) {
      poseStatsMap[p] = { count: 0, totalScore: 0, totalTime: 0 };
    }
    poseStatsMap[p].count += 1;
    poseStatsMap[p].totalScore += (s.overallScore || 0);
    poseStatsMap[p].totalTime += (s.durationSeconds || 0);
  });

  const poseChartData = Object.keys(poseStatsMap).map((name) => ({
    name,
    avgScore: Math.round(poseStatsMap[name].totalScore / poseStatsMap[name].count),
    sessions: poseStatsMap[name].count,
    time: Math.round(poseStatsMap[name].totalTime)
  }));

  // Chronological sessions for trend line chart (oldest to newest, max 10)
  const trendSessions = [...sessions].reverse().slice(-10);

  return (
    <div className="progress-container">
      {/* Top Header */}
      <header className="progress-header">
        <div className="header-left">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1 className="progress-title">Biomechanical Analytics & History</h1>
          <p className="progress-subtitle">
            100% Client-Side Offline Session Telemetry, Bar Graphs & Line Charts
          </p>
        </div>
        <div className="header-right">
          <Link to="/start">
            <button className="btn-action btn-studio">Go to Studio 🧘</button>
          </Link>
          {sessions.length > 0 && (
            <button className="btn-action btn-export" onClick={handleExportJSON}>
              Export JSON 📥
            </button>
          )}
        </div>
      </header>

      {/* Overview Metric Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Practice Sessions</span>
          <span className="stat-number">{totalSessions}</span>
          <span className="stat-sub">Persisted in browser IndexedDB</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Time Held</span>
          <span className="stat-number">{Math.round(totalSeconds)}s</span>
          <span className="stat-sub">Active aligned hold time</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Average Form Accuracy</span>
          <span className="stat-number score-accent">{avgScore}%</span>
          <span className="stat-sub">Across balance, symmetry, & geometry</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Injury Alerts Prevented</span>
          <span className="stat-number text-safe">{totalAlertsPrevented}</span>
          <span className="stat-sub">Hyperextensions & tilt corrections</span>
        </div>
      </div>

      {/* Visual Analytics Graphs Section */}
      {sessions.length > 0 && (
        <div className="charts-section">
          {/* Pose Accuracy Bar Graph */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>📊 Pose Accuracy & Form Rating (Bar Graph)</h3>
              <span className="chart-tag">Average score per Asana</span>
            </div>
            <div className="bar-chart-container">
              {poseChartData.map((item) => (
                <div key={item.name} className="bar-row">
                  <div className="bar-info">
                    <span className="bar-pose-name">{item.name}</span>
                    <span className="bar-score-val">{item.avgScore}%</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${item.avgScore}%`,
                        backgroundColor: item.avgScore >= 85 ? '#10b981' : item.avgScore >= 70 ? '#0ea5e9' : '#f59e0b'
                      }}
                    />
                  </div>
                  <span className="bar-meta">{item.sessions} sessions ({item.time}s)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trend SVG Line Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>📈 Session Performance Trend (Line Chart)</h3>
              <span className="chart-tag">Latest {trendSessions.length} sessions</span>
            </div>
            <div className="svg-chart-container">
              <svg viewBox="0 0 500 160" className="trend-svg" preserveAspectRatio="none">
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />

                {/* Draw connecting line */}
                {trendSessions.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={trendSessions.map((s, idx) => {
                      const x = (idx / (trendSessions.length - 1)) * 460 + 20;
                      // Invert score for SVG y (100 = 20, 0 = 140)
                      const y = 140 - ((s.overallScore || 50) / 100) * 120;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                )}

                {/* Plot data points */}
                {trendSessions.map((s, idx) => {
                  const x = (idx / Math.max(1, trendSessions.length - 1)) * 460 + 20;
                  const y = 140 - ((s.overallScore || 50) / 100) * 120;
                  return (
                    <g key={s.id || idx}>
                      <circle cx={x} cy={y} r="6" fill="#090d16" stroke="#10b981" strokeWidth="3" />
                      <text x={x} y={y - 10} fill="#f8fafc" fontSize="11" textAnchor="middle" fontWeight="bold">
                        {s.overallScore}
                      </text>
                      <text x={x} y="155" fill="#94a3b8" fontSize="10" textAnchor="middle">
                        {s.poseName ? s.poseName.slice(0, 4) : `#${idx + 1}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Session History Feed */}
      <div className="history-section">
        <div className="history-header">
          <h2>Detailed Session Log ({sessions.length})</h2>
          {sessions.length > 0 && (
            <button className="btn-clear" onClick={handleClearAll}>
              Clear History
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-state">Loading records from IndexedDB...</div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <p>No practice sessions recorded yet.</p>
            <p className="empty-sub">
              Complete a pose in the Studio and click "Stop Pose" to see your live analytics and trend charts!
            </p>
            <Link to="/start">
              <button className="btn-action btn-studio">Start a Pose Now</button>
            </Link>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.map((sess) => (
              <div key={sess.id} className="session-card">
                <div className="session-card-top">
                  <div className="session-title-group">
                    <span className="session-pose-badge">{sess.poseName}</span>
                    <span className="session-date">
                      {new Date(sess.timestamp).toLocaleDateString()} at{' '}
                      {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="session-score-badge" style={{ backgroundColor: sess.badgeColor || '#10b981' }}>
                    {sess.overallScore}%
                  </div>
                </div>

                <div className="session-card-body">
                  <div className="card-metrics-row">
                    <div className="mini-metric">
                      <span>Hold Time</span>
                      <strong>{sess.durationSeconds}s</strong>
                    </div>
                    <div className="mini-metric">
                      <span>Stability</span>
                      <strong>{sess.metrics?.stability || 0}%</strong>
                    </div>
                    <div className="mini-metric">
                      <span>Symmetry</span>
                      <strong>{sess.metrics?.symmetry || 0}%</strong>
                    </div>
                    <div className="mini-metric">
                      <span>Accuracy</span>
                      <strong>{sess.metrics?.accuracy || 0}%</strong>
                    </div>
                    <div className="mini-metric">
                      <span>Alerts</span>
                      <strong className={sess.metrics?.hyperextensionCount > 0 ? 'text-warn' : 'text-good'}>
                        {sess.metrics?.hyperextensionCount || 0}
                      </strong>
                    </div>
                  </div>

                  {sess.recommendations && sess.recommendations.length > 0 && (
                    <div className="session-rec-box">
                      <span className="rec-title">Biomechanical Recommendation:</span>
                      <p>{sess.recommendations[0]}</p>
                    </div>
                  )}
                </div>

                <div className="session-card-footer">
                  <span className="session-grade">{sess.grade}</span>
                  <button className="btn-delete" onClick={() => handleDelete(sess.id)} title="Delete record">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
