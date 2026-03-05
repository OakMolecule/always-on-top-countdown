// ── DOM refs ─────────────────────────────────────────────────────────────────
const display        = document.getElementById('display');
const progressBar    = document.getElementById('progress-bar');
const progressTrack  = document.getElementById('progress-track-wrapper');
const toggleBtn      = document.getElementById('toggle-btn');
const resetBtnMain   = document.getElementById('reset-btn-main');
const settingsBtn    = document.getElementById('settings-btn');
const quitBtn        = document.getElementById('quit-btn');
const alarm          = document.getElementById('alarm');
const appEl          = document.getElementById('app');

// Time panel
const timePanel      = document.getElementById('time-panel');
const inputMin       = document.getElementById('input-min');
const inputSec       = document.getElementById('input-sec');
const applyTimeBtn   = document.getElementById('apply-time-btn');
const cancelTimeBtn  = document.getElementById('cancel-time-btn');

// Settings panel
const settingsPanel      = document.getElementById('settings-panel');
const bgOpacitySlider    = document.getElementById('bg-opacity');
const bgOpacityValueEl   = document.getElementById('bg-opacity-value');
const colorOptionBtns    = document.querySelectorAll('#default-colors .color-option');
const customColorPicker  = document.getElementById('custom-color-picker');
const customColorHex     = document.getElementById('custom-color-hex');
const customColorsSection = document.getElementById('custom-colors-section');
const customColorsList   = document.getElementById('custom-colors-list');
const addCustomColorBtn  = document.getElementById('add-custom-color-btn');
const presetListEl       = document.getElementById('preset-list');
const addPresetForm      = document.getElementById('add-preset-form');
const presetInputMin     = document.getElementById('preset-input-min');
const presetInputSec     = document.getElementById('preset-input-sec');
const savePresetBtn      = document.getElementById('save-preset-btn');
const cancelPresetBtn    = document.getElementById('cancel-preset-btn');
const showProgressToggle = document.getElementById('show-progress-toggle');
const alwaysOnTopToggle  = document.getElementById('always-on-top-toggle');
const quitAppBtn         = document.getElementById('quit-app-btn');
const settingsCloseBtn   = document.getElementById('settings-close-btn');
const openDevtoolsBtn    = document.getElementById('open-devtools-btn');
const appVersionEl       = document.getElementById('app-version');

// ── State ─────────────────────────────────────────────────────────────────────
let timer         = null;
let running       = false;
let remaining     = 300;
let lastSet       = 300;
let displayColor  = '#ffffff';
let customColors  = [];
let customPresets = [60, 300, 600, 900, 1800, 3600];

// ── OS detection ──────────────────────────────────────────────────────────────
const ua = navigator.userAgent || '';
if (/Mac OS X/.test(ua))        document.body.classList.add('os-mac');
else if (/Windows NT/.test(ua)) document.body.classList.add('os-win');
else                             document.body.classList.add('os-linux');

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function isValidHex(v) {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

// ── Responsive font size (driven by window dimensions) ───────────────────────
function updateDisplaySize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const byWidth  = Math.round(w * 0.22);
  const byHeight = Math.round(h * 0.28);
  const size = Math.max(38, Math.min(byWidth, byHeight, 130));
  display.style.fontSize = `${size}px`;

  // Scale primary control buttons
  const btnSize = Math.max(20, Math.min(Math.round(w * 0.14), Math.round(h * 0.16), 30));
  const btns = document.querySelectorAll('.primary-controls .icon-btn');
  btns.forEach(btn => {
    btn.style.width = `${btnSize}px`;
    btn.style.height = `${btnSize}px`;
    btn.style.fontSize = `${Math.round(btnSize * 0.45)}px`;
    btn.style.borderRadius = `${Math.max(6, Math.round(btnSize * 0.2))}px`;
  });
}

window.addEventListener('resize', updateDisplaySize);

