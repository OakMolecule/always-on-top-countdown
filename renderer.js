// 渲染进程脚本
const inputMin = document.getElementById('input-min');
const inputSec = document.getElementById('input-sec');
const toggleBtn = document.getElementById('toggle-btn');
const display = document.getElementById('display');
const alarm = document.getElementById('alarm');
const clickThrough = document.getElementById('click-through');
const showQuitBtn = document.getElementById('show-quit-btn');
const alwaysBtn = document.getElementById('always-btn');
const minBtn = document.getElementById('min-btn');
const quitBtn = document.getElementById('quit-btn');
const resetBtnMain = document.getElementById('reset-btn-main');
const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const colorOptionButtons = document.querySelectorAll('.color-option');
const bgOpacitySlider = document.getElementById('bg-opacity');

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

function updateToggleButton() {
  if (running) {
    // 正在运行，显示暂停
    toggleBtn.textContent = '⏸';
    toggleBtn.title = '暂停';
    resetBtnMain.hidden = true;
  } else if (remaining > 0) {
    // 有时间但未运行，显示继续/开始
    toggleBtn.textContent = '▶';
    toggleBtn.title = remaining === lastSet ? '开始' : '继续';
    resetBtnMain.hidden = false;
  } else {
    // 没有时间，显示开始
    toggleBtn.textContent = '▶';
    toggleBtn.title = '开始';
    resetBtnMain.hidden = false;
  }
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
  updateToggleButton();
}

function stopTick() {
  running = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  updateToggleButton();
}

function resetTick() {
  stopTick();
  remaining = lastSet;
  updateDisplay();
  updateToggleButton();
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
  updateToggleButton();
});

inputSec.addEventListener('change', (e) => {
  normalizeInputs();
  remaining = computeTotalSeconds();
  lastSet = remaining;
  updateDisplay();
  updateToggleButton();
});

// 使用上下箭头时也实时进位 / 借位，并更新显示
inputSec.addEventListener('input', (e) => {
  normalizeInputs();
  remaining = computeTotalSeconds();
  lastSet = remaining;
  updateDisplay();
  updateToggleButton();
});

// 统一的开始/暂停/继续按钮
toggleBtn.addEventListener('click', () => {
  if (running) {
    // 正在运行 -> 暂停
    stopTick();
  } else {
    // 未运行 -> 开始/继续
    if (remaining <= 0) {
      // 没有时间，从输入框读取
      normalizeInputs();
      const m = Math.max(0, parseInt(inputMin.value || '0', 10));
      const s = Math.max(0, parseInt(inputSec.value || '0', 10));
      totalSeconds = m * 60 + s;
      if (totalSeconds <= 0) return;
      remaining = totalSeconds;
      lastSet = totalSeconds;
      updateDisplay();
    }
    startTick();
  }
});

clickThrough.addEventListener('change', (e) => {
  if (window.electronAPI && window.electronAPI.setIgnoreMouse) {
    window.electronAPI.setIgnoreMouse(e.target.checked);
  }
});

showQuitBtn.addEventListener('change', (e) => {
  if (e.target.checked) {
    quitBtn.style.display = '';
    minBtn.style.display = '';
    alwaysBtn.style.display = '';
  } else {
    quitBtn.style.display = 'none';
    minBtn.style.display = 'none';
    alwaysBtn.style.display = 'none';
  }

  try {
    localStorage.setItem('show-quit-btn', e.target.checked ? '1' : '0');
  } catch (err) {
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

quitBtn.addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.windowAction) {
    window.electronAPI.windowAction('quit');
  }
});

resetBtnMain.addEventListener('click', resetTick);

// 打开 / 关闭设置页面
settingsBtn.addEventListener('click', () => {
  settingsOverlay.classList.remove('hidden');
});

settingsCloseBtn.addEventListener('click', () => {
  settingsOverlay.classList.add('hidden');
});

// 点击遮罩空白处也关闭（但不包括设置卡片）
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

// 背景透明度控制
const appEl = document.getElementById('app');
function applyBgOpacity(value) {
  const alpha = value / 100;
  const strongAlpha = alpha;
  const weakAlpha = Math.max(0.2, alpha - 0.2);
  appEl.style.background = `linear-gradient(180deg, rgba(0, 0, 0, ${
      strongAlpha}), rgba(0, 0, 0, ${weakAlpha}))`;
  try {
    localStorage.setItem('bg-opacity', value);
  } catch (e) {
  }
}

bgOpacitySlider.addEventListener('input', (e) => {
  applyBgOpacity(e.target.value);
});

// 初始化背景透明度
try {
  const savedOpacity = localStorage.getItem('bg-opacity');
  if (savedOpacity) {
    bgOpacitySlider.value = savedOpacity;
    applyBgOpacity(savedOpacity);
  } else {
    applyBgOpacity(55);
  }
} catch (e) {
  applyBgOpacity(55);
}

// 初始化关闭按钮显示状态
try {
  const savedShowQuit = localStorage.getItem('show-quit-btn');
  if (savedShowQuit === '0') {
    showQuitBtn.checked = false;
    quitBtn.style.display = 'none';
  }
} catch (e) {
}

// 初始显示 - 默认5分钟
inputMin.value = '5';
inputSec.value = '0';
remaining = 300;  // 5分钟 = 300秒
lastSet = 300;
updateDisplay();
updateDisplaySize();
updateToggleButton();
window.addEventListener('resize', updateDisplaySize);
