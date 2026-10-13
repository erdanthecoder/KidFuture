// Answer checking and small helpers. Numbers are compared EXACTLY as fractions
// (BigInt), so 0.1 + 0.2 style floating-point errors can never mark a right answer wrong.

export const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const bgcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };

/** Parse "3", "-2.75", "3,5", "1,000", "1/8", "-3/4", "4.5e6", "4.5 × 10^6" into an exact fraction {n, d}. */
export function parseExact(input) {
  let s = String(input ?? '').trim().replace(/\s+/g, '').replace(/−|–/g, '-');
  if (!s) return null;
  s = s.replace(/[£$€%]/g, '').replace(/(cm|mm|m|kg|g|j|°c)$/i, '');
  const sf = s.match(/^(-?[\d.,]+)[x×*]10\^?\(?(-?\d+)\)?$/i);
  if (sf) s = `${sf[1]}e${sf[2]}`;
  if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
  else if (/^-?\d{1,3}(,\d{3})+$/.test(s)) s = s.replace(/,/g, '');
  else s = s.replace(',', '.');
  const frac = s.match(/^(-?\d+)\/(-?\d+)$/);
  if (frac) {
    const d = BigInt(frac[2]);
    if (d === 0n) return null;
    return reduce(BigInt(frac[1]), d);
  }
  const m = s.match(/^(-?)(\d*)(?:\.(\d*))?(?:e(-?\d+))?$/i);
  if (!m || (!m[2] && !m[3])) return null;
  const digits = (m[2] || '0') + (m[3] || '');
  let n = BigInt(digits) * (m[1] ? -1n : 1n);
  let d = 10n ** BigInt((m[3] || '').length);
  const e = Number(m[4] || 0);
  if (Math.abs(e) > 300) return null;
  if (e > 0) n *= 10n ** BigInt(e);
  if (e < 0) d *= 10n ** BigInt(-e);
  return reduce(n, d);
}

function reduce(n, d) {
  if (d < 0n) { n = -n; d = -d; }
  const g = bgcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}

export function sameNumber(a, b) {
  const x = typeof a === 'object' ? a : parseExact(a);
  const y = typeof b === 'object' ? b : parseExact(b);
  return !!x && !!y && x.n * y.d === y.n * x.d;
}

/** Exact decimal string of a terminating fraction, e.g. {n: 1, d: 8} -> "0.125". */
export function toDecimal({ n, d }) {
  let k = 0;
  while ((10n ** BigInt(k)) % d !== 0n) {
    if (++k > 60) throw new Error('not a terminating decimal');
  }
  let digits = (n * 10n ** BigInt(k)) / d;
  const negative = digits < 0n;
  if (negative) digits = -digits;
  let str = digits.toString();
  if (k > 0) {
    str = str.padStart(k + 1, '0');
    str = `${str.slice(0, -k)}.${str.slice(-k)}`.replace(/0+$/, '').replace(/\.$/, '');
  }
  return (negative ? '-' : '') + str;
}

/** Shift the decimal point of a decimal string: shift(“3.7”, 3) = “3700”. Exact. */
export function shiftDecimal(str, places) {
  const f = parseExact(str);
  const p = BigInt(Math.abs(places));
  const r = places >= 0 ? reduce(f.n * 10n ** p, f.d) : reduce(f.n, f.d * 10n ** p);
  return toDecimal(r);
}

/** Pretty number with thin-space thousands: 1234567.5 -> "1 234 567.5" */
export function prettyNum(str) {
  const [i, f] = String(str).split('.');
  const neg = i.startsWith('-');
  const int = (neg ? i.slice(1) : i).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '−' : '') + int + (f ? `.${f}` : '');
}

export function normText(s) {
  return String(s ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}+\-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function lev(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Check a typed answer.
 *  num questions:  { answer: '0.125', accept: ['1/8'], tol?: 0.05 }
 *  text questions: { answer: 'chlorophyll', accept: [...] }  (one small typo allowed for longer words)
 * Returns 'correct' | 'typo' | 'wrong' | 'invalid'.
 */
export function checkTyped(q, typed) {
  const options = [q.answer, ...(q.accept || [])].map(String);
  if (q.type === 'num') {
    const t = parseExact(typed);
    if (!t) return 'invalid';
    if (q.tol != null) {
      const v = Number(t.n) / Number(t.d);
      return options.some((o) => Math.abs(v - Number(o.replace(',', '.'))) <= q.tol + 1e-12) ? 'correct' : 'wrong';
    }
    return options.some((o) => sameNumber(t, o)) ? 'correct' : 'wrong';
  }
  const t = normText(typed);
  if (!t) return 'invalid';
  if (options.some((o) => normText(o) === t)) return 'correct';
  if (options.some((o) => normText(o).length > 4 && lev(normText(o), t) <= 1)) return 'typo';
  return 'wrong';
}

/** Build a multiple-choice question from a correct option and distractors (deduped, shuffled). */
export function mcq(q, correct, distractors, extra = {}) {
  const seen = new Set([correct]);
  const wrong = [];
  for (const d of distractors) {
    if (d == null || seen.has(d)) continue;
    seen.add(d);
    wrong.push(d);
    if (wrong.length === 3) break;
  }
  const options = shuffle([correct, ...wrong]);
  return { type: 'mcq', q, options, answer: options.indexOf(correct), ...extra };
}

// Superscript helper for powers in HTML: pow('x', 3) -> x<sup>3</sup>
export const sup = (n) => (n === 1 ? '' : `<sup>${String(n).replace('-', '−')}</sup>`);
export const signed = (n) => (n < 0 ? `− ${-n}` : `+ ${n}`);
export const neg = (n) => String(n).replace('-', '−');

/** Round a positive decimal string to n significant figures, exactly (half up). roundSF('21561', 2) = '22000'. */
export function roundSF(str, n) {
  const f = parseExact(str);
  // write the value as N / 10^k with N an integer
  let k = 0;
  while ((10n ** BigInt(k)) % f.d !== 0n) k++;
  const N = (f.n * 10n ** BigInt(k)) / f.d;
  const L = N.toString().length;
  if (L <= n) return toDecimal(f);
  const drop = 10n ** BigInt(L - n);
  let q = N / drop;
  if ((N % drop) * 2n >= drop) q += 1n;
  return toDecimal(reduce(q * drop, 10n ** BigInt(k)));
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
