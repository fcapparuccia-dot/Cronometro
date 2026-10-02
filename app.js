import { createStopwatch, formatDuration } from './src/stopwatch.js';
import { Capacitor, registerPlugin } from '@capacitor/core';

const AndroidControls = registerPlugin('AndroidControls');
const isNative = Capacitor.isNativePlatform();

const stopwatch = createStopwatch();
const clock = document.querySelector('#clock');
const display = document.querySelector('#display');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const resetButton = document.querySelector('#reset');
const keepAwakeInput = document.querySelector('#keep-awake');
const appShell = document.querySelector('.app-shell');
const lockHint = document.querySelector('#lock-hint');
const lockedStatus = document.querySelector('#locked-status');
let locked = false;
let lastTapAt = 0;
let wakeLock = null;
const clockFormatter = new Intl.DateTimeFormat('it-IT', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function refreshClock() {
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = clockFormatter.format(now);
}

function refreshDisplay() {
  display.textContent = formatDuration(stopwatch.getElapsedMs());
}

function setKeepScreenOn(enabled) {
  if (isNative) {
    AndroidControls.setKeepScreenOn({ enabled });
    return;
  }

  if (!enabled) {
    wakeLock?.release();
    wakeLock = null;
    return;
  }

  if (navigator.wakeLock && !wakeLock) {
    navigator.wakeLock.request('screen')
      .then((lock) => { wakeLock = lock; })
      .catch(() => {});
  }
}

startButton.addEventListener('click', () => {
  stopwatch.start();
  refreshDisplay();
});

pauseButton.addEventListener('click', () => {
  stopwatch.pause();
  refreshDisplay();
});

resetButton.addEventListener('click', () => {
  stopwatch.reset();
  refreshDisplay();
});

keepAwakeInput.addEventListener('change', () => {
  setKeepScreenOn(keepAwakeInput.checked);
});

function setLocked(nextLocked) {
  locked = nextLocked;
  appShell.classList.toggle('locked', locked);
  for (const button of [startButton, pauseButton, resetButton]) {
    button.disabled = locked;
  }
  keepAwakeInput.disabled = locked;
  lockedStatus.setAttribute('aria-hidden', String(!locked));
  lockHint.textContent = locked
    ? 'Doppio tocco per riattivare'
    : 'Doppio tocco per oscurare i comandi';

  if (isNative) {
    AndroidControls.setImmersive({ enabled: locked });
  }
}

appShell.addEventListener('pointerup', (event) => {
  if (!locked && event.target.closest('button, input, label')) {
    return;
  }

  const now = Date.now();
  if (now - lastTapAt < 350) {
    lastTapAt = 0;
    setLocked(!locked);
    return;
  }
  lastTapAt = now;
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && keepAwakeInput.checked) {
    setKeepScreenOn(true);
  }
});

setInterval(() => {
  if (stopwatch.isRunning()) {
    refreshDisplay();
  }
}, 50);

setInterval(refreshClock, 1000);
refreshClock();
refreshDisplay();
setKeepScreenOn(keepAwakeInput.checked);
