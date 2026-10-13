import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schedule, preview, newCardState, retrievability, intervalDays, AGAIN, HARD, GOOD, EASY, DAY, MIN } from '../src/scheduler.js';

const T0 = Date.UTC(2026, 0, 1, 12);
const fresh = () => ({ id: 'x', ...newCardState() });

test('retrievability is 90% after exactly S days', () => {
  assert.ok(Math.abs(retrievability(10, 10) - 0.9) < 1e-9);
  assert.equal(intervalDays(10, 0.9), 10);
  assert.ok(intervalDays(10, 0.8) > intervalDays(10, 0.9));
});

test('new card: Again/Good go through learning steps, Easy graduates', () => {
  const a = schedule(fresh(), AGAIN, T0);
  assert.equal(a.state, 'learning');
  assert.equal(a.due - T0, 1 * MIN);
  const g = schedule(fresh(), GOOD, T0);
  assert.equal(g.due - T0, 10 * MIN);
  const e = schedule(fresh(), EASY, T0);
  assert.equal(e.state, 'review');
  assert.ok(e.due - T0 >= 10 * DAY);
});

test('learning card graduates on Good after last step', () => {
  let c = schedule(fresh(), GOOD, T0);
  c = schedule(c, GOOD, T0 + 10 * MIN);
  assert.equal(c.state, 'review');
  assert.ok(c.due - (T0 + 10 * MIN) >= 2 * DAY);
});

test('successful reviews grow intervals; Again lapses and shrinks stability', () => {
  let c = schedule(fresh(), EASY, T0);
  let now = T0;
  let last = 0;
  for (let i = 0; i < 4; i++) {
    now = c.due;
    c = schedule(c, GOOD, now);
    const ivl = c.due - now;
    assert.ok(ivl > last, `interval should grow (${ivl} > ${last})`);
    last = ivl;
  }
  const s = c.stability;
  now = c.due;
  c = schedule(c, AGAIN, now);
  assert.equal(c.state, 'relearning');
  assert.equal(c.lapses, 1);
  assert.ok(c.stability < s);
  assert.equal(c.due - now, 10 * MIN);
  c = schedule(c, GOOD, now + 10 * MIN);
  assert.equal(c.state, 'review');
});

test('review buttons are ordered Again < Hard < Good < Easy and preview matches', () => {
  let c = schedule(fresh(), GOOD, T0);
  c = schedule(c, GOOD, T0 + 10 * MIN);
  const now = c.due + DAY;
  const pv = preview(c, now);
  assert.ok(pv[AGAIN] < pv[HARD] && pv[HARD] < pv[GOOD] && pv[GOOD] < pv[EASY]);
  for (const g of [AGAIN, HARD, GOOD, EASY]) assert.equal(schedule(c, g, now).due - now, pv[g]);
});

test('difficulty stays within 1..10', () => {
  let c = schedule(fresh(), AGAIN, T0);
  let now = T0;
  for (let i = 0; i < 30; i++) { now += 2 * DAY; c = schedule(c, AGAIN, now); }
  assert.ok(c.difficulty >= 1 && c.difficulty <= 10);
  for (let i = 0; i < 30; i++) { now = Math.max(now + MIN, c.due); c = schedule(c, EASY, now); }
  assert.ok(c.difficulty >= 1 && c.difficulty <= 10);
});

test('does not mutate the input card', () => {
  const c = fresh();
  const copy = { ...c };
  schedule(c, GOOD, T0);
  assert.deepEqual(c, copy);
});