// ── Timer core ────────────────────────────────────────────────────────────────
function updateUI() {
  display.textContent = formatTime(remaining);

  const pct = lastSet > 0 ? (remaining / lastSet) * 100 : 0;
  progressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;

  const warn = remaining > 0 && remaining < 60;
  progressBar.classList.toggle('warning', warn);

  if (warn) {
    progressBar.style.background = '';
  } else {
    progressBar.style.background = displayColor;
  }

  if (warn) {
    display.classList.add('warning');
    display.style.color = '';
  } else {
    display.classList.remove('warning');
    display.style.color = displayColor;
  }

  if (running) {
    toggleBtn.textContent = '⏸';
    toggleBtn.title = '暂停';
    toggleBtn.disabled = false;
    toggleBtn.classList.remove('btn-play');
    quitBtn.classList.remove('icon-btn-quit');
  } else {
    toggleBtn.textContent = '▶';
    toggleBtn.title = remaining === lastSet ? '开始' : '继续';
    toggleBtn.disabled = remaining <= 0;
    toggleBtn.classList.add('btn-play');
    quitBtn.classList.add('icon-btn-quit');
  }
}

function stopTick() {
  running = false;
  if (timer) { clearInterval(timer); timer = null; }
  updateUI();
}

function onFinish() {
  stopTick();
  remaining = 0;
  updateUI();
  try { alarm.currentTime = 0; alarm.play(); } catch (_) {}
}

function tick() {
  if (remaining <= 0) { onFinish(); return; }
  remaining -= 1;
  if (remaining <= 0) { onFinish(); return; }
  updateUI();
}

function startTick() {
  if (running || remaining <= 0) return;
  running = true;
  timer = setInterval(tick, 1000);
  updateUI();
}

function resetTick() {
  stopTick();
  remaining = lastSet;
  updateUI();
}

toggleBtn.addEventListener('click', () => running ? stopTick() : startTick());
resetBtnMain.addEventListener('click', resetTick);

// ── Panel management ──────────────────────────────────────────────────────────
function closeAllPanels(restore = true) {
  const wasOpen = !timePanel.classList.contains('hidden') || !settingsPanel.classList.contains('hidden');
  timePanel.classList.add('hidden');
  settingsPanel.classList.add('hidden');
  appEl.style.overflowY = 'hidden';
  if (wasOpen && restore) {
    window.electronAPI?.setWindowSize?.({ isExpanding: false });
  }
}

function openTimePanel() {
  closeAllPanels(false);
  inputMin.value = String(Math.floor(lastSet / 60));
  inputSec.value = String(lastSet % 60);
  timePanel.classList.remove('hidden');
  appEl.style.overflowY = 'auto';
  window.electronAPI?.setWindowSize?.({ width: 340, height: 380, isExpanding: true });
}

function openSettingsPanel() {
  closeAllPanels(false);
  settingsPanel.classList.remove('hidden');
  appEl.style.overflowY = 'auto';
  window.electronAPI?.setWindowSize?.({ width: 380, height: 650, isExpanding: true });
}

display.addEventListener('click', () => {
  timePanel.classList.contains('hidden') ? openTimePanel() : closeAllPanels();
});

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.contains('hidden') ? openSettingsPanel() : closeAllPanels();
});

settingsCloseBtn.addEventListener('click', closeAllPanels);
cancelTimeBtn.addEventListener('click', closeAllPanels);

function applyTimeFromInputs() {
  const min   = Math.max(0, parseInt(inputMin.value || '0', 10) || 0);
  const sec   = Math.max(0, Math.min(59, parseInt(inputSec.value || '0', 10) || 0));
  const total = min * 60 + sec;
  if (total <= 0) return;
  stopTick();
  lastSet   = total;
  remaining = total;
  saveLastSetTime(total);
  updateUI();
  closeAllPanels();
}

applyTimeBtn.addEventListener('click', applyTimeFromInputs);

// Enter key confirms time panel
[inputMin, inputSec].forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter') applyTimeFromInputs(); });
});

// ── Color ─────────────────────────────────────────────────────────────────────
function saveCustomColors() {
  try { localStorage.setItem('custom-colors', JSON.stringify(customColors)); } catch (_) {}
}

