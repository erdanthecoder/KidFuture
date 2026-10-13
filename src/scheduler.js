// Spaced-repetition scheduler built on FSRS-4.5 (Free Spaced Repetition Scheduler,
// github.com/open-spaced-repetition). FSRS models each card's memory with two numbers:
//   stability  S = days until recall probability falls to 90%
//   difficulty D = 1..10, how hard the card is for you
// and schedules the next review for when recall probability drops to your target retention.
// Pure functions only: no DOM, no storage, so it is easy to test.

export const DEFAULT_W = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474,
  0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755,
];

export const AGAIN = 1, HARD = 2, GOOD = 3, EASY = 4;
export const MIN = 60 * 1000;
export const DAY = 24 * 60 * MIN;

const DECAY = -0.5;
const FACTOR = 19 / 81;
const LEARN_STEPS = [1, 10]; // minutes, for brand-new cards
const RELEARN_STEPS = [10];  // minutes, after forgetting a card

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function newCardState() {
  return { state: 'new', due: 0, stability: 0, difficulty: 0, reps: 0, lapses: 0, step: 0, lastReview: null };
}

/** Probability (0..1) of recalling a card `elapsedDays` after its last review. */
export function retrievability(elapsedDays, stability) {
  if (!stability) return 0;
  return Math.pow(1 + FACTOR * Math.max(0, elapsedDays) / stability, DECAY);
}

/** Days until recall probability falls to `retention`. */
export function intervalDays(stability, retention, maxInterval = 36500) {
  const ivl = (stability / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
  return clamp(Math.round(ivl), 1, maxInterval);
}

const initStability = (w, g) => Math.max(w[g - 1], 0.1);
const initDifficulty = (w, g) => clamp(w[4] - (g - 3) * w[5], 1, 10);

function nextDifficulty(w, d, g) {
  const updated = d - w[6] * (g - 3);
  // Mean reversion towards the "Easy" default stops difficulty getting stuck at 10.
  return clamp(w[7] * initDifficulty(w, EASY) + (1 - w[7]) * updated, 1, 10);
}

function recallStability(w, d, s, r, g) {
  const hardPenalty = g === HARD ? w[15] : 1;
  const easyBonus = g === EASY ? w[16] : 1;
  return s * (1 + Math.exp(w[8]) * (11 - d) * Math.pow(s, -w[9]) *
    (Math.exp((1 - r) * w[10]) - 1) * hardPenalty * easyBonus);
}

function forgetStability(w, d, s, r) {
  const next = w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]);
  return Math.min(next, s);
}

// Deterministic "random" in [0,1) so the interval shown on a button is the one you get.
function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}

// Spread reviews out a little so cards added together don't stay clumped forever.
function fuzz(ivl, seed, maxInterval) {
  if (ivl < 3) return ivl;
  const pct = ivl < 7 ? 0.15 : ivl < 20 ? 0.1 : 0.05;
  const delta = Math.max(1, Math.round(ivl * pct));
  return clamp(ivl - delta + Math.floor(seeded(seed) * (2 * delta + 1)), 2, maxInterval);
}

function hardDelay(steps, step) {
  if (step === 0 && steps.length > 1) return (steps[0] + steps[1]) / 2;
  if (steps.length === 1) return steps[0] * 1.5;
  return steps[step];
}

/**
 * Apply a rating to a card. Returns a new card object; the input is not modified.
 * opts: { retention = 0.9, maxInterval = 36500, w = DEFAULT_W, id }
 */
export function schedule(card, rating, now, opts = {}) {
  const w = opts.w || DEFAULT_W;
  const retention = opts.retention ?? 0.9;
  const maxInterval = opts.maxInterval ?? 36500;
  const seed = `${opts.id ?? card.id ?? ''}:${card.reps}`;
  const c = { ...card };
  const elapsed = c.lastReview == null ? 0 : (now - c.lastReview) / DAY;

  const toStep = (steps, i) => { c.step = i; c.due = now + steps[i] * MIN; };
  const graduate = (minDays = 1) => {
    c.state = 'review';
    c.step = 0;
    const ivl = Math.max(minDays, fuzz(intervalDays(c.stability, retention, maxInterval), seed, maxInterval));
    c.due = now + ivl * DAY;
  };

  if (c.state === 'new') {
    c.stability = initStability(w, rating);
    c.difficulty = initDifficulty(w, rating);
    if (rating === EASY) graduate();
    else {
      c.state = 'learning';
      if (rating === AGAIN) toStep(LEARN_STEPS, 0);
      else if (rating === HARD) { c.step = 0; c.due = now + hardDelay(LEARN_STEPS, 0) * MIN; }
      else if (LEARN_STEPS.length > 1) toStep(LEARN_STEPS, 1);
      else graduate();
    }
  } else if ((c.state === 'learning' || c.state === 'relearning') && elapsed < 1) {
    // Same-day repetitions: short steps only, long-term stability is left alone.
    const steps = c.state === 'learning' ? LEARN_STEPS : RELEARN_STEPS;
    c.difficulty = nextDifficulty(w, c.difficulty, rating);
    if (rating === AGAIN) toStep(steps, 0);
    else if (rating === HARD) c.due = now + hardDelay(steps, c.step) * MIN;
    else if (rating === GOOD && c.step + 1 < steps.length) toStep(steps, c.step + 1);
    else if (rating === GOOD) graduate();
    else graduate(intervalDays(c.stability, retention, maxInterval) + 1);
  } else {
    // A real spaced review (or a learning card left overnight).
    const r = retrievability(elapsed, c.stability);
    const d = c.difficulty;
    c.difficulty = nextDifficulty(w, d, rating);
    if (rating === AGAIN) {
      c.stability = forgetStability(w, d, c.stability, r);
      c.lapses += 1;
      c.state = 'relearning';
      toStep(RELEARN_STEPS, 0);
    } else {
      // Work out all three so that Hard < Good < Easy always holds.
      const ivl = {};
      for (const g of [HARD, GOOD, EASY]) {
        const s = recallStability(w, d, card.stability, r, g);
        ivl[g] = { s, days: fuzz(intervalDays(s, retention, maxInterval), seed + g, maxInterval) };
      }
      ivl[HARD].days = Math.min(ivl[HARD].days, ivl[GOOD].days);
      ivl[GOOD].days = Math.max(ivl[GOOD].days, ivl[HARD].days + 1);
      ivl[EASY].days = Math.max(ivl[EASY].days, ivl[GOOD].days + 1);
      c.stability = ivl[rating].s;
      c.state = 'review';
      c.step = 0;
      c.due = now + Math.min(ivl[rating].days, maxInterval) * DAY;
    }
  }

  c.reps += 1;
  c.lastReview = now;
  return c;
}

/** What each button would do, for labels like "10m" / "4d". */
export function preview(card, now, opts = {}) {
  const out = {};
  for (const g of [AGAIN, HARD, GOOD, EASY]) out[g] = schedule(card, g, now, opts).due - now;
  return out;
}

export function formatInterval(ms) {
  const m = ms / MIN;
  if (m < 60) return `${Math.max(1, Math.round(m))}m`;
  const h = m / 60;
  if (h < 24) return `${Math.round(h)}h`;
  const d = ms / DAY;
  if (d < 30) return `${Math.round(d)}d`;
  if (d < 365) return `${(d / 30).toFixed(d < 300 ? 1 : 0).replace(/\.0$/, '')}mo`;
  return `${(d / 365).toFixed(1).replace(/\.0$/, '')}y`;
}
