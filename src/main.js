import './style.css';
import confetti from 'canvas-confetti';
import { playTick, playFanfare, initAudio } from './sound.js';
import { loadState, saveState, generateId } from './store.js';

// --- State ---
let state = loadState();
let currentRotation = 0;
let isSpinning = false;

// Confetti colors
const confettiColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// --- DOM Elements ---
const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');
const btnSpin = document.getElementById('btn-spin');

// Tabs
const tabs = document.querySelectorAll('.nav-tab');
const tabSections = {
  'tab-wheel': document.getElementById('tab-wheel'),
  'tab-pool': document.getElementById('tab-pool'),
  'tab-history': document.getElementById('tab-history')
};

// Sound toggle
const btnSoundToggle = document.getElementById('btn-sound-toggle');
const iconSoundOn = document.getElementById('icon-sound-on');
const iconSoundoff = document.getElementById('icon-sound-off');

// Pool Tab
const formAddParticipant = document.getElementById('form-add-participant');
const inputParticipantName = document.getElementById('input-participant-name');
const btnToggleBulk = document.getElementById('btn-toggle-bulk');
const bulkInputContainer = document.getElementById('bulk-input-container');
const inputBulk = document.getElementById('input-bulk');
const btnAddBulk = document.getElementById('btn-add-bulk');
const listParticipants = document.getElementById('list-participants');
const poolCount = document.getElementById('pool-count');

// History & Settings Tab
const listHistory = document.getElementById('list-history');
const btnExport = document.getElementById('btn-export');
const inputImport = document.getElementById('input-import');
const btnClearData = document.getElementById('btn-clear-data');

// Winner Modal
const modalWinner = document.getElementById('modal-winner');
const winnerNameEl = document.getElementById('winner-name');
const btnWinnerConfirm = document.getElementById('btn-winner-confirm');
const btnWinnerClose = document.getElementById('btn-winner-close');
let currentWinnerId = null;

// --- Initialize App ---
function init() {
  updateSoundIcon();
  renderPoolList();
  renderHistoryList();
  drawWheel();
  setupEventListeners();
}

// --- Navigation Logic ---
function switchTab(targetId) {
  // Update active tab button style
  tabs.forEach(tab => {
    if (tab.dataset.target === targetId) {
      tab.classList.add('text-indigo-600');
      tab.classList.remove('text-slate-400', 'hover:text-slate-600');
    } else {
      tab.classList.remove('text-indigo-600');
      tab.classList.add('text-slate-400', 'hover:text-slate-600');
    }
  });

  // Show/Hide sections
  Object.keys(tabSections).forEach(id => {
    const section = tabSections[id];
    if (id === targetId) {
      section.classList.remove('opacity-0', 'pointer-events-none');
      // Fix for absolute positioning z-index issue
      section.style.zIndex = 10;
    } else {
      section.classList.add('opacity-0', 'pointer-events-none');
      section.style.zIndex = 1;
    }
  });

  if (targetId === 'tab-wheel') drawWheel();
}

// --- Audio Setting Logic ---
function updateSoundIcon() {
  if (state.settings.soundEnabled) {
    iconSoundOn.classList.remove('hidden');
    iconSoundoff.classList.add('hidden');
  } else {
    iconSoundOn.classList.add('hidden');
    iconSoundoff.classList.remove('hidden');
  }
}

function toggleSound() {
  initAudio(); // User interaction unlocks audio context
  state.settings.soundEnabled = !state.settings.soundEnabled;
  saveState(state);
  updateSoundIcon();
}

// Helper for text wrapping in wheel slices
function getWrappedLines(text, maxTextWidth, ctx) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxTextWidth) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
        currentLine = '';
      }
    } else {
      currentLine = testLine;
    }
    
    if (lines.length === 2) {
      break;
    }
  }
  
  if (currentLine && lines.length < 2) {
    lines.push(currentLine);
  }
  
  // Truncate to max 2 lines with ellipsis
  const totalWordsInLines = lines.reduce((acc, l) => acc + (l ? l.split(/\s+/).length : 0), 0);
  const remainingWordsCount = words.length - totalWordsInLines;
  
  if (remainingWordsCount > 0 && lines.length === 2) {
    let line2 = lines[1];
    while (line2.length > 0 && ctx.measureText(line2 + '...').width > maxTextWidth) {
      line2 = line2.substring(0, line2.length - 1);
    }
    lines[1] = line2 + '...';
  } else if (lines.length === 1 && ctx.measureText(lines[0]).width > maxTextWidth) {
    let line1 = lines[0];
    while (line1.length > 0 && ctx.measureText(line1 + '...').width > maxTextWidth) {
      line1 = line1.substring(0, line1.length - 1);
    }
    lines[0] = line1 + '...';
  }
  
  return lines;
}

