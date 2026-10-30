import React, { useEffect, useState } from 'react';
import './DiagnosticModal.css';

/**
 * DiagnosticModal Component
 * Shows post-pose session scorecard with an automatic 10-second countdown.
 * If user does not touch/click within 10 seconds, it auto-dismisses.
 * If touched/clicked, the timer pauses so the user can read and scroll freely.
 */
export default function DiagnosticModal({ scorecard, onClose, onViewHistory }) {
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onClose]);

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

  // Interacting with the modal card stops auto-close
  const handleUserInteract = () => {
    if (!isPaused) {
      setIsPaused(true);
    }
  };

  return (
    <div className="diagnostic-modal-backdrop" onClick={onClose}>
      <div 
        className="diagnostic-modal-card" 
        onClick={(e) => {
          e.stopPropagation();
          handleUserInteract();
        }}
        onTouchStart={handleUserInteract}
      >
        {/* Auto-Close Header Banner */}
        <div className="modal-auto-timer">
          {!isPaused ? (
            <span>⏱️ Auto-closing in <strong>{countdown}s</strong> (touch or click anywhere to keep open)</span>
          ) : (
            <span className="timer-paused">⏸️ Saved to History • Auto-close paused</span>
          )}
        </div>

        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="modal-pre-title">SESSION DIAGNOSTIC REPORT</span>
            <h2 className="modal-title">{poseName} Pose Scorecard</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        {/* Scrollable Body Container */}
        <div className="modal-scroll-body">
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
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button className="btn-modal-secondary" onClick={onClose}>
            Close
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
