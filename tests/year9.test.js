// Year 9 revision app: content integrity, exact answer checking, and independent
// re-calculation of generated answers (the generators must never teach a wrong answer).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkTyped, parseExact, sameNumber, roundSF, shiftDecimal, toDecimal } from '../year9/js/engine.js';
import { MATHS, _test as M } from '../year9/js/content-maths.js';
import { SCIENCE, _test as S } from '../year9/js/content-science.js';
import { ENGLISH, CHAPTERS, _test as E } from '../year9/js/content-english.js';
import { SIMS } from '../year9/js/sims.js';
import { GEOGRAPHY, _test as G } from '../year9/js/content-geography.js';
import { HISTORY, EVENTS, _test as H } from '../year9/js/content-history.js';

const RUNS = 1500;
const strip = (h) => String(h).replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '').replace(/−/g, '-').replace(/ /g, '');
const nums = (h) => strip(h).match(/-?\d+(?:\.\d+)?/g).map(Number);

test('answer checking is exact and forgiving about format', () => {
  assert.equal(checkTyped({ type: 'num', answer: '0.125' }, '1/8'), 'correct');
  assert.equal(checkTyped({ type: 'num', answer: '3.5' }, '3,5'), 'correct');
  assert.equal(checkTyped({ type: 'num', answer: '1000' }, '1,000'), 'correct');
  assert.equal(checkTyped({ type: 'num', answer: '54000000' }, '5.4 × 10^7'), 'correct');
  assert.equal(checkTyped({ type: 'num', answer: '0.3' }, '0.30000000000000004'), 'wrong');
  assert.equal(checkTyped({ type: 'num', answer: '153.9', tol: 0.05 }, '153.94'), 'correct');
  assert.equal(checkTyped({ type: 'num', answer: 'x' }, 'abc'), 'invalid');
  assert.equal(checkTyped({ type: 'text', answer: 'chlorophyll' }, 'Chlorophyl'), 'typo');
  assert.ok(sameNumber('0.1', '1/10'));
  assert.equal(shiftDecimal('3.7', 3), '3700');
  assert.equal(toDecimal(parseExact('1/8')), '0.125');
});

test('significant figures examples from the notes', () => {
  assert.equal(roundSF('21561', 2), '22000');
  assert.equal(roundSF('0.05713', 3), '0.0571');
  assert.equal(roundSF('37', 1), '40');
  assert.equal(roundSF('492', 1), '500');
});

test('every lesson is complete and every sim exists', () => {
  for (const subject of [MATHS, SCIENCE, ENGLISH, GEOGRAPHY, HISTORY]) {
    for (const unit of subject.units) {
      for (const l of unit.lessons) {
        assert.ok(l.keys.length >= 2, `${l.id} keys`);
        assert.ok(l.learn.length >= 2, `${l.id} learn`);
        assert.ok(l.practice.length >= 5, `${l.id} practice`);
        for (const s of l.learn) if (s.sim) assert.ok(SIMS[s.sim], `${l.id}: missing sim ${s.sim}`);
        for (const item of l.practice) {
          for (let k = 0; k < 30; k++) {
            const q = typeof item === 'function' ? item() : item;
            assert.ok(['mcq', 'tf', 'num', 'text', 'match', 'order'].includes(q.type), `${l.id} type ${q.type}`);
            assert.ok(q.q && q.why, `${l.id}: question and explanation`);
            if (q.type === 'mcq') {
              assert.ok(q.options.length >= 3 && q.answer >= 0 && q.answer < q.options.length, `${l.id} mcq`);
              assert.equal(new Set(q.options).size, q.options.length, `${l.id} duplicate options`);
            }
            if (q.type === 'tf') assert.equal(typeof q.answer, 'boolean');
            if (q.type === 'num') assert.ok(parseExact(q.answer), `${l.id}: numeric answer ${q.answer}`);
            if (q.type === 'match') assert.ok(q.pairs.length >= 3 && new Set(q.pairs.map((p) => p[1])).size === q.pairs.length, `${l.id} match`);
            if (q.type === 'order') assert.ok(q.items.length >= 3, `${l.id} order`);
            if (typeof item !== 'function') break;
          }
        }
      }
    }
  }
});