// --- Wheel Drawing Logic ---
function drawWheel() {
  const participants = state.activePool;
  const numSlices = participants.length;
  
  // Prevent pixelation on high-DPI / Retina screens
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 320 * dpr;
  canvas.height = 320 * dpr;
  ctx.resetTransform();
  ctx.scale(dpr, dpr);
  
  ctx.clearRect(0, 0, 320, 320);
  
  if (numSlices === 0) {
    // Draw empty wheel
    ctx.beginPath();
    ctx.arc(160, 160, 160, 0, 2 * Math.PI);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Data Kosong', 160, 160);
    
    btnSpin.disabled = true;
    return;
  }
  
  btnSpin.disabled = false;
  
  const arcSize = (2 * Math.PI) / numSlices;
  
  // Apply rotation
  ctx.save();
  ctx.translate(160, 160);
  ctx.rotate(currentRotation);
  
  for (let i = 0; i < numSlices; i++) {
    const angle = i * arcSize;
    
    // Draw slice
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 160, angle, angle + arcSize);
    // Generate high-contrast, dynamic HSL color using Golden Angle distribution
    const hue = (i * 137.5) % 360;
    ctx.fillStyle = `hsl(${hue}, 70%, 52%)`;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw text with wrapping & smart sizes
    ctx.save();
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    
    // Adjust font size based on slice count
    let fontSize = 15;
    if (numSlices > 15) fontSize = 10;
    else if (numSlices > 10) fontSize = 12;
    else if (numSlices > 6) fontSize = 14;
    
    ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
    
    // Limit width so it doesn't collide with center dot
    const maxTextWidth = 140 - (fontSize * 2.5); 
    const lines = getWrappedLines(participants[i].name, maxTextWidth, ctx);
    
    const lineHeight = fontSize + 2;
    if (lines.length === 2) {
      ctx.fillText(lines[0], 145, -lineHeight / 2);
      ctx.fillText(lines[1], 145, lineHeight / 2);
    } else if (lines.length === 1) {
      ctx.fillText(lines[0], 145, 0);
    }
    
    ctx.restore();
  }
  ctx.restore();
  
  // Draw center dot
  ctx.beginPath();
  ctx.arc(160, 160, 15, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// --- Spinning Logic ---
function spinWheel() {
  if (isSpinning || state.activePool.length === 0) return;
  initAudio();
  
  isSpinning = true;
  btnSpin.disabled = true;
  
  const numSlices = state.activePool.length;
  const arcSize = (2 * Math.PI) / numSlices;
  
  // Use crypto for fair randomness to pick winner index
  const randomBuffer = new Uint32Array(1);
  window.crypto.getRandomValues(randomBuffer);
  const randomIndex = randomBuffer[0] % numSlices;
  
  // Calculate target rotation
  // Current rotation + 5-10 full spins + rotation to land on random index
  const extraSpins = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
  const baseRotation = extraSpins * 2 * Math.PI;
  
  // We want the winner slice to end up at the top (which is -Math.PI/2 or 270 deg)
  // Arrow is at the top.
  // The i-th slice covers angle range: [i*arcSize, (i+1)*arcSize] in the wheel's local coordinate system.
  // When rotated by R, the i-th slice is at [R + i*arcSize, R + (i+1)*arcSize].
  // We want the middle of the i-th slice to be at -Math.PI/2 (top).
  // So R + i*arcSize + arcSize/2 = -Math.PI/2 + 2*Math.PI * k
  // R = 2*Math.PI*k - Math.PI/2 - (i + 0.5)*arcSize
  
  const targetRotation = currentRotation + baseRotation + (2 * Math.PI - (currentRotation % (2 * Math.PI))) - Math.PI/2 - (randomIndex + 0.5) * arcSize;
  
  // Add a slight random offset within the slice so it doesn't land exactly in the middle every time
  const randomOffset = (Math.random() - 0.5) * (arcSize * 0.8);
  const finalTargetRotation = targetRotation + randomOffset;
  
  // Animation loop variables
  const spinDuration = 4500; // 4.5 seconds
  const startRotation = currentRotation;
  const startTime = performance.now();
  let lastTickAngle = currentRotation;
  
  function animateSpin(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / spinDuration, 1);
    
    // Cubic bezier easing out: 1 - (1 - t)^3
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    currentRotation = startRotation + (finalTargetRotation - startRotation) * easeOut;
    drawWheel();
    
    // Ticking logic: check if we crossed a slice boundary
    // Arrow is at -Math.PI/2
    const currentWheelAngleAtArrow = (-Math.PI/2 - currentRotation) % (2*Math.PI);
    const normalizedWheelAngleAtArrow = (currentWheelAngleAtArrow + 2*Math.PI) % (2*Math.PI);
    const currentSliceIndex = Math.floor(normalizedWheelAngleAtArrow / arcSize);
    
    const lastWheelAngleAtArrow = (-Math.PI/2 - lastTickAngle) % (2*Math.PI);
    const normalizedLastWheelAngleAtArrow = (lastWheelAngleAtArrow + 2*Math.PI) % (2*Math.PI);
    const lastSliceIndex = Math.floor(normalizedLastWheelAngleAtArrow / arcSize);
    
    if (currentSliceIndex !== lastSliceIndex) {
      playTick();
    }
    lastTickAngle = currentRotation;
    
    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      finishSpin(randomIndex);
    }
  }
  
  requestAnimationFrame(animateSpin);
}

