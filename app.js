import { createElapsedAlert, createStopwatch, formatDuration } from './src/stopwatch.js';
import { Capacitor, registerPlugin } from '@capacitor/core';

const AndroidControls = registerPlugin('AndroidControls');
const isNative = Capacitor.isNativePlatform();

const stopwatch = createStopwatch();
const clock = document.querySelector('#clock');
const display = document.querySelector('#display');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const resetButton = document.querySelector('#reset');
const periodDurationInput = document.querySelector('#period-duration');
const firstPeriodButton = document.querySelector('#first-period');
const secondPeriodButton = document.querySelector('#second-period');
const periodIndicator = document.querySelector('#period-indicator');
const periodNumber = document.querySelector('#period-number');
const periodName = document.querySelector('#period-name');
const keepAwakeInput = document.querySelector('#keep-awake');
const appShell = document.querySelector('.app-shell');
const lockHint = document.querySelector('#lock-hint');
const lockedStatus = document.querySelector('#locked-status');
let locked = false;
let lastTapAt = 0;
let wakeLock = null;
let periodMode = null;
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

function vibrateTwice() {
  if (isNative) {
    AndroidControls.vibrate().catch((error) => {
      console.error('Impossibile avviare la vibrazione:', error);
    });
    return;
  }

  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate([100, 100, 100]);
  } else {
    console.warn('La vibrazione non è supportata da questo dispositivo.');
  }
}

function refreshPeriodIndicator() {
  periodIndicator.hidden = !periodMode;
  if (periodMode) {
    periodNumber.textContent = periodMode.number;
    periodName.textContent = 'TEMPO';
  }
}

function refreshControls() {
  const running = stopwatch.isRunning();
  for (const button of [startButton, pauseButton, resetButton]) {
    button.disabled = locked;
  }
  for (const button of [firstPeriodButton, secondPeriodButton]) {
    button.disabled = locked || running;
  }
  periodDurationInput.disabled = locked || running;
  keepAwakeInput.disabled = locked;
}

function startPeriod(number) {
  const durationMinutes = Number(periodDurationInput.value);
  if (!periodDurationInput.reportValidity()) {
    return;
  }

  const durationMs = durationMinutes * 60_000;
  const initialElapsedMs = number === '2°' ? durationMs : 0;
  const alertAtMs = number === '2°' ? durationMs * 2 : durationMs;

  stopwatch.reset(initialElapsedMs);
  periodMode = {
    number,
    alert: createElapsedAlert(alertAtMs, vibrateTwice),
  };
  stopwatch.start();
  refreshPeriodIndicator();
  refreshDisplay();
  refreshControls();
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
  refreshControls();
});

pauseButton.addEventListener('click', () => {
  stopwatch.pause();
  refreshDisplay();
  refreshControls();
});

resetButton.addEventListener('click', () => {
  stopwatch.reset();
  periodMode = null;
  refreshPeriodIndicator();
  refreshDisplay();
  refreshControls();
});

firstPeriodButton.addEventListener('click', () => startPeriod('1°'));
secondPeriodButton.addEventListener('click', () => startPeriod('2°'));

keepAwakeInput.addEventListener('change', () => {
  setKeepScreenOn(keepAwakeInput.checked);
});

function setLocked(nextLocked) {
  locked = nextLocked;
  appShell.classList.toggle('locked', locked);
  refreshControls();
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
    const elapsedMs = stopwatch.getElapsedMs();
    display.textContent = formatDuration(elapsedMs);
    periodMode?.alert.check(elapsedMs);
  }
}, 50);

setInterval(refreshClock, 1000);
refreshClock();
refreshDisplay();
refreshPeriodIndicator();
refreshControls();
setKeepScreenOn(keepAwakeInput.checked);
