// 渲染进程脚本
const inputMin = document.getElementById('input-min');
const inputSec = document.getElementById('input-sec');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const display = document.getElementById('display');
const alarm = document.getElementById('alarm');
const clickThrough = document.getElementById('click-through');
const alwaysBtn = document.getElementById('always-btn');
const minBtn = document.getElementById('min-btn');
const closeBtn = document.getElementById('close-btn');
const hideBtn = document.getElementById('hide-btn');
const quitBtn = document.getElementById('quit-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const colorOptionButtons = document.querySelectorAll('.color-option');

let totalSeconds = 0;
let remaining = 0;
let timer = null;
let running = false;
let lastSet = 0;
let displayColor = '#ffffff';

// 根据平台打上不同的 class，方便做细微样式差异
const ua = navigator.userAgent || '';
if (/Mac OS X/.test(ua)) {
  document.body.classList.add('os-mac');
} else if (/Windows NT/.test(ua)) {
  document.body.classList.add('os-win');
} else {
  document.body.classList.add('os-linux');
}

function normalizeInputs() {
  let m = parseInt(inputMin.value || '0', 10);
  let s = parseInt(inputSec.value || '0', 10);

  if (isNaN(m)) m = 0;
  if (isNaN(s)) s = 0;

  if (s >= 60) {
    m += Math.floor(s / 60);
    s = s % 60;
  }

  if (s < 0) {
    const need = Math.ceil(Math.abs(s) / 60);
    if (m >= need) {
      m -= need;
      s += need * 60;
    } else {
      m = 0;
      s = 0;
    }
  }

  if (m < 0) m = 0;

  inputMin.value = String(m);
  inputSec.value = String(s);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function computeTotalSeconds() {
  const m = Math.max(0, parseInt(inputMin.value || '0', 10));
  const s = Math.max(0, parseInt(inputSec.value || '0', 10));
  totalSeconds = m * 60 + s;
  if (totalSeconds <= 0) {
    return 0;
  }
  return totalSeconds;
}

function updateDisplay() {
  display.textContent = formatTime(remaining);
}

function updateDisplaySize() {
  const base = Math.min(window.innerWidth, window.innerHeight);
  const size = Math.max(24, Math.min(160, Math.round(base * 0.35)));
  display.style.fontSize = `${size}px`;
}

function tick() {
  if (remaining <= 0) {
    stopTick();
    onFinish();
    return;
  }
  remaining -= 1;
  updateDisplay();
}

function startTick() {
  if (running) return;
  if (remaining <= 0) return;
  running = true;
  timer = setInterval(tick, 1000);
}

function stopTick() {
  running = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resetTick() {
  stopTick();
  remaining = lastSet;
  updateDisplay();
}

function onFinish() {
  // 播放提示音并闪烁
  try {
    alarm.currentTime = 0;
    alarm.play();
  } catch (e) {
  }
  // 简单的视觉提示
  display.style.transition = 'transform 0.08s';
  let i = 0;
  const intv = setInterval(() => {
    display.style.transform = (i % 2 === 0) ? 'scale(1.06)' : 'scale(1)';
    i++;
    if (i > 8) {
      clearInterval(intv);
      display.style.transform = 'scale(1)';
    }
  }, 160);
}

inputMin.addEventListener('change', (e) => {
  remaining = computeTotalSeconds();
  lastSet = remaining;

  updateDisplay();
});

inputSec.addEventListener('change', (e) => {
  normalizeInputs();
  remaining = computeTotalSeconds();
  lastSet = remaining;

  updateDisplay();
});

// 使用上下箭头时也实时进位 / 借位，并更新显示
inputSec.addEventListener('input', (e) => {
  normalizeInputs();
  remaining = computeTotalSeconds();
  lastSet = remaining;
  updateDisplay();
});

startBtn.addEventListener('click', () => {
  normalizeInputs();
  const m = Math.max(0, parseInt(inputMin.value || '0', 10));
  const s = Math.max(0, parseInt(inputSec.value || '0', 10));
  totalSeconds = m * 60 + s;
  if (totalSeconds <= 0) return;
  remaining = totalSeconds;
  lastSet = totalSeconds;
  updateDisplay();
  startTick();
});

pauseBtn.addEventListener('click', () => {
  if (running)
    stopTick();
  else
    startTick();
});

resetBtn.addEventListener('click', resetTick);

clickThrough.addEventListener('change', (e) => {
  if (window.electronAPI && window.electronAPI.setIgnoreMouse) {
    window.electronAPI.setIgnoreMouse(e.target.checked);
  }
});

alwaysBtn.addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.windowAction) {
    window.electronAPI.windowAction('toggle-always-on-top');
  }
});

minBtn.addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.windowAction) {
    window.electronAPI.windowAction('minimize');
  }
});

closeBtn.addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.windowAction) {
    window.electronAPI.windowAction('close');
  }
});

hideBtn.addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.windowAction) {
    window.electronAPI.windowAction('close');
  }
});

quitBtn.addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.windowAction) {
    window.electronAPI.windowAction('quit');
  }
});

// 打开 / 关闭设置页面
settingsBtn.addEventListener('click', () => {
  settingsOverlay.classList.remove('hidden');
});

settingsCloseBtn.addEventListener('click', () => {
  settingsOverlay.classList.add('hidden');
});

// 点击遮罩空白处也关闭
settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) {
    settingsOverlay.classList.add('hidden');
  }
});

// 颜色选择
function applyDisplayColor(color) {
  displayColor = color;
  display.style.color = color;
  try {
    localStorage.setItem('countdown-color', color);
  } catch (e) {
  }
}

colorOptionButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const color = btn.getAttribute('data-color');
    applyDisplayColor(color);
    colorOptionButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// 初始化颜色
try {
  const saved = localStorage.getItem('countdown-color');
  if (saved) {
    applyDisplayColor(saved);
  } else {
    applyDisplayColor('#ffffff');
  }
} catch (e) {
  applyDisplayColor('#ffffff');
}

colorOptionButtons.forEach((btn) => {
  if (btn.getAttribute('data-color') === displayColor) {
    btn.classList.add('active');
  }
});

// 初始显示
remaining = 0;
updateDisplay();
updateDisplaySize();
window.addEventListener('resize', updateDisplaySize);
