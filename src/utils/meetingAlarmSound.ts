/**
 * Web Audio API synthesized alarm & chime sounds for meeting reminders.
 * Runs 100% locally with zero external network or asset dependencies.
 */

class MeetingAudioAlarm {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Play a bright, elegant, repetitive alarm bell (زي المنبه)
   */
  public playAlarm(pattern: 'one_hour' | 'thirty_min' | 'starting' | 'test' | 'bell' | 'chime' = 'thirty_min') {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Repeat count based on urgency
      const repeats = pattern === 'starting' ? 3 : pattern === 'thirty_min' ? 2 : 2;

      for (let r = 0; r < repeats; r++) {
        const offset = r * 0.75;
        // Chime frequencies (C5, E5, G5, C6)
        const notes = pattern === 'one_hour' 
          ? [523.25, 659.25, 783.99] // C5, E5, G5
          : [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + offset + idx * 0.12);

          // Bell envelope
          const startTime = now + offset + idx * 0.12;
          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.6);
        });
      }
    } catch (e) {
      console.warn('[MeetingAlarm] Audio synthesis notice:', e);
    }
  }
}

export const meetingAlarm = new MeetingAudioAlarm();
