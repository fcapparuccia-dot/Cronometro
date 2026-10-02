import test from 'node:test';
import assert from 'node:assert/strict';

import { createStopwatch, formatDuration } from '../src/stopwatch.js';

test('formatDuration renders zero correctly', () => {
  assert.equal(formatDuration(0), '00:00:00');
});

test('formatDuration renders minutes and seconds', () => {
  assert.equal(formatDuration(1_234), '00:01:23');
});

test('formatDuration supports hours', () => {
  assert.equal(formatDuration(3_600_000 + 60_000 + 1_000 + 42), '01:01:01:04');
});

test('stopwatch accumulates elapsed time while running', () => {
  let now = 0;
  const stopwatch = createStopwatch(0, () => now);

  stopwatch.start();
  now += 1_250;
  assert.equal(stopwatch.getElapsedMs(), 1_250);

  stopwatch.pause();
  assert.equal(stopwatch.getElapsedMs(), 1_250);

  now += 500;
  assert.equal(stopwatch.getElapsedMs(), 1_250);

  stopwatch.start();
  now += 2_000;
  assert.equal(stopwatch.getElapsedMs(), 3_250);
});