function finishSpin(winnerIndex) {
  isSpinning = false;
  btnSpin.disabled = false;
  
  const winner = state.activePool[winnerIndex];
  currentWinnerId = winner.id;
  
  // Play Fanfare and Confetti
  playFanfare();
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: confettiColors
  });
  
  // Show Modal
  winnerNameEl.textContent = winner.name;
  modalWinner.classList.remove('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    document.getElementById('modal-content').classList.remove('scale-95');
    document.getElementById('modal-content').classList.add('scale-100');
  }, 10);
}

function closeModal() {
  document.getElementById('modal-content').classList.remove('scale-100');
  document.getElementById('modal-content').classList.add('scale-95');
  setTimeout(() => {
    modalWinner.classList.add('opacity-0', 'pointer-events-none');
    currentWinnerId = null;
  }, 300);
}

// --- Data Management Logic (Pool) ---
function addParticipant(name) {
  const trimmedName = name.trim();
  if (!trimmedName) return false;
  
  // Check duplicates in active pool
  if (state.activePool.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
    alert(`Nama "${trimmedName}" sudah ada di dalam daftar roda.`);
    return false;
  }
  
  state.activePool.push({
    id: generateId(),
    name: trimmedName,
    addedAt: new Date().toISOString()
  });
  
  saveState(state);
  renderPoolList();
  drawWheel();
  return true;
}

function removeParticipant(id) {
  state.activePool = state.activePool.filter(p => p.id !== id);
  saveState(state);
  renderPoolList();
  drawWheel();
}

function renderPoolList() {
  listParticipants.innerHTML = '';
  poolCount.textContent = state.activePool.length;
  
  if (state.activePool.length === 0) {
    listParticipants.innerHTML = '<li class="text-center text-slate-400 py-4 text-sm">Daftar kosong. Tambahkan peserta.</li>';
    return;
  }
  
  state.activePool.forEach(p => {
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm';
    
    const span = document.createElement('span');
    span.className = 'font-semibold text-slate-700 break-words flex-1 pr-2';
    span.textContent = p.name;
    
    const btn = document.createElement('button');
    btn.className = 'text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors';
    btn.innerHTML = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`;
    btn.onclick = () => removeParticipant(p.id);
    
    li.appendChild(span);
    li.appendChild(btn);
    listParticipants.appendChild(li);
  });
}

// --- History Logic ---
function confirmWinner() {
  if (!currentWinnerId) return;
  
  const winnerIndex = state.activePool.findIndex(p => p.id === currentWinnerId);
  if (winnerIndex > -1) {
    const winner = state.activePool[winnerIndex];
    // Move to history
    state.activePool.splice(winnerIndex, 1);
    
    const orderNum = state.winnerHistory.length + 1;
    state.winnerHistory.unshift({
      id: generateId(),
      name: winner.name,
      wonAt: new Date().toISOString(),
      orderLabel: `Terpilih #${orderNum}`
    });
    
    saveState(state);
    renderPoolList();
    renderHistoryList();
    drawWheel();
  }
  
  closeModal();
}

