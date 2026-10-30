/**
 * Stability & Balance Tracker (Micro-Movement Analysis) for Yoga AI
 * Tracks center-of-gravity (CoG) velocity and spatial variance across a sliding window of frames.
 * Halts hold-time accumulation if the user is wobbling or unstable.
 */

import { POINTS } from './data';

export class StabilityTracker {
  constructor(windowSize = 15, varianceThreshold = 18.0) {
    this.windowSize = windowSize;
    this.varianceThreshold = varianceThreshold; // pixel variance limit for "stillness"
    this.history = []; // Array of { x, y, timestamp }
  }

  reset() {
    this.history = [];
  }

  /**
   * Updates tracker with current frame landmarks.
   * Returns { isStable: boolean, variance: number, stabilityPercentage: number, isTracking: boolean }
   */
  update(keypoints, minScore = 0.35) {
    const lHip = keypoints[POINTS.LEFT_HIP];
    const rHip = keypoints[POINTS.RIGHT_HIP];
    const lShoulder = keypoints[POINTS.LEFT_SHOULDER];
    const rShoulder = keypoints[POINTS.RIGHT_SHOULDER];

    // If core hips or shoulders are missing/not visible, we are NOT tracking stillness
    if (!lHip || !rHip || lHip.score < minScore || rHip.score < minScore) {
      return { isStable: false, variance: 0, stabilityPercentage: 0, isTracking: false };
    }

    // Center of gravity estimate: midpoint between hips and shoulders
    let cogX = (lHip.x + rHip.x) / 2;
    let cogY = (lHip.y + rHip.y) / 2;
    if (lShoulder && rShoulder && lShoulder.score >= minScore && rShoulder.score >= minScore) {
      const shoulderMidX = (lShoulder.x + rShoulder.x) / 2;
      const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
      cogX = (cogX + shoulderMidX) / 2;
      cogY = (cogY + shoulderMidY) / 2;
    }

    this.history.push({ x: cogX, y: cogY, t: Date.now() });
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    if (this.history.length < 5) {
      return { isStable: true, variance: 0, stabilityPercentage: 100, isTracking: true };
    }

    // Mean CoG position
    const meanX = this.history.reduce((sum, p) => sum + p.x, 0) / this.history.length;
    const meanY = this.history.reduce((sum, p) => sum + p.y, 0) / this.history.length;

    // Variance calculation
    const variance = this.history.reduce((sum, p) => {
      const dx = p.x - meanX;
      const dy = p.y - meanY;
      return sum + (dx * dx + dy * dy);
    }, 0) / this.history.length;

    const isStable = variance <= this.varianceThreshold;

    // Calculate stability percentage (0 - 100)
    const stabilityPercentage = Math.max(0, Math.min(100, Math.round(100 - (variance / (this.varianceThreshold * 2.5)) * 100)));

    return {
      isStable,
      variance: Math.round(variance * 10) / 10,
      stabilityPercentage,
      isTracking: true
    };
  }
}
