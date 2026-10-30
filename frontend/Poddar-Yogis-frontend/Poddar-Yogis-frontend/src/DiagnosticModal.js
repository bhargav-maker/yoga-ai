import React, { useState, useEffect, useRef } from 'react';
import './DiagnosticModal.css';

/**
 * DiagnosticModal Component
 * Automatically closes after 10 seconds if untouched, with a smooth visual progress bar.
 * Hovering or touching pauses the timer so the user can read their results.
 */

export default function DiagnosticModal({ scorecard, onClose, onViewHistory }) {
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!scorecard) return;

    setSecondsRemaining(10);
    setIsPaused(false);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (onClose) onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scorecard, onClose]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (onClose) onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!scorecard) return null;

  const {
    poseName,
    durationSeconds,
    overallScore,
    grade,
    badgeColor,
    metrics = {},
    recommendations = []
  } = scorecard;

  const progressPercent = (secondsRemaining / 10) * 100;

  return (
    <div className="diagnostic-modal-backdrop">
      <div 
        className="diagnostic-modal-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
      >
        {/* 10-Second Auto-Dismiss Progress Bar Header */}
        <div className="auto-close-container">
          <div className="auto-close-label">
            <span>{isPaused ? 'Auto-close paused (reading...)' : `Closing in ${secondsRemaining}s`}</span>
            <span className="auto-close-hint">(Hover or touch to hold open)</span>
          </div>
          <div className="auto-close-bar-track">
            <div 
              className="auto-close-bar-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="modal-pre-title">SESSION DIAGNOSTIC REPORT</span>
            <h2 className="modal-title">{poseName} Pose Scorecard</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        {/* Main Score Hero */}
        <div className="modal-hero">
          <div className="score-circle" style={{ borderColor: badgeColor }}>
            <span className="score-number" style={{ color: badgeColor }}>{overallScore}</span>
            <span className="score-max">/ 100</span>
          </div>
          <div className="score-meta">
            <span className="score-grade" style={{ color: badgeColor }}>{grade}</span>
            <p className="score-desc">
              Total Hold Duration: <strong>{durationSeconds}s</strong>
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="modal-metrics-grid">
          <div className="metric-box">
            <span className="metric-label">Stillness & Balance</span>
            <div className="metric-bar-container">
              <div 
                className="metric-bar-fill" 
                style={{ width: `${metrics.stability || 0}%`, backgroundColor: '#10b981' }}
              />
            </div>
            <span className="metric-val">{metrics.stability || 0}%</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">Shoulder & Hip Symmetry</span>
            <div className="metric-bar-container">
              <div 
                className="metric-bar-fill" 
                style={{ width: `${metrics.symmetry || 0}%`, backgroundColor: '#0ea5e9' }}
              />
            </div>
            <span className="metric-val">{metrics.symmetry || 0}%</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">Pose Landmark Accuracy</span>
            <div className="metric-bar-container">
              <div 
                className="metric-bar-fill" 
                style={{ width: `${metrics.accuracy || 0}%`, backgroundColor: '#a855f7' }}
              />
            </div>
            <span className="metric-val">{metrics.accuracy || 0}%</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">Hyperextension Warnings</span>
            <span className={`metric-val ${metrics.hyperextensionCount > 0 ? 'text-warn' : 'text-good'}`}>
              {metrics.hyperextensionCount || 0} alerts
            </span>
          </div>
        </div>

        {/* Prescriptive Mobility Recommendations */}
        <div className="modal-recommendations">
          <h4>Clinical Mobility & Form Guidance</h4>
          <ul>
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button className="btn-modal-secondary" onClick={onClose}>
            Close & Back to Practice
          </button>
          {onViewHistory && (
            <button className="btn-modal-primary" onClick={onViewHistory}>
              View All Progress Reports →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