function restoreFromHistory(historyId) {
  const historyIndex = state.winnerHistory.findIndex(h => h.id === historyId);
  if (historyIndex > -1) {
    const historyItem = state.winnerHistory[historyIndex];
    
    // Check if name already in active pool
    if (state.activePool.some(p => p.name.toLowerCase() === historyItem.name.toLowerCase())) {
      alert(`Gagal memulihkan: Nama "${historyItem.name}" sudah ada di dalam daftar roda.`);
      return;
    }
    
    state.winnerHistory.splice(historyIndex, 1);
    state.activePool.push({
      id: generateId(),
      name: historyItem.name,
      addedAt: new Date().toISOString()
    });
    
    saveState(state);
    renderPoolList();
    renderHistoryList();
    drawWheel();
  }
}

function renderHistoryList() {
  listHistory.innerHTML = '';
  
  if (state.winnerHistory.length === 0) {
    listHistory.innerHTML = '<li class="text-center text-slate-400 py-6 text-sm">Belum ada riwayat pemenang.</li>';
    return;
  }
  
  state.winnerHistory.forEach(h => {
    const li = document.createElement('li');
    li.className = 'flex flex-col p-3 bg-white rounded-xl border border-slate-100 shadow-sm';
    
    const topRow = document.createElement('div');
    topRow.className = 'flex justify-between items-start mb-1';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'font-bold text-slate-800 text-lg';
    nameSpan.textContent = h.name;
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full';
    labelSpan.textContent = h.orderLabel;
    
    topRow.appendChild(nameSpan);
    topRow.appendChild(labelSpan);
    
    const bottomRow = document.createElement('div');
    bottomRow.className = 'flex justify-between items-end';
    
    const date = new Date(h.wonAt);
    const dateString = `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'text-xs text-slate-500';
    dateSpan.textContent = `Terpilih pada ${dateString}`;
    
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline';
    restoreBtn.textContent = 'Kembalikan';
    restoreBtn.onclick = () => restoreFromHistory(h.id);
    
    bottomRow.appendChild(dateSpan);
    bottomRow.appendChild(restoreBtn);
    
    li.appendChild(topRow);
    li.appendChild(bottomRow);
    listHistory.appendChild(li);
  });
}

// --- Data Management (Export/Import/Clear) ---
function exportData() {
  const dataStr = JSON.stringify(state, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'pilihacak-backup.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && Array.isArray(parsed.activePool)) {
        state = parsed;
        saveState(state);
        renderPoolList();
        renderHistoryList();
        drawWheel();
        updateSoundIcon();
        alert('Data berhasil dipulihkan!');
      } else {
        alert('Format file JSON tidak valid.');
      }
    } catch (err) {
      alert('Gagal membaca file JSON.');
      console.error(err);
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // reset input
}

function clearAllData() {
  const warn1 = confirm('Apakah Anda yakin ingin menghapus seluruh daftar peserta dan riwayat terpilih?');
  if (warn1) {
    const warn2 = confirm('Peringatan 2: Tindakan ini tidak dapat dibatalkan. Seluruh data di perangkat ini akan hilang. Tetap hapus permanen?');
    if (warn2) {
      localStorage.removeItem('pilihacak_state');
      // reload page to reset cleanly
      window.location.reload();
    }
  }
}

// --- Event Listeners ---
function setupEventListeners() {
  // Navigation
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetId = e.currentTarget.dataset.target;
      switchTab(targetId);
    });
  });

  // Sound Toggle
  btnSoundToggle.addEventListener('click', toggleSound);

  // Spin
  btnSpin.addEventListener('click', spinWheel);

  // Modal
  btnWinnerClose.addEventListener('click', closeModal);
  btnWinnerConfirm.addEventListener('click', confirmWinner);

  // Pool Input
  formAddParticipant.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = addParticipant(inputParticipantName.value);
    if (success) inputParticipantName.value = '';
  });

  // Bulk Input
  btnToggleBulk.addEventListener('click', () => {
    bulkInputContainer.classList.toggle('hidden');
  });

  btnAddBulk.addEventListener('click', () => {
    const lines = inputBulk.value.split('\n');
    let addedCount = 0;
    lines.forEach(line => {
      if (addParticipant(line)) {
        addedCount++;
      }
    });
    inputBulk.value = '';
    bulkInputContainer.classList.add('hidden');
    alert(`Berhasil menambahkan ${addedCount} peserta.`);
  });

  // Settings
  btnExport.addEventListener('click', exportData);
  inputImport.addEventListener('change', importData);
  btnClearData.addEventListener('click', clearAllData);
  
  // Resize handler for Canvas
  window.addEventListener('resize', () => {
    // Keep it perfectly aligned
    if (!isSpinning) drawWheel();
  });
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);
