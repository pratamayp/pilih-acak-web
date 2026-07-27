let audioCtx = null;

export function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playTick() {
  if (!window.appSettings?.soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Overtone structure for an elegant wooden marimba peg sound
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1100, audioCtx.currentTime);
  
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(2600, audioCtx.currentTime);

  // Gentle quick decay
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(audioCtx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(audioCtx.currentTime + 0.03);
  osc2.stop(audioCtx.currentTime + 0.03);
}

export function playFanfare() {
  if (!window.appSettings?.soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  const startTime = audioCtx.currentTime;
  
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const noteTime = startTime + (index * 0.15);
    
    gain.gain.setValueAtTime(0, noteTime);
    gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(noteTime);
    osc.stop(noteTime + 0.3);
  });
}