function renderCustomColors() {
  customColorsList.innerHTML = '';
  customColorsSection.classList.toggle('hidden', customColors.length === 0);
  addCustomColorBtn.disabled = customColors.length >= 4;
  customColors.forEach((hex) => {
    const swatch = document.createElement('div');
    swatch.className = 'custom-color-swatch';
    swatch.dataset.color = hex;
    swatch.style.background = hex;
    swatch.classList.toggle('active', hex.toLowerCase() === displayColor);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'custom-color-swatch-del';
    delBtn.title = '删除';
    delBtn.textContent = '×';
    delBtn.setAttribute('aria-label', '删除');

    swatch.appendChild(delBtn);

    swatch.addEventListener('click', (e) => {
      if (e.target === delBtn) {
        e.stopPropagation();
        removeCustomColor(hex);
      } else {
        applyDisplayColor(hex);
      }
    });

    customColorsList.appendChild(swatch);
  });
}

function addCustomColor() {
  const color = displayColor.toLowerCase();
  if (!isValidHex(color)) return;
  if (customColors.includes(color)) return;
  if (customColors.length >= 4) return;
  customColors.push(color);
  saveCustomColors();
  renderCustomColors();
}

function removeCustomColor(color) {
  const normalized = color.toLowerCase();
  customColors = customColors.filter((c) => c !== normalized);
  saveCustomColors();
  renderCustomColors();
}

function applyDisplayColor(color) {
  if (!isValidHex(color)) return;
  displayColor = color.toLowerCase();
  customColorPicker.value = displayColor;
  customColorHex.value    = displayColor;
  colorOptionBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color.toLowerCase() === displayColor);
  });
  customColorsList.querySelectorAll('.custom-color-swatch').forEach((sw) => {
    sw.classList.toggle('active', sw.dataset.color.toLowerCase() === displayColor);
  });
  if (!display.classList.contains('warning')) {
    display.style.color = displayColor;
  }
  const warn = remaining > 0 && remaining < 60;
  if (!warn) progressBar.style.background = displayColor;
  try { localStorage.setItem('countdown-color', displayColor); } catch (_) {}
}

colorOptionBtns.forEach(btn => btn.addEventListener('click', () => applyDisplayColor(btn.dataset.color)));

customColorPicker.addEventListener('input', e => applyDisplayColor(e.target.value));

customColorHex.addEventListener('change', e => {
  const v = e.target.value.trim();
  if (isValidHex(v)) applyDisplayColor(v);
  else customColorHex.value = displayColor;
});

addCustomColorBtn.addEventListener('click', addCustomColor);

// ── Background opacity ────────────────────────────────────────────────────────
function applyBgOpacity(value) {
  const safe  = Math.max(0, Math.min(100, Number(value)));
  const a     = safe / 100;
  const aEdge = Math.max(0, a - 0.15);
  appEl.style.background = `linear-gradient(180deg, rgba(15,23,42,${a}), rgba(15,23,42,${aEdge}))`;
  bgOpacitySlider.value        = String(safe);
  bgOpacityValueEl.textContent = `${safe}%`;
  try { localStorage.setItem('bg-opacity', String(safe)); } catch (_) {}
}

bgOpacitySlider.addEventListener('input', e => applyBgOpacity(e.target.value));

// ── Custom presets ────────────────────────────────────────────────────────────
function saveLastSetTime(sec) {
  try { localStorage.setItem('last-set-time', String(sec)); } catch (_) {}
}

function savePresets() {
  try { localStorage.setItem('custom-presets', JSON.stringify(customPresets)); } catch (_) {}
}

function renderPresets() {
  presetListEl.innerHTML = '';
  addPresetForm.classList.add('hidden');

  customPresets.forEach((sec, idx) => {
    const chip     = document.createElement('div');
    chip.className = 'preset-chip';

    const timeSpan = document.createElement('span');
    timeSpan.textContent = formatTime(sec);

    const delBtn      = document.createElement('button');
    delBtn.className  = 'preset-chip-del';
    delBtn.textContent = '×';
    delBtn.title       = '删除';

    chip.appendChild(timeSpan);
    chip.appendChild(delBtn);

    chip.addEventListener('click', e => {
      if (e.target === delBtn) {
        customPresets.splice(idx, 1);
        savePresets();
        renderPresets();
      } else {
        stopTick();
        lastSet   = sec;
        remaining = sec;
        saveLastSetTime(sec);
        updateUI();
        closeAllPanels();
      }
    });

    presetListEl.appendChild(chip);
  });

  if (customPresets.length < 6) {
    const addBtn      = document.createElement('button');
    addBtn.className  = 'preset-add-btn';
    addBtn.id         = 'preset-add-chip';
    addBtn.textContent = '+ 添加';
    addBtn.addEventListener('click', () => {
      addPresetForm.classList.remove('hidden');
      const chip = document.getElementById('preset-add-chip');
      if (chip) chip.style.display = 'none';
      presetInputMin.value = '';
      presetInputSec.value = '';
      presetInputMin.focus();
    });
    presetListEl.appendChild(addBtn);
  }
}

