/**
 * Pranayama & Breathing Synchronization Engine for Yoga AI
 * Pairs a yogic breathing rhythm (Inhale 4s -> Hold 4s -> Exhale 4s) with pose holding.
 * Computes expansion/contraction factors and renders an animated chest aura on canvas.
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
   * Calculates the current breath phase, progress, and visual scale factor.
   */
  getState() {
    const elapsed = (Date.now() - this.startTime) % this.cycleMs;

    if (elapsed < this.inhaleMs) {
      const progress = elapsed / this.inhaleMs;
      // Scales smoothly from 1.0 to 1.6
      const radiusScale = 1.0 + 0.6 * progress;
      return {
        phase: 'Inhale',
        instruction: 'Deep Inhale...',
        progress,
        radiusScale,
        color: 'rgba(56, 189, 248, 0.45)', // Sky blue
        glowColor: 'rgba(56, 189, 248, 0.9)'
      };
    } else if (elapsed < this.inhaleMs + this.holdMs) {
      const progress = (elapsed - this.inhaleMs) / this.holdMs;
      return {
        phase: 'Hold',
        instruction: 'Retain Breath...',
        progress,
        radiusScale: 1.6,
        color: 'rgba(16, 185, 129, 0.45)', // Emerald green
        glowColor: 'rgba(16, 185, 129, 0.9)'
      };
    } else {
      const progress = (elapsed - this.inhaleMs - this.holdMs) / this.exhaleMs;
      // Contracts smoothly from 1.6 back to 1.0
      const radiusScale = 1.6 - 0.6 * progress;
      return {
        phase: 'Exhale',
        instruction: 'Slow Exhale...',
        progress,
        radiusScale,
        color: 'rgba(168, 85, 247, 0.45)', // Purple
        glowColor: 'rgba(168, 85, 247, 0.9)'
      };
    }
  }

  /**
   * Draws a soft pulsing breath aura on the HTML5 canvas at the chest coordinate.
   */
  drawAura(ctx, x, y, baseRadius = 24) {
    if (!ctx || x === undefined || y === undefined) return;
    const state = this.getState();
    const currentRadius = baseRadius * state.radiusScale;

    ctx.save();
    // Outer radial glow
    const gradient = ctx.createRadialGradient(x, y, baseRadius * 0.5, x, y, currentRadius);
    gradient.addColorStop(0, state.glowColor);
    gradient.addColorStop(0.6, state.color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Central pulsing ring
    ctx.beginPath();
    ctx.arc(x, y, currentRadius * 0.75, 0, 2 * Math.PI);
    ctx.strokeStyle = state.glowColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}
