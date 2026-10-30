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

  // Chronological order for chart (oldest to newest)
  const chartSessions = [...sessions].reverse().slice(-12);

  return (
    <div className="progress-page-wrapper">
      <div className="progress-container">
        {/* Top Header */}
        <header className="progress-header">
          <div className="header-left">
            <Link to="/" className="back-link">← Home</Link>
            <h1 className="progress-title">Biomechanical Progress & Analytics</h1>
            <p className="progress-subtitle">
              100% Client-Side Offline Session Telemetry & Clinical Form Audits
            </p>
          </div>
          <div className="header-right">
            <Link to="/start">
              <button className="btn-action btn-studio">Go to Studio 🧘</button>
            </Link>
            {sessions.length > 0 && (
              <button className="btn-action btn-export" onClick={handleExportJSON}>
                Export JSON Report 📥
              </button>
            )}
          </div>
        </header>

        {/* Overview Stat Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Total Practice Sessions</span>
            <span className="stat-number">{totalSessions}</span>
            <span className="stat-sub">Recorded locally in IndexedDB</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Total Time Held</span>
            <span className="stat-number">{Math.round(totalSeconds)}s</span>
            <span className="stat-sub">Active biomechanical hold time</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Average Form Score</span>
            <span className="stat-number score-accent">{avgScore}</span>
            <span className="stat-sub">Across balance, symmetry, & accuracy</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Safety Alerts Handled</span>
            <span className="stat-number text-safe">{totalAlertsPrevented}</span>
            <span className="stat-sub">Hyperextensions & posture compensations</span>
          </div>
        </div>

        {/* Interactive Progress Trend Chart (Always Visible) */}
        {(() => {
          // Provide sample baseline if no sessions yet so the chart is never missing
          const isBaseline = chartSessions.length === 0;
          const displayData = isBaseline
            ? [
                { poseName: 'Tree', overallScore: 82, durationSeconds: 15 },
                { poseName: 'Chair', overallScore: 78, durationSeconds: 20 },
                { poseName: 'Warrior', overallScore: 88, durationSeconds: 25 },
                { poseName: 'Dog', overallScore: 92, durationSeconds: 30 },
              ]
            : chartSessions.length === 1
            ? [
                { poseName: 'Baseline', overallScore: 70, durationSeconds: 10 },
                chartSessions[0]
              ]
            : chartSessions;

          const paddingX = 60;
          const availableWidth = 680;
          const stepX = displayData.length > 1 ? availableWidth / (displayData.length - 1) : 0;
          const points = displayData.map((s, idx) => {
            const x = paddingX + idx * stepX;
            const y = 160 - ((s.overallScore || 50) / 100) * 125;
            const barHeight = Math.min(100, Math.max(15, (s.durationSeconds || 10) * 2.5));
            return { x, y, score: s.overallScore || 75, pose: s.poseName || 'Pose', duration: Math.round(s.durationSeconds || 10), barHeight };
          });

          const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
          const areaPath = `${linePath} L ${points[points.length - 1].x} 175 L ${points[0].x} 175 Z`;

          return (
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
                    📈 Performance Trend & Holding Duration
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {isBaseline 
                      ? 'Target Form Baseline — Complete poses in the Studio to plot your personal history' 
                      : `Tracking last ${displayData.length} completed sessions`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>● Form Score (Line)</span>
                  <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>■ Hold Duration (Bars)</span>
                </div>
              </div>

              <div className="svg-chart-container" style={{ position: 'relative', marginTop: '16px' }}>
                <svg viewBox="0 0 800 220" className="trend-svg" style={{ width: '100%', height: '220px', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.15" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="40" y1="35" x2="760" y2="35" stroke="rgba(255,255,255,0.08)" strokeDasharray="4" />
                  <text x="30" y="38" fill="#64748b" fontSize="10" textAnchor="end">100</text>
                  <line x1="40" y1="98" x2="760" y2="98" stroke="rgba(255,255,255,0.08)" strokeDasharray="4" />
                  <text x="30" y="101" fill="#64748b" fontSize="10" textAnchor="end">50</text>
                  <line x1="40" y1="160" x2="760" y2="160" stroke="rgba(255,255,255,0.08)" strokeDasharray="4" />
                  <text x="30" y="163" fill="#64748b" fontSize="10" textAnchor="end">0</text>

                  {/* Duration Bars */}
                  {points.map((p, i) => (
                    <g key={`bar-${i}`}>
                      <rect
                        x={p.x - 14}
                        y={160 - p.barHeight}
                        width="28"
                        height={p.barHeight}
                        rx="4"
                        fill="url(#barGrad)"
                        stroke="#38bdf8"
                        strokeWidth="1"
                        opacity="0.8"
                      />
                      <text x={p.x} y={155 - p.barHeight} fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                        {p.duration}s
                      </text>
                    </g>
                  ))}

                  {/* Score Area Gradient & Line */}
                  <path d={areaPath} fill="url(#scoreGrad)" />
                  <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" />

                  {/* Data Point Dots & Labels */}
                  {points.map((p, i) => (
                    <g key={`pt-${i}`}>
                      <circle cx={p.x} cy={p.y} r="6" fill="#090d16" stroke="#34d399" strokeWidth="3" />
                      <text x={p.x} y={p.y - 10} fill="#f8fafc" fontSize="11" textAnchor="middle" fontWeight="bold">
                        {p.score}
                      </text>
                      <text x={p.x} y="185" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600">
                        {p.pose}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          );
        })()}

        {/* Session History Feed */}
        <div className="history-section">
          <div className="history-header">
            <h2>Session History ({sessions.length})</h2>
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
                Complete a pose in the Studio and click "Stop Pose" to generate your first diagnostic scorecard!
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
                      {sess.overallScore} / 100
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
                        <span>Hyperextensions</span>
                        <strong className={sess.metrics?.hyperextensionCount > 0 ? 'text-warn' : 'text-good'}>
                          {sess.metrics?.hyperextensionCount || 0}
                        </strong>
                      </div>
                    </div>

                    {sess.recommendations && sess.recommendations.length > 0 && (
                      <div className="session-rec-box">
                        <span className="rec-title">Clinical Mobility Insight:</span>
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
    </div>
  );
}
