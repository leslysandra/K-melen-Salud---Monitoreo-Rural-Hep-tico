// Audio synthesizer (Web Audio API) & Speech Synthesis (es-CL)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Low haptic tactile click tone
export function playTactileClick(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (err) {
    console.debug('Audio click suppressed:', err);
  }
}

// Success chime
export function playSuccessChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } catch (err) {
    console.debug('Audio chime suppressed:', err);
  }
}

// Warning tone
export function playWarningBeep(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(260, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (err) {
    console.debug('Audio warning suppressed:', err);
  }
}

// Emergency / Alert notification tone (soft medical alert)
export function playAlertSiren(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.setValueAtTime(440, now + 0.15);
    osc.frequency.setValueAtTime(520, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch (err) {
    console.debug('Audio alert suppressed:', err);
  }
}

// Gentle tap tone
export function playGlitchNoise(): void {
  playTactileClick();
}

// Speech synthesis with prioritized Chilean Spanish (es-CL) voice
let activeUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Searches for a Chilean Spanish voice (es-CL), with sensible Latin American fallbacks.
 */
export function getChileanVoice(): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 
    ? cachedVoices 
    : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);
  
  if (!voices || voices.length === 0) return null;

  // 1. Highest priority: exact Chilean Spanish voice code or voice containing "Chile"
  const chileanVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    const name = (v.name || '').toLowerCase();
    return lang === 'es-cl' || name.includes('chile') || name.includes('chilean');
  });
  if (chileanVoice) return chileanVoice;

  // 2. Second priority: Latin American Spanish (es-419, es-AR, es-MX, es-CO, es-PE)
  const latamVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    const name = (v.name || '').toLowerCase();
    return lang === 'es-419' || 
           lang.startsWith('es-ar') || 
           lang.startsWith('es-mx') || 
           lang.startsWith('es-co') || 
           lang.startsWith('es-pe') ||
           name.includes('latin') ||
           name.includes('américa');
  });
  if (latamVoice) return latamVoice;

  // 3. Third priority: any Spanish voice (es-*)
  const anySpanishVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang.startsWith('es');
  });
  if (anySpanishVoice) return anySpanishVoice;

  return null;
}

export function speakText(
  text: string, 
  onStart?: () => void, 
  onEnd?: () => void
): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not available in this browser');
    return;
  }

  try {
    // Stop any existing speech and resume audio context if paused
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Small delay ensures previous speech queue is cleanly flushed
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Comfortable cadence for rural elder
      utterance.pitch = 1.0;
      utterance.lang = 'es-CL'; // Explicitly Chilean Spanish

      const clVoice = getChileanVoice();
      if (clVoice) {
        utterance.voice = clVoice;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        activeUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.debug('Speech playback completed or interrupted:', e);
        activeUtterance = null;
        if (onEnd) onEnd();
      };

      activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }, 30);
  } catch (err) {
    console.debug('Speech error:', err);
    activeUtterance = null;
    if (onEnd) onEnd();
  }
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function isCurrentlySpeaking(): boolean {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
