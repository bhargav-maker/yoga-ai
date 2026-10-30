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

  return (
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

      {/* Aggregate Overview Cards */}
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
          <span className="stat-sub">Across balance, symmetry, & pose accuracy</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Safety Alerts Handled</span>
          <span className="stat-number text-safe">{totalAlertsPrevented}</span>
          <span className="stat-sub">Hyperextensions & posture compensations</span>
        </div>
      </div>

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
  );
}
