/**
 * Pranayama & Breathing Synchronization Engine for Yoga AI
 * Pairs a yogic breathing rhythm (Inhale 4s -> Hold 4s -> Exhale 4s) with pose holding.
 * Computes smooth expansion/contraction factors and renders a clean, transparent pulsing ring.
 */

export class BreathingEngine {
  constructor(inhaleMs = 4000, holdMs = 4000, exhaleMs = 4000) {
    this.inhaleMs = inhaleMs;
    this.holdMs = holdMs;
    this.exhaleMs = exhaleMs;
    this.cycleMs = inhaleMs + holdMs + exhaleMs;
    this.startTime = Date.now();
  }

  reset() {
    this.startTime = Date.now();
  }

  /**
   * Calculates current breath phase and smooth sinusoidal scale factor.
   */
  getState() {
    const elapsed = (Date.now() - this.startTime) % this.cycleMs;

    if (elapsed < this.inhaleMs) {
      const progress = elapsed / this.inhaleMs;
      // Smooth sinusoidal growth from 1.0 to 1.7
      const smoothEase = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      const radiusScale = 1.0 + 0.7 * smoothEase;
      return {
        phase: 'Inhale',
        instruction: 'Inhale Slowly...',
        progress,
        radiusScale,
        ringColor: 'rgba(56, 189, 248, 0.85)',
        haloColor: 'rgba(56, 189, 248, 0.15)'
      };
    } else if (elapsed < this.inhaleMs + this.holdMs) {
      const progress = (elapsed - this.inhaleMs) / this.holdMs;
      // Gentle micro-pulse during retention
      const microPulse = Math.sin(progress * Math.PI * 2) * 0.05;
      const radiusScale = 1.7 + microPulse;
      return {
        phase: 'Hold',
        instruction: 'Retain Breath...',
        progress,
        radiusScale,
        ringColor: 'rgba(16, 185, 129, 0.9)',
        haloColor: 'rgba(16, 185, 129, 0.2)'
      };
    } else {
      const progress = (elapsed - this.inhaleMs - this.holdMs) / this.exhaleMs;
      // Smooth sinusoidal contraction from 1.7 back down to 1.0
      const smoothEase = 0.5 + 0.5 * Math.cos(progress * Math.PI);
      const radiusScale = 1.0 + 0.7 * smoothEase;
      return {
        phase: 'Exhale',
        instruction: 'Exhale Fully...',
        progress,
        radiusScale,
        ringColor: 'rgba(168, 85, 247, 0.85)',
        haloColor: 'rgba(168, 85, 247, 0.15)'
      };
    }
  }

  /**
   * Draws a clean, elegant breath ring without muddy center artifacts.
   */
  drawAura(ctx, x, y, baseRadius = 26) {
    if (!ctx || x === undefined || y === undefined) return;
    const state = this.getState();
    const currentRadius = baseRadius * state.radiusScale;

    ctx.save();
    
    // 1. Soft subtle halo (no dense dark center)
    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, 2 * Math.PI);
    ctx.fillStyle = state.haloColor;
    ctx.fill();

    // 2. Clean crisp neon breathing ring
    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = state.ringColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = state.ringColor;
    ctx.shadowBlur = 8;
    ctx.stroke();

    // 3. Small central anchor dot
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = state.ringColor;
    ctx.fill();

    ctx.restore();
  }
}