function saveNewPreset() {
  const min   = Math.max(0, parseInt(presetInputMin.value || '0', 10) || 0);
  const sec   = Math.max(0, Math.min(59, parseInt(presetInputSec.value || '0', 10) || 0));
  const total = min * 60 + sec;
  if (total > 0 && customPresets.length < 6) {
    customPresets.push(total);
    savePresets();
  }
  renderPresets();
}

savePresetBtn.addEventListener('click', saveNewPreset);
cancelPresetBtn.addEventListener('click', renderPresets);
presetInputSec.addEventListener('keydown', e => { if (e.key === 'Enter') saveNewPreset(); });

// ── Window and App controls ───────────────────────────────────────────────────
showProgressToggle.addEventListener('change', e => {
  const show = e.target.checked;
  if (show) progressTrack.classList.remove('hidden');
  else progressTrack.classList.add('hidden');
  try { localStorage.setItem('show-progress', show ? '1' : '0'); } catch (_) {}
});

alwaysOnTopToggle.addEventListener('change', e => {
  const onTop = e.target.checked;
  window.electronAPI?.windowAction?.('set-always-on-top', onTop);
  try { localStorage.setItem('always-on-top', onTop ? '1' : '0'); } catch (_) {}
});

quitAppBtn.addEventListener('click', () => window.electronAPI?.windowAction?.('quit'));
quitBtn.addEventListener('click', () => window.electronAPI?.windowAction?.('quit'));

openDevtoolsBtn.addEventListener('click', () => window.electronAPI?.openDevTools?.());

// ── Init ──────────────────────────────────────────────────────────────────────
try {
  const c = localStorage.getItem('countdown-color');
  applyDisplayColor(c && isValidHex(c) ? c : '#ffffff');
} catch (_) { applyDisplayColor('#ffffff'); }

try {
  const savedColors = localStorage.getItem('custom-colors');
  if (savedColors) {
    const arr = JSON.parse(savedColors);
    if (Array.isArray(arr)) {
      customColors = arr.filter((c) => typeof c === 'string' && isValidHex(c)).slice(0, 4);
      if (customColors.length !== arr.length) saveCustomColors();
    }
  }
} catch (_) {}
renderCustomColors();

try {
  const o = localStorage.getItem('bg-opacity');
  applyBgOpacity(o !== null ? o : 95);
} catch (_) { applyBgOpacity(95); }

try {
  const sp = localStorage.getItem('show-progress');
  const showProgress = sp !== '0'; // default true
  showProgressToggle.checked = showProgress;
  if (!showProgress) progressTrack.classList.add('hidden');
} catch (_) {}

try {
  const aot = localStorage.getItem('always-on-top');
  const alwaysOnTop = aot !== '0'; // default true
  alwaysOnTopToggle.checked = alwaysOnTop;
  window.electronAPI?.windowAction?.('set-always-on-top', alwaysOnTop);
} catch (_) {}

try {
  const saved = localStorage.getItem('custom-presets');
  if (saved) {
    const arr = JSON.parse(saved);
    if (Array.isArray(arr) && arr.length > 0) customPresets = arr.slice(0, 6);
  }
} catch (_) {}

try {
  const savedTime = localStorage.getItem('last-set-time');
  const sec = savedTime !== null ? Math.max(1, parseInt(savedTime, 10) || 300) : 300;
  lastSet = sec;
  remaining = sec;
} catch (_) {}

renderPresets();
updateDisplaySize();
updateUI();

window.electronAPI?.getVersion?.().then((v) => {
  if (appVersionEl && v) appVersionEl.textContent = `v${v}`;
}).catch(() => {});