const correctOpt = (q) => strip(q.options[q.answer]);

test('maths generators: answers re-calculated independently', () => {
  for (let i = 0; i < RUNS; i++) {
    let q = M.genSigFig();
    let [x, n] = nums(q.q);
    assert.equal(Number(q.answer), Number((x * (1 + 1e-12)).toPrecision(n)), strip(q.q));

    q = M.genFromStandardForm();
    const [, A, p] = strip(q.q).match(/([\d.]+) × 10\^(-?\d+)/).map(Number);
    assert.ok(Math.abs(Number(q.answer) - A * 10 ** p) < 1e-12 * Math.max(1, A * 10 ** p), strip(q.q));

    q = M.genEstimate();
    [x, n] = nums(q.q);
    const r = (v) => Number(v.toPrecision(1));
    assert.equal(Number(q.answer), strip(q.q).includes('÷') ? r(x) / r(n) : r(x) * r(n), strip(q.q));

    q = M.genIndexLaw();
    const t = strip(q.q);
    const e = (t.match(/\^(-?\d+)/g) || []).map((s) => Number(s.slice(1)));
    const expect = t.includes('×') ? e[0] + e[1] : t.includes('÷') ? e[0] - e[1] : e[0] * e[1];
    assert.equal(Number(q.answer), expect, t);

    q = M.genPythagoras();
    const v = nums(q.q);
    const want = /hypotenuse <|shorter sides/i.test(strip(q.q)) || strip(q.q).includes('Find the hypotenuse') ? Math.hypot(v[0], v[1]) : Math.sqrt(v[0] ** 2 - v[1] ** 2);
    assert.ok(Math.abs(Number(q.answer) - want) <= 0.05 + 1e-9, `${strip(q.q)} -> ${q.answer} vs ${want}`);

    q = M.genCylinder();
    const [rad, h] = nums(q.q);
    const exact = strip(q.q).includes('volume') ? Math.PI * rad * rad * h : 2 * Math.PI * rad * rad + 2 * Math.PI * rad * h;
    assert.ok(Math.abs(Number(q.answer) - exact) <= 0.05 + 1e-9, strip(q.q));

    q = M.genCircleArea();
    const cv = nums(q.q)[0];
    const radius = strip(q.q).includes('diameter') ? cv / 2 : cv;
    const area = Math.PI * radius * radius * (strip(q.q).includes('semicircle') ? 0.5 : 1);
    assert.ok(Math.abs(Number(q.answer) - area) <= 0.05 + 1e-9, strip(q.q));
  }
});

// Evaluate a polynomial string like "x^2 - 2x - 8" at x.
function evalPoly(s, x, v = 'x') {
  const terms = strip(s).replace(/\s+/g, '').replace(/-/g, '+-').split('+').filter(Boolean);
  return terms.reduce((sum, t) => {
    const m = t.match(new RegExp(`^(-?\\d*)(${v}(?:\\^(\\d+))?)?$`));
    if (!m) throw new Error(`bad term ${t} in ${s}`);
    const c = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    const pw = m[2] ? Number(m[3] || 1) : 0;
    return sum + c * x ** pw;
  }, 0);
}

