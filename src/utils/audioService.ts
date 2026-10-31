/**
 * Audio Service for BÉ VUI HỌC
 * Provides Web Speech API (Vietnamese) and Web Audio API synthesized sound effects.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private isBgmPlaying = false;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmTimer: number | null = null;
  private volume: number = 0.8;
  private isMuted: boolean = false;
  private vietnameseVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    this.vietnameseVoice =
      voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VIE')) || null;
  }

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.12, this.getAudioContext().currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.12, this.getAudioContext().currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Speak Vietnamese text using Web Speech API
   */
  public speak(text: string, rate: number = 0.9): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || this.isMuted) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = rate; // slightly slower for young kids
      utterance.pitch = 1.15; // friendly, gentle pitch

      if (this.vietnameseVoice) {
        utterance.voice = this.vietnameseVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Play sweet bubble pop on button clicks
   */
  public playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Play joyful celebratory chord when answering correctly
   */
  public playCorrect() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.07);

        gain.gain.setValueAtTime(0.001, now + index * 0.07);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + index * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.07);
        osc.stop(now + index * 0.07 + 0.3);
      });
    } catch {
      // fallback
    }
  }

  /**
   * Play soft, encouraging boop when trying again (never harsh or punishing)
   */
  public playEncourage() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [440, 392]; // A4 -> G4 gentle descending warm tones

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(this.volume * 0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.22);
      });
    } catch {
      // fallback
    }
  }

  /**
   * Play star collection chime
   */
  public playStarChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const freqs = [659.25, 880, 1174.66, 1318.51];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(this.volume * 0.22, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.36);
      });
    } catch {
      // fallback
    }
  }

  /**
   * Fanfare for completing full level
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, t: 0.0, d: 0.12 },
        { f: 523.25, t: 0.14, d: 0.12 },
        { f: 523.25, t: 0.28, d: 0.12 },
        { f: 659.25, t: 0.42, d: 0.25 },
        { f: 587.33, t: 0.70, d: 0.12 },
        { f: 659.25, t: 0.84, d: 0.12 },
        { f: 783.99, t: 0.98, d: 0.45 },
      ];

      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        gain.gain.setValueAtTime(0.001, now + note.t);
        gain.gain.linearRampToValueAtTime(this.volume * 0.28, now + note.t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.t);
        osc.stop(now + note.t + note.d);
      });
    } catch {
      // fallback
    }
  }

  /**
   * Soft, playful nursery background melody loop generated entirely via Web Audio
   */
  public startBgm() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    try {
      const ctx = this.getAudioContext();
      this.bgmGain = ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.1, ctx.currentTime);
      this.bgmGain.connect(ctx.destination);

      // Play soft pentatonic lullaby sequence
      const tune = [
        261.63, 329.63, 392.00, 440.00, 392.00, 329.63,
        293.66, 349.23, 440.00, 523.25, 440.00, 349.23,
      ];
      let step = 0;

      const playNextTone = () => {
        if (!this.isBgmPlaying) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(tune[step % tune.length], now);

        noteGain.gain.setValueAtTime(0.01, now);
        noteGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(noteGain);
        if (this.bgmGain) {
          noteGain.connect(this.bgmGain);
        }

        osc.start(now);
        osc.stop(now + 0.7);

        step++;
        this.bgmTimer = window.setTimeout(playNextTone, 750);
      };

      playNextTone();
    } catch {
      this.isBgmPlaying = false;
    }
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmOscillator) {
      try {
        this.bgmOscillator.stop();
      } catch {
        // ignore
      }
      this.bgmOscillator = null;
    }
  }

  public isBgmActive(): boolean {
    return this.isBgmPlaying;
  }
}

export const audio = new AudioService();
export default audio;
