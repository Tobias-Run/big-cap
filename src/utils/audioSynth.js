/**
 * Web Audio API synthesizer for Crazy / Supernova Mode.
 * Fully synthesized in the browser without any external audio assets.
 * Respects user mute preference.
 */

class AudioSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Off by default so it is never irritating
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.init();
      this.playChime(587.33, 0.15); // Friendly un-mute chime (D5)
    }
    return this.isMuted;
  }

  playHover(cap = 100) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Higher market cap = deeper, richer resonant frequency
      const minFreq = 180;
      const maxFreq = 650;
      const normalized = Math.min(Math.max(cap / 3000, 0), 1);
      const freq = maxFreq - normalized * (maxFreq - minFreq);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {
      // Ignore audio glitches safely
    }
  }

  playSupernova() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Chord progression for Supernova cosmic burst
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major 7th chord
      chord.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.5);

          gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.65);
        }, idx * 60);
      });
    } catch (e) {
      // Ignore audio glitches safely
    }
  }

  playChime(freq = 440, duration = 0.2) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio glitches safely
    }
  }
}

export const audioSynth = new AudioSynth();
