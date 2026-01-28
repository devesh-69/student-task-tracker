/**
 * Audio Service
 * Generates synthetic sound effects using the Web Audio API.
 * No external files required.
 */

// Simple synthesizer for a "Success" / "Win" sound
export const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
  
      const ctx = new AudioContext();
      const now = ctx.currentTime;
  
      // Create oscillators for a chord (C Major)
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
  
        osc.type = 'sine';
        osc.frequency.value = freq;
  
        // Envelope
        gain.gain.setValueAtTime(0, now);
        // Stagger entries slightly for a "strum" effect
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1 + (i * 0.05));
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  
        osc.connect(gain);
        gain.connect(ctx.destination);
  
        osc.start(now);
        osc.stop(now + 1.5);
      });
  
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };
  