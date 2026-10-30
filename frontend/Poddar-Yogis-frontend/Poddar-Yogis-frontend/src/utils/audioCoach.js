/**
 * Audio Coach (Prioritized Speech Synthesis) for Yoga AI
 * Uses the native browser SpeechSynthesis API (100% offline, zero server cost).
 * Implements a smart cooldown timer and prevents repeating the same message consecutively.
 */

class AudioCoach {
  constructor(cooldownMs = 4500) {
    this.cooldownMs = cooldownMs;
    this.lastSpokenTime = 0;
    this.lastMessage = '';
    this.isEnabled = true;
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Speaks a prioritized correction if cooldown has elapsed and message is fresh.
   * @param {string} text - The correction sentence to speak.
   * @param {boolean} force - Bypass cooldown (for urgent hyperextension warnings).
   */
  speak(text, force = false) {
    if (!this.isEnabled || !text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    const timeSinceLast = now - this.lastSpokenTime;

    // Suppress if within cooldown period and not forced
    if (!force && timeSinceLast < this.cooldownMs) {
      return;
    }

    // Suppress if the same exact instruction was just spoken recently
    if (this.lastMessage === text && timeSinceLast < this.cooldownMs * 2) {
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel(); // Stop any pending utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      // Select an English voice if loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('David')));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
      this.lastSpokenTime = now;
      this.lastMessage = text;
    } catch (err) {
      console.warn('Speech synthesis notice:', err);
    }
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioCoach = new AudioCoach(4500);
