/**
 * Audio Effects Engine using Web Audio API
 * Generates realistic telephony sound effects (ringback tone, pickup, hangup)
 * and commercial milestone feedback chimes without external audio assets.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private ringOsc1: OscillatorNode | null = null;
  private ringOsc2: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private ringInterval: any = null;
  public enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Authentic Dual-Tone Telephone Ringback (440Hz + 480Hz)
   * Pattern: 1.5s ring, 2.5s silence
   */
  public startPhoneRinging() {
    if (!this.enabled) return;
    this.stopPhoneRinging();

    const ctx = this.getContext();
    const playRingBurst = () => {
      try {
        if (!this.enabled || ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.setValueAtTime(0.12, now + 1.4);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);
        gain.connect(ctx.destination);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now); // Standard North American / Global ring tone
        osc1.connect(gain);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now);
        osc2.connect(gain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.5);
        osc2.stop(now + 1.5);
      } catch (err) {
        console.warn('Audio ring burst error:', err);
      }
    };

    playRingBurst();
    this.ringInterval = setInterval(playRingBurst, 4000);
  }

  public stopPhoneRinging() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  /**
   * Authentic Telephone Pickup Click
   * Soft mechanical switch click and short line activation noise
   */
  public playPickupClick() {
    this.stopPhoneRinging();
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Click pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      // Micro line hiss
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.02;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, now + 0.04);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now + 0.04);
    } catch (err) {
      console.warn('Audio pickup click error:', err);
    }
  }

  /**
   * Telephone Hangup Tone (3 gentle busy beeps 480Hz)
   */
  public playHangupBeeps() {
    this.stopPhoneRinging();
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      [0, 0.25, 0.5].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now + offset);

        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.12, now + offset + 0.02);
        gain.gain.setValueAtTime(0.12, now + offset + 0.13);
        gain.gain.linearRampToValueAtTime(0, now + offset + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.16);
      });
    } catch (err) {
      console.warn('Audio hangup beeps error:', err);
    }
  }

  /**
   * Positive Sales Milestone Chime (Bright C6 -> E6 -> G6 marimba chord)
   */
  public playMilestoneChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const freqs = [1046.5, 1318.5, 1567.98]; // C6, E6, G6

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.46);
      });
    } catch (err) {
      console.warn('Audio chime error:', err);
    }
  }

  /**
   * Objection / Disinterest acoustic alert (Soft double knock)
   */
  public playObjectionAlert() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      [0, 0.12].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now + offset);
        osc.frequency.exponentialRampToValueAtTime(110, now + offset + 0.07);

        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
    } catch (err) {
      console.warn('Audio objection alert error:', err);
    }
  }
}

export const sfx = new SoundEffectsEngine();
