class SoundService {
  private audioContext: AudioContext | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  playClick() {
    this.playTone(800, 0.1, 'sine', 0.05);
  }

  playSuccess() {
    this.playTone(600, 0.1, 'sine', 0.05);
    setTimeout(() => this.playTone(900, 0.2, 'sine', 0.05), 100);
  }

  playAlert() {
    this.playTone(400, 0.3, 'square', 0.1);
    setTimeout(() => this.playTone(400, 0.3, 'square', 0.1), 400);
  }

  playData() {
    this.playTone(1200, 0.05, 'sawtooth', 0.02);
  }

  playProcess() {
    this.playTone(300, 0.4, 'sine', 0.03);
  }

  playMorse(dot: boolean) {
    this.playTone(700, dot ? 0.1 : 0.3, 'sine', 0.1);
  }
}

export const soundService = new SoundService();
