const STORAGE_KEY = 'pilihacak_state';

// Generate UUID v4 (or fallback if not supported)
export function generateId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const defaultState = {
  activePool: [
    { id: generateId(), name: "Peserta Pertama", addedAt: new Date().toISOString() },
    { id: generateId(), name: "Peserta Kedua", addedAt: new Date().toISOString() },
    { id: generateId(), name: "Peserta Ketiga", addedAt: new Date().toISOString() }
  ],
  winnerHistory: [],
  settings: {
    soundEnabled: true
  }
};

export function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      window.appSettings = parsed.settings || { soundEnabled: true };
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  window.appSettings = defaultState.settings;
  return JSON.parse(JSON.stringify(defaultState));
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.appSettings = state.settings;
  } catch (e) {
    console.error("Failed to save state", e);
  }
}
