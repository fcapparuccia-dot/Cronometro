import test from 'node:test';
import assert from 'node:assert/strict';

import { createElapsedAlert, createStopwatch, formatDuration } from '../src/stopwatch.js';

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

test('stopwatch can start a period from a nonzero elapsed time', () => {
  let now = 0;
  const stopwatch = createStopwatch(0, () => now);

  stopwatch.reset(35 * 60_000);
  stopwatch.start();
  now += 1_000;

  assert.equal(stopwatch.getElapsedMs(), 35 * 60_000 + 1_000);
});

test('elapsed alert fires once when its target is reached', () => {
  let alerts = 0;
  const alert = createElapsedAlert(70 * 60_000, () => { alerts += 1; });

  assert.equal(alert.check(69 * 60_000), false);
  assert.equal(alert.check(70 * 60_000), true);
  assert.equal(alert.check(71 * 60_000), false);
  assert.equal(alerts, 1);
});
