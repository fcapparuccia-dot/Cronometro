export function createStopwatch(initialElapsedMs = 0, nowFn = Date.now) {
  let elapsedMs = initialElapsedMs;
  let running = false;
  let startedAtMs = 0;

  function getElapsedMs() {
    if (!running) {
      return elapsedMs;
    }

    return elapsedMs + (nowFn() - startedAtMs);
  }

  function start() {
    if (running) {
      return;
    }

    running = true;
    startedAtMs = nowFn();
  }

  function pause() {
    if (!running) {
      return;
    }

    elapsedMs = getElapsedMs();
    running = false;
    startedAtMs = 0;
  }

  function reset() {
    elapsedMs = 0;
    running = false;
    startedAtMs = 0;
  }

  function recordLap() {
    return getElapsedMs();
  }

  return {
    start,
    pause,
    reset,
    getElapsedMs,
    recordLap,
    isRunning: () => running,
  };
}

export function formatDuration(durationMs) {
  const totalMs = Math.max(0, Math.floor(durationMs));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1_000);
  const centiseconds = Math.floor((totalMs % 1_000) / 10);

  const formattedBase = [
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
    String(centiseconds).padStart(2, '0'),
  ].join(':');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${formattedBase}`;
  }

  return `${formattedBase}`;
}