test('algebra generators: expansions and factorisations are right', () => {
  for (let i = 0; i < RUNS; i++) {
    let q = M.genExpandDouble();
    const g = strip(q.q).match(/\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)/);
    let [a, b] = [Number(g[1] + g[2]), Number(g[3] + g[4])];
    for (const x of [-3, 2, 5]) assert.equal(evalPoly(correctOpt(q), x) + 0, (x + a) * (x + b) + 0, strip(q.q));

    q = M.genFactoriseQuad();
    const expr = strip(q.q).replace('Factorise ', '');
    const f = correctOpt(q).match(/\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)/);
    [a, b] = [Number(f[1] + f[2]), Number(f[3] + f[4])];
    for (const x of [-4, 1, 7]) assert.equal(evalPoly(expr, x) + 0, (x + a) * (x + b) + 0, expr);

    q = M.genSolveQuad();
    const eq = strip(q.q).replace('Solve ', '').replace(' = 0', '');
    const roots = correctOpt(q).match(/-?\d+/g).map(Number);
    for (const r of roots) assert.equal(evalPoly(eq, r) + 0, 0, `${eq} at ${r}`);

    q = M.genNthTerm();
    const seq = strip(q.q).match(/-?\d+/g).map(Number);
    seq.forEach((val, k) => assert.equal(evalPoly(correctOpt(q), k + 1, 'n') + 0, val + 0, strip(q.q)));

    q = M.genExpandSingle();
    const m = strip(q.q).match(/Expand (-?\d+)\((.+)\)$/);
    const vv = m[2].match(/[a-z]/)[0];
    for (const x of [-2, 3]) assert.equal(evalPoly(correctOpt(q), x, vv) + 0, Number(m[1]) * evalPoly(m[2], x, vv) + 0, strip(q.q));
  }
});

test('science and English generators are consistent', () => {
  for (let i = 0; i < RUNS; i++) {
    const q = S.genWeight();
    const [first, g] = nums(q.q).filter((n) => !Number.isNaN(n));
    if (strip(q.q).includes('mass</b>') || strip(q.q).includes('What is its mass')) assert.ok(Math.abs(Number(q.answer) - first / g) < 1e-9, strip(q.q));
    else assert.ok(Math.abs(Number(q.answer) - first * g) < 1e-9, strip(q.q));
    const c = E.genWhichChapter();
    assert.match(c.options[c.answer], /^Chapter \d+/);
  }
  assert.equal(CHAPTERS.length, 12);
});

test('every topic has flashcards, and every card has a front and back', async () => {
  const { CARDS } = await import('../year9/js/content-cards.js');
  const ids = [MATHS, SCIENCE, ENGLISH, GEOGRAPHY, HISTORY].flatMap((s) => s.units.flatMap((u) => u.lessons.map((l) => l.id)));
  for (const id of ids) assert.ok(CARDS[id]?.length >= 3, `flashcards for ${id}`);
  for (const [id, list] of Object.entries(CARDS)) {
    assert.ok(ids.includes(id), `unknown lesson ${id}`);
    for (const [f, b] of list) assert.ok(f.trim() && b.trim(), `${id}: empty card`);
    assert.equal(new Set(list.map((c) => c[0])).size, list.length, `${id}: duplicate card fronts`);
  }
});

test('history dates are consistent and in order questions are right', () => {
  for (const [y] of EVENTS) assert.ok(y >= 1901 && y <= 2026);
  const known = { 'The NHS is founded': 1948, 'Humans land on the Moon': 1969, 'The Berlin Wall falls': 1989, 'The Russian Revolution': 1917, 'The Wall Street Crash': 1929 };
  for (const [ev, y] of Object.entries(known)) assert.equal(EVENTS.find((e) => e[1] === ev)[0], y, ev);
  for (let i = 0; i < 500; i++) {
    const q = H.genOrder();
    const years = q.items.map((it) => EVENTS.find((e) => e[1] === it)[0]);
    for (let k = 1; k < years.length; k++) assert.ok(years[k] > years[k - 1], q.why);
    const y = H.genYear();
    const ev = y.q.replace(/^.*<b>|<\/b>$/g, '');
    assert.ok(EVENTS.some((e) => e[1] === ev && String(e[0]) === y.answer), y.q);
    const r = G.genRockType();
    assert.ok(['Igneous', 'Sedimentary', 'Metamorphic'].includes(r.options[r.answer]));
  }
});
