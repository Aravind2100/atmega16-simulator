/**
 * Web Audio driver for the simulated Piezo Buzzer
 * Produces real acoustic frequencies when ATmega16 toggles buzzer pin
 */

class AudioDriver {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private isPlaying = false;
  private lastToggleTime = 0;
  private toggleCount = 0;
  private estimatedFreq = 0;

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.05; // comfortable learning volume
        this.gain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public pulse(high: boolean) {
    const now = performance.now();
    this.toggleCount++;

    if (now - this.lastToggleTime > 100) {
      // Calculate frequency in Hz = (toggles / 2) / (deltaSeconds)
      const deltaSec = (now - this.lastToggleTime) / 1000;
      this.estimatedFreq = Math.round((this.toggleCount / 2) / deltaSec);
      this.toggleCount = 0;
      this.lastToggleTime = now;

      if (this.estimatedFreq >= 50 && this.estimatedFreq <= 8000) {
        this.setTone(this.estimatedFreq);
      } else if (high) {
        // DC High click
        this.setTone(1000);
      } else {
        this.stop();
      }
    }
  }

  public setTone(freq: number) {
    try {
      this.ensureContext();
      if (!this.ctx || !this.gain) return;

      if (!this.osc) {
        this.osc = this.ctx.createOscillator();
        this.osc.type = 'square';
        this.osc.connect(this.gain);
        this.osc.start();
        this.isPlaying = true;
      }

      this.osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.01);
      this.gain.gain.setTargetAtTime(0.04, this.ctx.currentTime, 0.01);
    } catch {
      // Audio might be blocked by browser autoplay policy until user interacts
    }
  }

  public stop() {
    if (this.gain && this.ctx) {
      this.gain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.02);
    }
  }

  public destroy() {
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {}
      this.osc = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
    this.isPlaying = false;
  }
}

export const buzzerAudio = new AudioDriver();
