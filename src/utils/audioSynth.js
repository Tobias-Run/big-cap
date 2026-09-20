/**
 * Web Audio API synthesizer for Crazy / Supernova Mode.
 * Fully synthesized in the browser without any external audio assets.
 * Respects user mute preference.
 */

class AudioSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Off by default so it is never irritating
    this.lastSliderTick = -1; // ctx time of the last slider tick; see playSliderMove
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
    } catch {
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
    } catch {
      // Ignore audio glitches safely
    }
  }

  // Issue #6 (Supernova mode 2.0): short tick while dragging the age slider.
  playSliderMove(direction = 'up') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Every slider step that changes the filtered set also fires
    // playCompanyChange, whose two square-wave notes are longer and louder
    // than this tick. At the original 420 Hz / 0.03 / 70 ms the tick sat
    // right under those notes in both pitch and level and was effectively
    // inaudible. Dropping it an octave puts it below their 523/784 Hz band
    // so the two read as separate events rather than one smear.
    const now = this.ctx.currentTime;

    // A fast drag fires onChange on every step. Without this the louder
    // tick would stack into a buzz; one tick per 45 ms still feels
    // continuous while dragging.
    if (now - this.lastSliderTick < 0.045) return;
    this.lastSliderTick = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 210;
      const freq = direction === 'up' ? baseFreq * 1.15 : baseFreq * 0.87;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Short attack rather than starting at full level: a hard start on a
      // triangle this low produces an audible click.
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.12);
    } catch {
      // Ignore audio glitches safely
    }
  }

  // Issue #6: distinctive sound when a company enters ('in') or drops out
  // ('out') of the filtered set as the age slider crosses its founding year.
  playCompanyChange(direction = 'in') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // A little two-note "pop" — rising for a company appearing, falling
      // for one dropping out — distinct from both the slider tick above
      // and the hover ping (playHover) so the three don't get confused.
      const notes = direction === 'in' ? [523.25, 783.99] : [523.25, 349.23];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.035, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.1);
        }, idx * 55);
      });
    } catch {
      // Ignore audio glitches safely
    }
  }

  // Issue #6: distinct sound for adding vs. removing a region chip.
  playRegionToggle(added = true) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Adding a region: a short ascending "unlock" interval.
      // Removing one: a single softer, lower note.
      const notes = added ? [440, 659.25] : [349.23];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(added ? 0.05 : 0.04, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.18);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.19);
        }, idx * 90);
      });
    } catch {
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
    } catch {
      // Ignore audio glitches safely
    }
  }
}

export const audioSynth = new AudioSynth();
