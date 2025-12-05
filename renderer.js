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

let totalSeconds = 0;
let remaining = 0;
let timer = null;
let running = false;
let lastSet = 0;

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
  remaining = computeTotalSeconds();
  lastSet = remaining;

  updateDisplay();
});

startBtn.addEventListener('click', () => {
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

// 初始显示
remaining = 0;
updateDisplay();
