// MATHS – YEAR 9. Built from the class revision notes: Unit 1 (standard form, significant
// figures, powers), Unit 2 (2D shapes and 3D solids), Unit 3 (expressions), plus "Quadratics (for later)".
// Static questions are hand-checked; generated questions compute their answers exactly.

import { rand, pick, shuffle, gcd, mcq, sup, neg, shiftDecimal, parseExact, toDecimal, prettyNum, roundSF } from './engine.js';

// ---------- formatting ----------
export const frac = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;

/** Polynomial from coefficients, highest power first: poly([1, -2, -8]) = "x² − 2x − 8". */
export function poly(coeffs, v = 'x') {
  const deg = coeffs.length - 1;
  let out = '';
  coeffs.forEach((c, i) => {
    if (c === 0) return;
    const p = deg - i;
    const abs = Math.abs(c);
    const coef = abs === 1 && p > 0 ? '' : String(abs);
    const vv = p === 0 ? '' : p === 1 ? v : `${v}${sup(p)}`;
    if (!out) out = (c < 0 ? '−' : '') + coef + vv;
    else out += (c < 0 ? ' − ' : ' + ') + coef + vv;
  });
  return out || '0';
}

/** A single algebraic term: term(15, {x: 4, y: 3}) = "15x⁴y³". */
export function term(c, powers = {}) {
  const letters = Object.entries(powers).filter(([, p]) => p !== 0).map(([v, p]) => `${v}${sup(p)}`).join('');
  if (!letters) return neg(c);
  return (c === 1 ? '' : c === -1 ? '−' : neg(c)) + letters;
}

const sfHtml = (a, n) => `${a} × 10<sup>${neg(n)}</sup>`;
const r1 = (x) => (Math.round(x * 10) / 10).toFixed(1);

/** Static multiple-choice question (options shuffled each time it's shown). */
export function mcqS(q, correct, wrong, why) {
  return () => mcq(q, correct, shuffle(wrong), { why });
}

// ====================================================================== UNIT 1

function genPow10() {
  const n = pick([-3, -2, -1, 0, 1, 2, 3]);
  const value = n >= 0 ? String(10 ** n) : toDecimal({ n: 1n, d: 10n ** BigInt(-n) });
  if (Math.random() < 0.5) {
    return { type: 'num', q: `Write 10<sup>${neg(n)}</sup> as an ordinary number.`, answer: value,
      why: `10<sup>${neg(n)}</sup> = ${prettyNum(value)}. ${n < 0 ? 'A negative power gives a number less than 1: each step down divides by 10.' : n === 0 ? 'Anything to the power 0 is 1.' : `That's 1 followed by ${n} zero${n > 1 ? 's' : ''}.`}` };
  }
  return { type: 'num', q: `${prettyNum(value)} = 10<sup>?</sup>`, answer: String(n),
    why: `${prettyNum(value)} = 10<sup>${neg(n)}</sup>. 10³ = 1000, 10² = 100, 10¹ = 10, 10⁰ = 1, 10⁻¹ = 0.1, 10⁻² = 0.01, 10⁻³ = 0.001.` };
}

function genIndexLaw() {
  const base = pick([2, 3, 5, 7, 'a', 'x']);
  const kind = pick(['mul', 'div', 'pow']);
  const m = rand(2, 9), n = rand(1, 7);
  const b = (e) => `${base}<sup>${neg(e)}</sup>`;
  if (kind === 'mul') return { type: 'num', q: `${b(m)} × ${b(n)} = ${base}<sup>?</sup>`, answer: String(m + n), why: `Multiply → <b>add</b> the powers: ${m} + ${n} = ${m + n}. (Like 3⁴ × 3⁶ = 3¹⁰.)` };
  if (kind === 'div') {
    const top = m + n;
    return { type: 'num', q: `${b(top)} ÷ ${b(n)} = ${base}<sup>?</sup>`, answer: String(m), why: `Divide → <b>subtract</b> the powers: ${top} − ${n} = ${m}. (Like 7⁹ ÷ 7⁵ = 7⁴.)` };
  }
  const k = rand(2, 4);
  return { type: 'num', q: `(${b(m)})<sup>${k}</sup> = ${base}<sup>?</sup>`, answer: String(m * k), why: `Power of a power → <b>multiply</b> the powers: ${m} × ${k} = ${m * k}. (Like (2⁴)³ = 2¹².)` };
}

function genNegativeZeroPower() {
  const base = pick([2, 3, 4, 5, 10]);
  const e = pick([0, -1, -2, -3].filter((x) => base ** -x <= 1000));
  if (e === 0) return { type: 'num', q: `Work out ${base}<sup>0</sup>`, answer: '1', why: 'Power zero: a⁰ = 1. (Like 5⁰ = 1.)' };
  const d = base ** -e;
  return { type: 'num', q: `Work out ${base}<sup>${neg(e)}</sup>.<br><span class="muted">Give a fraction like 1/9.</span>`, answer: `1/${d}`,
    why: `Negative power: a⁻ⁿ = 1/aⁿ, so ${base}<sup>${neg(e)}</sup> = ${e === -1 ? '' : `1/${base}<sup>${-e}</sup> = `}1/${d}. (Like 3⁻² = 1/9.)` };
}

function genFractionPower() {
  let a, b;
  do { a = rand(1, 5); b = rand(2, 7); } while (a >= b || gcd(a, b) !== 1);
  const n = pick([2, 2, 3]);
  return { type: 'num', q: `Work out (${a}/${b})<sup>${n}</sup> as a fraction.`, answer: `${a ** n}/${b ** n}`,
    why: `(a/b)ⁿ = aⁿ/bⁿ: ${a}<sup>${n}</sup> = ${a ** n} and ${b}<sup>${n}</sup> = ${b ** n}, so the answer is ${a ** n}/${b ** n}. (Like (3/4)² = 9/16.)` };
}

function sfParts() {
  let m;
  do m = rand(1, 999); while (m % 10 === 0);
  const s = String(m);
  return { m, A: s.length === 1 ? s : `${s[0]}.${s.slice(1)}`, len: s.length };
}

function genToStandardForm() {
  const big = Math.random() < 0.5;
  const { m, A, len } = sfParts();
  let n, number;
  if (big) {
    const k = rand(Math.max(0, 3 - (len - 1)), 8 - (len - 1));
    n = len - 1 + k;
    number = String(m) + '0'.repeat(k);
  } else {
    n = -rand(1, 6);
    number = shiftDecimal(A, n);
  }
  return mcq(`Write <b>${prettyNum(number)}</b> in standard form.`, sfHtml(A, n),
    [sfHtml(A, n - 1), sfHtml(A, n + 1), sfHtml(A, -n), sfHtml(shiftDecimal(A, -1), n + 1)],
    { why: `The first number must be between 1 and 10, so A = ${A}. ${big ? `Big number: the point moves ${n} places left, so the power is positive: ${n}.` : `Small number: the point moves ${-n} place${n === -1 ? '' : 's'} right, so the power is negative: ${neg(n)}.`}` });
}

function genFromStandardForm() {
  const { A } = sfParts();
  const n = pick([-4, -3, -2, -1, 2, 3, 4, 5, 6]);
  const ans = shiftDecimal(A, n);
  return { type: 'num', q: `Write ${sfHtml(A, n)} as an ordinary number.`, answer: ans,
    why: `${n > 0 ? `Positive power → move the point ${n} places right` : `Negative power → move the point ${-n} place${n === -1 ? '' : 's'} left`}: ${prettyNum(ans)}.` };
}

const sfOf = (prod, power) => {
  // turn prod × 10^power (prod a positive decimal string) into standard form
  const f = parseExact(prod);
  let shift = 0, x = f;
  const ge10 = (y) => y.n >= 10n * y.d, lt1 = (y) => y.n < y.d;
  while (ge10(x)) { x = { n: x.n, d: x.d * 10n }; shift++; }
  while (lt1(x)) { x = { n: x.n * 10n, d: x.d }; shift--; }
  return [toDecimal(x), power + shift];
};

function genSFMultiply() {
  const a = rand(2, 9), b = rand(2, 9), p = rand(2, 8), q = rand(1, 6);
  const prod = a * b;
  const [A, n] = sfOf(String(prod), p + q);
  return mcq(`Work out (${sfHtml(a, p)}) × (${sfHtml(b, q)}).<br>Give your answer in standard form.`, sfHtml(A, n),
    [sfHtml(prod, p + q), sfHtml(A, p * q), sfHtml(A, n - 1), sfHtml(A, n + 1), sfHtml(...sfOf(String(a + b), p + q)), sfHtml(A, p - q)].filter((o) => o !== sfHtml(A, n)),
    { why: `Multiply the numbers: ${a} × ${b} = ${prod}. Add the powers: ${p} + ${q} = ${p + q}.${prod >= 10 ? ` ${prod} is not between 1 and 10, so ${prod} × 10<sup>${p + q}</sup> = ${A} × 10<sup>${n}</sup> (number ÷ 10, so power + 1).` : ''}` });
}

function genSFDivide() {
  const b = pick([2, 4, 5, 8]), a = rand(1, 9), p = rand(5, 10), q = rand(1, 4);
  const quot = toDecimal(parseExact(`${a}/${b}`));
  const [A, n] = sfOf(quot, p - q);
  return mcq(`Work out (${sfHtml(a, p)}) ÷ (${sfHtml(b, q)}).<br>Give your answer in standard form.`, sfHtml(A, n),
    [sfHtml(A, p + q), sfHtml(A, n + 1), sfHtml(A, n - 1), a < b ? sfHtml(quot, p - q) : sfHtml(A, n + 2)],
    { why: `Divide the numbers: ${a} ÷ ${b} = ${quot}. Subtract the powers: ${p} − ${q} = ${p - q}.${a < b ? ` ${quot} is less than 1, so ${quot} × 10<sup>${p - q}</sup> = ${A} × 10<sup>${n}</sup> (number × 10, so power − 1).` : ''}` });
}

function genSFFix() {
  const big = Math.random() < 0.6;
  let m;
  do m = rand(11, 999); while (m % 10 === 0);
  const p = rand(2, 8);
  const shown = big ? toDecimal({ n: BigInt(m), d: m >= 100 ? 10n : 1n }) : toDecimal({ n: BigInt(m), d: 1000n });
  const [A, n] = sfOf(shown, p);
  return mcq(`${sfHtml(shown, p)} is <b>not</b> in standard form. Which is the correct standard form?`, sfHtml(A, n),
    [sfHtml(A, p), sfHtml(A, 2 * p - n), sfHtml(shown, n), sfHtml(A, n + (n > p ? 1 : -1))].filter((o) => o !== sfHtml(A, n)),
    { why: `${shown} isn't between 1 and 10. ${shown} = ${A} × 10<sup>${neg(n - p)}</sup>, so the power becomes ${p} ${n > p ? '+' : '−'} ${Math.abs(n - p)} = ${n}: <b>${A} × 10<sup>${n}</sup></b>. (Like 10.8 × 10⁵ = 1.08 × 10⁶.)` });
}

function genSFAdd() {
  const a = rand(1, 8), b = rand(1, 9), m = rand(4, 8);
  const sub = Math.random() < 0.3;
  const total = sub ? a * 10 ** m - b * 10 ** (m - 1) : a * 10 ** m + b * 10 ** (m - 1);
  const [A, n] = sfOf(String(total), 0);
  const op = sub ? '−' : '+';
  return mcq(`Work out ${sfHtml(a, m)} ${op} ${sfHtml(b, m - 1)}.<br>Give your answer in standard form.`, sfHtml(A, n),
    [sfHtml(sub ? Math.max(1, a - b) : a + b, m), sfHtml(A, n + 1), sfHtml(A, n - 1), sfHtml(sub ? Math.max(1, a - b) : a + b, 2 * m - 1)],
    { why: `Change to ordinary numbers first: ${prettyNum(String(a * 10 ** m))} ${op} ${prettyNum(String(b * 10 ** (m - 1)))} = ${prettyNum(String(total))} = <b>${A} × 10<sup>${n}</sup></b>. You can't just ${sub ? 'subtract' : 'add'} the first numbers when the powers are different.` });
}

function genSFOrder() {
  const vals = new Set();
  const items = [];
  while (items.length < 4) {
    const { A } = sfParts();
    const n = rand(-3, 6);
    const key = toDecimal(parseExact(shiftDecimal(A, n)));
    if (vals.has(key)) continue;
    vals.add(key);
    items.push([A, n, parseExact(key)]);
  }
  const big = items.reduce((x, y) => (y[2].n * x[2].d > x[2].n * y[2].d ? y : x));
  return mcq('Which number is the <b>largest</b>?', sfHtml(big[0], big[1]), items.filter((i) => i !== big).map((i) => sfHtml(i[0], i[1])),
    { why: `Compare the powers first: the biggest power wins. If powers are equal, compare the first numbers. Largest: ${sfHtml(big[0], big[1])}.` });
}

function genSigFig() {
  for (;;) {
    const form = pick([
      () => String(rand(1000, 99999)),
      () => `0.0${rand(100, 9999)}`,
      () => `${rand(1, 99)}.${rand(100, 999)}`,
      () => `0.00${rand(10, 999)}`,
    ]);
    const x = form().replace(/0+$/, '');
    const n = rand(1, 3);
    const sig = x.replace('.', '').replace(/^0+/, '').length;
    if (sig <= n) continue;
    const ans = roundSF(x, n);
    const shownSig = ans.replace('.', '').replace(/^0+/, '').length;
    if (ans.includes('.') && shownSig < n) continue; // would need trailing zeros like 3.00
    const digits = x.replace('.', '').replace(/^0+/, '');
    return { type: 'num', q: `Round <b>${prettyNum(x)}</b> to <b>${n}</b> significant figure${n > 1 ? 's' : ''}.`, answer: ans,
      why: `The first significant figure is the first non-zero digit (${digits[0]}). Keep ${n} figure${n > 1 ? 's' : ''}, then look at the next digit (${digits[n]}): ${Number(digits[n]) >= 5 ? '5 or more → round up' : '4 or less → stays the same'}. Answer: <b>${prettyNum(ans)}</b>.${!ans.includes('.') && x.length > ans.length ? ' Keep the zeros as place holders.' : ''}` };
  }
}

function genFirstSF() {
  const x = pick([`0.0${rand(1, 9)}${rand(10, 99)}`, `0.00${rand(1, 9)}${rand(1, 9)}`, `${rand(1, 9)}${rand(100, 999)}`, `0.${rand(1, 9)}${rand(0, 9)}`]);
  const d = x.replace('.', '').replace(/^0+/, '')[0];
  return { type: 'num', q: `What is the <b>first significant figure</b> of ${prettyNum(x)}?`, answer: d,
    why: `The 1st significant figure is the first digit that is not zero: <b>${d}</b>. (In 0.0571 it is 5.)` };
}

function genEstimate() {
  const a = rand(12, 98), b = rand(110, 980);
  const ra = Number(roundSF(String(a), 1)), rb = Number(roundSF(String(b), 1));
  const div = Math.random() < 0.3 && rb % ra === 0;
  if (div) return { type: 'num', q: `Estimate ${b} ÷ ${a} by rounding each number to 1 significant figure.`, answer: String(rb / ra),
    why: `${b} ≈ ${rb} and ${a} ≈ ${ra}. ${rb} ÷ ${ra} = <b>${rb / ra}</b>.` };
  return { type: 'num', q: `Estimate ${a} × ${b} by rounding each number to 1 significant figure.`, answer: String(ra * rb),
    why: `${a} ≈ ${ra} and ${b} ≈ ${rb}. ${ra} × ${rb} = <b>${prettyNum(String(ra * rb))}</b>. (Like 37 × 492 ≈ 40 × 500 = 20 000.)` };
}

function genUnitsPower() {
  const k = rand(2, 9);
  const kind = pick(['a', 'v', 'a-back', 'v-back']);
  if (kind === 'a') return { type: 'num', q: `How many cm² are in <b>${k} m²</b>?`, answer: String(k * 10000), why: `1 m² = 100² cm² = 10⁴ cm² = 10 000 cm². ${k} × 10 000 = ${prettyNum(String(k * 10000))} cm².` };
  if (kind === 'v') return { type: 'num', q: `How many cm³ are in <b>${k} m³</b>?`, answer: String(k * 1e6), why: `1 m³ = 100³ cm³ = 10⁶ cm³ = 1 000 000 cm³. ${k} × 1 000 000 = ${prettyNum(String(k * 1e6))} cm³.` };
  if (kind === 'a-back') return { type: 'num', q: `Change <b>${prettyNum(String(k * 10000))} cm²</b> into m².`, answer: String(k), why: `1 m² = 10 000 cm², so divide by 10 000: ${k} m².` };
  return { type: 'num', q: `Change <b>${prettyNum(String(k * 1e6))} cm³</b> into m³.`, answer: String(k), why: `1 m³ = 1 000 000 cm³, so divide by 1 000 000: ${k} m³.` };
}

// ====================================================================== UNIT 2

function genSurfaceArea() {
  if (Math.random() < 0.4) {
    const s = rand(2, 12);
    return { type: 'num', q: `A cube has sides of <b>${s} cm</b>. What is its surface area in cm²?`, answer: String(6 * s * s),
      why: `A cube has 6 square faces, each ${s} × ${s} = ${s * s} cm². Surface area = 6 × ${s * s} = <b>${6 * s * s} cm²</b>.` };
  }
  const l = rand(3, 12), w = rand(2, 9), h = rand(2, 8);
  const sa = 2 * (l * w + l * h + w * h);
  return { type: 'num', q: `A cuboid is ${l} cm × ${w} cm × ${h} cm. What is its <b>surface area</b> in cm²?`, answer: String(sa),
    why: `Add every face (they come in pairs): 2 × (${l}×${w} + ${l}×${h} + ${w}×${h}) = 2 × (${l * w} + ${l * h} + ${w * h}) = <b>${sa} cm²</b>.` };
}

function genPrismVolume() {
  if (Math.random() < 0.5) {
    const b = rand(2, 10), h = pick([2, 3, 4, 5, 6, 3.5, 2.5]), L = rand(3, 12);
    const area = (b * h) / 2, V = area * L;
    return { type: 'num', q: `A triangular prism: the triangle has base ${b} cm and height ${h} cm. The prism is ${L} cm long. What is its <b>volume</b> in cm³?`, answer: String(V),
      why: `Cross-section = ½ × ${b} × ${h} = ${area} cm². Volume = cross-section × length = ${area} × ${L} = <b>${V} cm³</b>. (Like ½ × 4 × 3.5 = 7, × 5 = 35 cm³.)` };
  }
  const A = rand(5, 40), L = rand(2, 15);
  return { type: 'num', q: `A prism has a cross-section area of ${A} cm² and a length of ${L} cm. What is its volume in cm³?`, answer: String(A * L),
    why: `Volume of a prism = cross-section area × length = ${A} × ${L} = <b>${A * L} cm³</b>.` };
}

function genCapacity() {
  const kind = pick(['ml', 'l', 'm3', 'back']);
  if (kind === 'ml') { const v = rand(20, 900); return { type: 'num', q: `A box holds ${v} cm³. How many <b>ml</b> is that?`, answer: String(v), why: `1 cm³ = 1 ml, so ${v} cm³ = ${v} ml.` }; }
  if (kind === 'l') { const v = rand(2, 30) * 500; return { type: 'num', q: `A tank holds ${prettyNum(String(v))} cm³. How many <b>litres</b> is that?`, answer: toDecimal(parseExact(`${v}/1000`)), why: `1 litre = 1000 cm³, so ÷ 1000: ${prettyNum(String(v))} ÷ 1000 = ${toDecimal(parseExact(`${v}/1000`))} litres.` }; }
  if (kind === 'm3') { const v = rand(2, 9); return { type: 'num', q: `A pool holds ${v} m³ of water. How many <b>litres</b>?`, answer: String(v * 1000), why: `1 m³ = 1000 litres, so ${v} × 1000 = ${prettyNum(String(v * 1000))} litres.` }; }
  const l = rand(2, 9);
  return { type: 'num', q: `How many cm³ are in ${l} litres?`, answer: String(l * 1000), why: `1 litre = 1000 cm³: ${l} × 1000 = ${prettyNum(String(l * 1000))} cm³.` };
}

const piAns = (x, x314) => ({ answer: r1(x), tol: 0.05, accept: [r1(x314)] });

function genCircumference() {
  const useD = Math.random() < 0.5;
  const v = rand(2, 20);
  const C = useD ? Math.PI * v : 2 * Math.PI * v;
  return { type: 'num', q: `A circle has ${useD ? 'diameter' : 'radius'} <b>${v} cm</b>. Find its <b>circumference</b> to 1 decimal place.`,
    ...piAns(C, useD ? 3.14 * v : 2 * 3.14 * v),
    why: useD ? `C = πd = π × ${v} = ${C.toFixed(3)}… = <b>${r1(C)} cm</b>.` : `C = 2πr = 2 × π × ${v} = ${C.toFixed(3)}… = <b>${r1(C)} cm</b>.` };
}

function genCircleArea() {
  const useD = Math.random() < 0.4;
  const r = rand(2, 15);
  const A = Math.PI * r * r;
  const semi = !useD && Math.random() < 0.25;
  const val = semi ? A / 2 : A;
  return { type: 'num', q: `${semi ? 'A <b>semicircle</b>' : 'A circle'} has ${useD ? `diameter <b>${2 * r} cm</b>` : `radius <b>${r} cm</b>`}. Find its <b>area</b> to 1 decimal place.`,
    ...piAns(val, semi ? (3.14 * r * r) / 2 : 3.14 * r * r),
    why: `${useD ? `Always use the radius: r = ${2 * r} ÷ 2 = ${r} cm. ` : ''}A = πr² = π × ${r}² = ${A.toFixed(3)}…${semi ? `. Semicircle = ½ of that = ${val.toFixed(3)}…` : ''} = <b>${r1(val)} cm²</b>.` };
}

function genRadius() {
  const r = rand(2, 30);
  return Math.random() < 0.5
    ? { type: 'num', q: `A circle has radius ${r} cm. What is its diameter?`, answer: String(2 * r), why: `d = 2r = 2 × ${r} = ${2 * r} cm.` }
    : { type: 'num', q: `A circle has diameter ${2 * r} cm. What is its radius?`, answer: String(r), why: `r = d ÷ 2 = ${2 * r} ÷ 2 = ${r} cm.` };
}

function genCylinder() {
  const r = rand(2, 10), h = rand(3, 15);
  if (Math.random() < 0.55) {
    const V = Math.PI * r * r * h;
    return { type: 'num', q: `A cylinder has radius ${r} cm and height ${h} cm. Find its <b>volume</b> to 1 d.p.`, ...piAns(V, 3.14 * r * r * h),
      why: `V = πr²h = π × ${r}² × ${h} = π × ${r * r * h} = ${V.toFixed(3)}… = <b>${r1(V)} cm³</b>. (Like r = 5, h = 9 → 706.9 cm³.)` };
  }
  const SA = 2 * Math.PI * r * r + 2 * Math.PI * r * h;
  return { type: 'num', q: `A closed cylinder has radius ${r} cm and height ${h} cm. Find its <b>surface area</b> to 1 d.p.`, ...piAns(SA, 2 * 3.14 * r * r + 2 * 3.14 * r * h),
    why: `SA = 2πr² + 2πrh = 2π × ${r * r} + 2π × ${r} × ${h} = ${(2 * Math.PI * r * r).toFixed(2)}… + ${(2 * Math.PI * r * h).toFixed(2)}… = <b>${r1(SA)} cm²</b>. (Two circles + the curved rectangle.)` };
}

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [12, 16, 20]];

function genPythagoras() {
  const long = Math.random() < 0.55;
  const exact = Math.random() < 0.6;
  if (exact) {
    const [a, b, c] = pick(TRIPLES);
    if (long) return { type: 'num', q: `A right-angled triangle has shorter sides <b>${a} cm</b> and <b>${b} cm</b>. Find the hypotenuse.`, answer: String(c),
      why: `c² = a² + b² = ${a * a} + ${b * b} = ${c * c}. c = √${c * c} = <b>${c} cm</b>.` };
    return { type: 'num', q: `A right-angled triangle has hypotenuse <b>${c} cm</b> and one side <b>${b} cm</b>. Find the other side.`, answer: String(a),
      why: `Short side: a² = c² − b² = ${c * c} − ${b * b} = ${a * a}. a = √${a * a} = <b>${a} cm</b>.` };
  }
  const a = rand(2, 12), b = rand(a + 1, 15);
  if (long) {
    const c = Math.sqrt(a * a + b * b);
    if (Number.isInteger(c)) return genPythagoras();
    return { type: 'num', q: `Shorter sides <b>${a} cm</b> and <b>${b} cm</b>. Find the hypotenuse to 1 d.p.`, answer: r1(c), tol: 0.05,
      why: `c² = ${a * a} + ${b * b} = ${a * a + b * b}. c = √${a * a + b * b} = ${c.toFixed(3)}… = <b>${r1(c)} cm</b>.` };
  }
  const c = b + rand(1, 6);
  const x = Math.sqrt(c * c - b * b);
  if (Number.isInteger(x)) return genPythagoras();
  return { type: 'num', q: `Hypotenuse <b>${c} cm</b>, one side <b>${b} cm</b>. Find the other side to 1 d.p.`, answer: r1(x), tol: 0.05,
    why: `a² = c² − b² = ${c * c} − ${b * b} = ${c * c - b * b}. a = √${c * c - b * b} = ${x.toFixed(3)}… = <b>${r1(x)} cm</b>.` };
}

// ====================================================================== UNIT 3

const CLASSIFY = [
  ['3x + 4y', 'Expression', 'No equals sign.'],
  ['7y − 2', 'Expression', 'No equals sign.'],
  ['P = 4t + 5', 'Formula', 'A rule linking variables (P and t).'],
  ['A = πr²', 'Formula', 'A rule linking variables (A and r).'],
  ['v = u + at', 'Formula', 'A rule linking variables.'],
  ['2x + 5 = 11', 'Equation', 'Only true for one value (x = 3).'],
  ['3x − 1 = 8', 'Equation', 'Only true for x = 3.'],
  ['x + x + 5 ≡ 2x + 5', 'Identity', 'True for every value of x (≡ means identical).'],
  ['4(x + 1) ≡ 4x + 4', 'Identity', 'True for every value of x.'],
];

function genClassify() {
  const [e, kind, why] = pick(CLASSIFY);
  return mcq(`Is <b>${e}</b> an expression, a formula, an equation or an identity?`, kind,
    ['Expression', 'Formula', 'Equation', 'Identity'].filter((k) => k !== kind), { why: `${kind}. ${why}` });
}

function genSolveLinear() {
  const a = rand(2, 9), x = rand(-5, 12), b = rand(-10, 15);
  const rhs = a * x + b;
  return { type: 'num', q: `Solve the equation <b>${poly([a, b])} = ${neg(rhs)}</b>`, answer: String(x),
    why: `${b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: ${a}x = ${neg(rhs - b)}. Divide by ${a}: x = <b>${neg(x)}</b>.` };
}

function genMultiplyTerms() {
  const a = rand(2, 7), b = rand(2, 6), p = rand(1, 4), q = rand(1, 3), r = rand(1, 3), s = rand(1, 3);
  const correct = term(a * b, { x: p + r, y: q + s });
  return mcq(`Simplify ${term(a, { x: p, y: q })} × ${term(b, { x: r, y: s })}`, correct,
    [term(a + b, { x: p + r, y: q + s }), term(a * b, { x: p * r, y: q * s }), term(a * b, { x: p + r, y: q * s }), term(a + b, { x: p * r, y: q * s }),
      term(a * b, { x: p + r + 1, y: q + s }), term(a * b, { x: p + r, y: q + s + 1 }), term(a * b, { x: p, y: q })],
    { why: `Multiply the numbers (${a} × ${b} = ${a * b}) and add the powers of each letter (x: ${p} + ${r}, y: ${q} + ${s}). (Like 3x³y × 5xy² = 15x⁴y³.)` });
}

function genDivideTerms() {
  const b = rand(2, 6), k = rand(2, 6), a = b * k;
  const m = rand(2, 9), n = rand(1, 9);
  const e = m - n;
  const correct = e >= 0 ? term(k, { x: e }) : `${term(k, { x: e })} = ${frac(k, `x${sup(-e)}`)}`;
  return mcq(`Simplify ${term(a, { x: m })} ÷ ${term(b, { x: n })}`, correct,
    [term(k, { x: m + n }), term(k, { x: e === 0 ? 1 : -e }), term(a - b, { x: e }), term(k, { x: m * n }), term(k + 1, { x: e }), term(a * b, { x: e })],
    { why: `Divide the numbers (${a} ÷ ${b} = ${k}) and subtract the powers (${m} − ${n} = ${neg(e)}).${e < 0 ? ` A negative power means 1 over: ${term(k, { x: e })} = ${k}/x${sup(-e)}. (Like 20x⁵ ÷ 4x⁸ = 5x⁻³ = 5/x³.)` : ''}` });
}

function genExpandSingle() {
  const a = pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]), b = rand(1, 6), c = pick([-7, -5, -3, -2, 1, 2, 4, 6, 8]);
  const v = pick(['x', 'p', 'y']);
  const inside = poly([b, c], v);
  const correct = poly([a * b, a * c], v);
  return mcq(`Expand ${neg(a)}(${inside})`, correct,
    [poly([a * b, c], v), poly([a * b, -a * c], v), poly([a + b, a * c], v), poly([-a * b, a * c], v)],
    { why: `Multiply <b>every</b> term inside by ${neg(a)}: ${neg(a)} × ${poly([b, 0], v)} = ${poly([a * b, 0], v)} and ${neg(a)} × ${neg(c)} = ${neg(a * c)}.${a < 0 ? ' Watch the signs: negative × negative = positive.' : ''}` });
}

function genExpandSimplify() {
  const a = rand(2, 6), b = rand(1, 8), c = rand(2, 6), d = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3]);
  const sub = Math.random() < 0.35;
  const s = sub ? -1 : 1;
  const xCoef = a + s * c, k = a * b + s * c * d;
  const correct = poly([xCoef, k]);
  return mcq(`Expand and simplify ${a}(x + ${b}) ${sub ? '−' : '+'} ${c}(${poly([1, d])})`, correct,
    [poly([a + c, a * b + c * d]) === correct ? poly([xCoef, k + 2]) : poly([a + c, a * b + c * d]), poly([xCoef, a * b + s * d]), poly([xCoef, b + s * c * d]), poly([xCoef + 1, k])],
    { why: `${a}(x + ${b}) = ${poly([a, a * b])}. ${sub ? '−' : '+'}${c}(${poly([1, d])}) = ${poly([s * c, s * c * d])}. Collect like terms: ${a}x ${sub ? '−' : '+'} ${c}x = ${poly([xCoef, 0])}, ${a * b} ${s * c * d < 0 ? '−' : '+'} ${Math.abs(s * c * d)} = ${k}. Answer: <b>${correct}</b>. (Like 3(x + 5) + 4(x − 1) = 7x + 11.)` });
}

function genHCF() {
  const g = pick([2, 3, 4, 5, 6]);
  let p, q;
  do { p = rand(1, 5); q = rand(1, 5); } while (gcd(p, q) !== 1 || p === q);
  const a1 = rand(1, 3), b1 = rand(1, 3), a2 = rand(1, 3), b2 = rand(1, 3);
  const t1 = term(g * p, { x: a1, y: b1 }), t2 = term(g * q, { x: a2, y: b2 });
  const correct = term(g, { x: Math.min(a1, a2), y: Math.min(b1, b2) });
  return mcq(`Find the HCF of <b>${t1}</b> and <b>${t2}</b>.`, correct,
    [term(g, { x: Math.max(a1, a2), y: Math.max(b1, b2) }), term(g * p * q, { x: Math.min(a1, a2), y: Math.min(b1, b2) }), String(g), term(g === 2 ? 1 : 2, { x: Math.min(a1, a2), y: Math.min(b1, b2) })],
    { why: `Biggest number that divides ${g * p} and ${g * q}: ${g}. Lowest power of x: x${sup(Math.min(a1, a2))}. Lowest power of y: y${sup(Math.min(b1, b2))}. HCF = <b>${correct}</b>. (Like HCF of 12xy³ and 8x²y² = 4xy².)` });
}

function genFactorise() {
  const g = rand(2, 6), p = rand(1, 5);
  let q;
  do q = pick([-7, -5, -3, -2, -1, 1, 2, 3, 4, 5, 7]); while (gcd(p, Math.abs(q)) !== 1);
  // g·p x² + g·q x = gx(px + q)
  const expr = poly([g * p, g * q, 0]);
  const correct = `${g}x(${poly([p, q])})`;
  return mcq(`Factorise completely: <b>${expr}</b>`, correct,
    [`${g}(${poly([p, q, 0])})`, `x(${poly([g * p, g * q])})`, `${g}x(${poly([p, -q])})`, `${g}x(${poly([p * g, q])})`],
    { why: `The HCF of ${poly([g * p, 0, 0])} and ${poly([g * q, 0])} is ${g}x. Divide each term by it: ${poly([g * p, 0, 0])} ÷ ${g}x = ${poly([p, 0])}, ${poly([g * q, 0])} ÷ ${g}x = ${neg(q)}. Answer: <b>${correct}</b>. Taking out only ${g} or only x is not "completely". (Like 4x² + 12x = 4x(x + 3).)` });
}

// ====================================================================== QUADRATICS (for later)

function genNthTerm() {
  const d = pick([-4, -3, -2, 2, 3, 4, 5, 6, 7]), a = rand(-5, 15);
  const seq = [0, 1, 2, 3].map((i) => a + i * d);
  const c = a - d;
  const correct = poly([d, c], 'n');
  return mcq(`Find the nth term of <b>${seq.map(neg).join(', ')}, …</b>`, correct,
    [poly([d, a], 'n'), poly([a, d], 'n'), poly([d, c + d * 2], 'n'), poly([-d, c], 'n')].filter((o) => o !== correct),
    { why: `The difference is ${neg(d)}, so it starts ${neg(d)}n. First term − difference = ${neg(a)} − (${neg(d)}) = ${neg(c)}. nth term = <b>${correct}</b>. Check: n = 1 gives ${neg(d + c)} ✓. (Like 5, 9, 13 → 4n + 1.)` });
}

function genSequenceType() {
  const kind = pick(['Arithmetic', 'Geometric', 'Quadratic']);
  let seq;
  if (kind === 'Arithmetic') { const a = rand(1, 10), d = rand(2, 9); seq = [0, 1, 2, 3, 4].map((i) => a + i * d); }
  else if (kind === 'Geometric') { const a = rand(1, 5), r = rand(2, 4); seq = [0, 1, 2, 3, 4].map((i) => a * r ** i); }
  else { const k = rand(0, 5); seq = [1, 2, 3, 4, 5].map((n) => n * n + k); }
  const why = { Arithmetic: 'It goes up by the same amount each time (common difference).', Geometric: 'It is multiplied by the same number each time (common ratio).', Quadratic: 'The differences go up by the same amount each time — the nth term has n².' }[kind];
  return mcq(`What type of sequence is <b>${seq.join(', ')}, …</b>?`, kind, ['Arithmetic', 'Geometric', 'Quadratic'].filter((k) => k !== kind), { why: `${kind}. ${why}` });
}

const nz = () => pick([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

function genExpandDouble() {
  const a = nz(), b = nz();
  const correct = poly([1, a + b, a * b]);
  return mcq(`Expand (${poly([1, a])})(${poly([1, b])})`, correct,
    [poly([1, 0, a * b]), poly([1, -(a + b), a * b]), poly([1, a + b, -(a * b)]), poly([1, a * b, a + b]), poly([1, a + b + 1, a * b])].filter((d) => d !== correct),
    { why: `x × x = x², x × ${neg(b)} = ${poly([b, 0])}, ${neg(a)} × x = ${poly([a, 0])}, ${neg(a)} × ${neg(b)} = ${neg(a * b)}. Collect: <b>${correct}</b>. (Like (x + 2)(x + 4) = x² + 6x + 8.)` });
}

function genPerfectSquare() {
  const a = pick([-7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7]);
  const correct = poly([1, 2 * a, a * a]);
  return mcq(`Expand (${poly([1, a])})²`, correct, [poly([1, 0, a * a]), poly([1, a, a * a]), poly([1, 2 * a, -a * a]), poly([1, a * a, 2 * a])],
    { why: `Perfect square: (x + a)² = x² + 2ax + a². Here a = ${neg(a)}: 2 × ${neg(a)} = ${neg(2 * a)} and ${neg(a)}² = ${a * a}. Answer: <b>${correct}</b>. It is not just x² + ${a * a}!` });
}

function genDOTS() {
  const a = rand(2, 12);
  return mcq(`Factorise <b>x² − ${a * a}</b>`, `(x + ${a})(x − ${a})`, [`(x − ${a})²`, `(x + ${a})²`, `(x + ${a * a})(x − 1)`, `x(x − ${a * a})`],
    { why: `Difference of two squares: x² − a² = (x + a)(x − a). ${a * a} = ${a}², so the answer is <b>(x + ${a})(x − ${a})</b>.` });
}

function genFactoriseQuad() {
  let p, q;
  do { p = nz(); q = nz(); } while (p === -q);
  const [a, b] = p <= q ? [p, q] : [q, p];
  const expr = poly([1, a + b, a * b]);
  const f = (u, v) => `(${poly([1, u])})(${poly([1, v])})`;
  const correct = f(b, a);
  return mcq(`Factorise <b>${expr}</b>`, correct, [f(-a, -b), f(a + b, 1), f(-b, a), f(b, -a)].filter((o) => o !== correct && o !== f(a, b)),
    { why: `Find two numbers that <b>add</b> to ${neg(a + b)} and <b>multiply</b> to ${neg(a * b)}: ${neg(a)} and ${neg(b)}. So ${expr} = <b>${correct}</b>. (Like x² + 7x + 10 = (x + 5)(x + 2).)` });
}

function genSolveQuad() {
  let p, q;
  do { p = nz(); q = nz(); } while (p === q || p === -q);
  // roots are p and q: (x − p)(x − q) = x² − (p+q)x + pq
  const expr = poly([1, -(p + q), p * q]);
  const lo = Math.min(p, q), hi = Math.max(p, q);
  const pair = (u, v) => `x = ${neg(Math.min(u, v))} or x = ${neg(Math.max(u, v))}`;
  const correct = pair(lo, hi);
  return mcq(`Solve <b>${expr} = 0</b>`, correct, [pair(-lo, -hi), pair(lo, -hi), pair(p * q, -(p + q)), pair(-lo, hi)].filter((o) => !/x = (\S+) or x = \1$/.test(o)),
    { why: `Factorise: (${poly([1, -p])})(${poly([1, -q])}) = 0. Set each bracket = 0: x = ${neg(p)} or x = ${neg(q)}. (Like x² + 6x − 27 = 0 → (x + 9)(x − 3) = 0 → x = −9 or 3.)` });
}

// ====================================================================== the curriculum

export const MATHS = {
  id: 'maths', name: 'Maths', sub: 'Year 9', icon: '∑', color: 'var(--maths)',
  units: [
    {
      n: 1, code: 'Unit 1', title: 'Standard form, significant figures and powers',
      lessons: [
        {
          id: 'm1.1', title: 'Powers of 10 and laws of indices',
          keys: [
            '10³ = 1000, 10² = 100, 10¹ = 10, 10⁰ = 1, 10⁻¹ = 0.1, 10⁻² = 0.01, 10⁻³ = 0.001. Each step down you divide by 10.',
            '<b>Multiply</b>: add the powers. 3⁴ × 3⁶ = 3¹⁰',
            '<b>Divide</b>: subtract the powers. 7⁹ ÷ 7⁵ = 7⁴',
            '<b>Power of a power</b>: multiply the powers. (2⁴)³ = 2¹²',
            '<b>Negative power</b>: a⁻ⁿ = 1/aⁿ. 3⁻² = 1/9. <b>Power zero</b>: a⁰ = 1. 5⁰ = 1',
            '<b>Fraction</b>: (a/b)ⁿ = aⁿ/bⁿ. (3/4)² = 9/16',
          ],
          learn: [
            { title: 'The powers of 10 ladder', sim: 'powerladder', html: '<p>Each step <b>down</b> the ladder you <b>divide by 10</b>. A negative power gives a number less than 1.</p>' },
            { title: 'The laws of indices', html: '<div class="law"><span>a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup></span><small>3<sup>4</sup> × 3<sup>6</sup> = 3<sup>10</sup> — add the powers</small></div><div class="law"><span>a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup></span><small>7<sup>9</sup> ÷ 7<sup>5</sup> = 7<sup>4</sup> — subtract the powers</small></div><div class="law"><span>(a<sup>m</sup>)<sup>n</sup> = a<sup>m×n</sup></span><small>(2<sup>4</sup>)<sup>3</sup> = 2<sup>12</sup> — multiply the powers</small></div><p class="warn-box">These only work when the <b>base is the same</b>.</p>' },
            { title: 'Zero, negative and fraction powers', steps: ['<b>a⁰ = 1</b> → 5⁰ = 1', '<b>a⁻ⁿ = 1/aⁿ</b> → 3⁻² = 1/3² = <b>1/9</b>', '<b>(a/b)ⁿ = aⁿ/bⁿ</b> → (3/4)² = 3²/4² = <b>9/16</b>'], html: '<p class="ex">Why is 5⁰ = 1? Because 5³ ÷ 5³ = 5⁰, and anything divided by itself is 1.</p>' },
          ],
          practice: [genPow10, genIndexLaw, genIndexLaw, genNegativeZeroPower, genFractionPower, genIndexLaw, genPow10, genNegativeZeroPower,
            { type: 'tf', q: '5<sup>0</sup> = 0', answer: false, why: 'Power zero: a⁰ = 1, so 5⁰ = 1.' },
            mcqS('Which is equal to 3<sup>−2</sup>?', '1/9', ['−9', '−6', '9'], 'a⁻ⁿ = 1/aⁿ, so 3⁻² = 1/3² = 1/9.'), genFractionPower],
        },
        {
          id: 'm1.2', title: 'Standard form',
          keys: [
            '<b>A × 10ⁿ</b>, where <b>1 ≤ A &lt; 10</b> and n is a whole number.',
            'Big number: move the point left; the power is positive. 41000 = 4.1 × 10⁴',
            'Small number: move the point right; the power is negative. 0.00394 = 3.94 × 10⁻³',
            'Back to ordinary: positive power → move right; negative power → move left. 3 × 10⁴ = 30000',
            'Check the first number is between 1 and 10: 0.2 × 10² is wrong → 2 × 10¹',
          ],
          learn: [
            { title: 'What is standard form?', html: '<p class="big-formula">A × 10<sup>n</sup></p><p><b>1 ≤ A &lt; 10</b> (A is at least 1 but less than 10) and n is a whole number.</p><p class="ex">41 000 = 4.1 × 10<sup>4</sup> · 0.00394 = 3.94 × 10<sup>−3</sup></p>' },
            { title: 'Watch the point move', sim: 'sfmove', html: '<p>Count how many places the decimal point jumps to make a number between 1 and 10.</p>' },
            { title: 'Back to an ordinary number', steps: ['3 × 10⁴: positive power → move the point 4 places <b>right</b>', '= <b>30 000</b>', '2.5 × 10⁻³: negative power → move the point 3 places <b>left</b>', '= <b>0.0025</b>'], html: '<p class="warn-box">0.2 × 10² is <b>not</b> standard form (0.2 is less than 1). It should be 2 × 10¹.</p>' },
          ],
          practice: [genToStandardForm, genToStandardForm, genFromStandardForm, genFromStandardForm, genToStandardForm,
            mcqS('Which of these is written correctly in standard form?', '4.1 × 10<sup>4</sup>', ['41 × 10<sup>3</sup>', '0.41 × 10<sup>5</sup>', '4.1 × 100<sup>2</sup>'], 'A must be between 1 and 10, and it must be a power of 10.'),
            mcqS('0.2 × 10<sup>2</sup> should be written as…', '2 × 10<sup>1</sup>', ['2 × 10<sup>3</sup>', '0.2 × 10<sup>2</sup> is already correct', '20 × 10<sup>0</sup>'], '0.2 isn’t between 1 and 10. 0.2 × 10² = 20 = 2 × 10¹.'),
            genFromStandardForm, genToStandardForm],
        },
        {
          id: 'm1.3', title: 'Calculating with standard form',
          keys: [
            'Multiply: multiply the numbers, add the powers. (3 × 10⁷) × (2 × 10⁴) = 6 × 10¹¹',
            'Divide: divide the numbers, subtract the powers. (8 × 10⁹) ÷ (4 × 10³) = 2 × 10⁶',
            'Fix an answer: 10.8 × 10⁵ = 1.08 × 10⁶ (number ÷ 10, so power + 1)',
            'Add or subtract: change to ordinary numbers first. 5 × 10⁷ + 4 × 10⁶ = 54 000 000 = 5.4 × 10⁷',
            'Order: compare the powers first, then the first numbers.',
          ],
          learn: [
            { title: 'Multiply and divide', steps: ['(3 × 10⁷) × (2 × 10⁴)', 'Multiply the numbers: 3 × 2 = 6', 'Add the powers: 7 + 4 = 11', '= <b>6 × 10¹¹</b>', '(8 × 10⁹) ÷ (4 × 10³) = 8 ÷ 4 = 2, 9 − 3 = 6 → <b>2 × 10⁶</b>'], html: '' },
            { title: 'Fixing an answer', html: '<p>If the first number isn’t between 1 and 10, fix it:</p><p class="ex">10.8 × 10<sup>5</sup> → the number ÷ 10, so the power + 1 → <b>1.08 × 10<sup>6</sup></b></p><p class="ex">0.6 × 10<sup>4</sup> → the number × 10, so the power − 1 → <b>6 × 10<sup>3</sup></b></p>' },
            { title: 'Adding and subtracting', steps: ['5 × 10⁷ + 4 × 10⁶', 'Change to ordinary numbers: 50 000 000 + 4 000 000', '= 54 000 000', '= <b>5.4 × 10⁷</b>'], html: '<p class="warn-box">You can’t just add 5 + 4 when the powers are different.</p>' },
          ],
          practice: [genSFMultiply, genSFDivide, genSFFix, genSFAdd, genSFOrder, genSFMultiply, genSFFix, genSFDivide, genSFAdd],
        },
        {
          id: 'm1.4', title: 'Significant figures, estimating and units',
          keys: [
            'The 1st significant figure is the first digit that is <b>not zero</b>. In 0.0571 it is 5.',
            'Rounding: look at the next digit. 5 or more → round up; 4 or less → stay the same.',
            '21561 to 2 s.f. = 22000; 0.05713 to 3 s.f. = 0.0571',
            'Estimating: round every number to 1 s.f. 37 × 492 ≈ 40 × 500 = 20000',
            '1 m² = 100² cm² = 10⁴ cm² (10 000). 1 m³ = 100³ cm³ = 10⁶ cm³ (1 000 000)',
          ],
          learn: [
            { title: 'Significant figures', sim: 'sigfig', html: '<p>Start counting at the first <b>non-zero</b> digit. Zeros at the start never count.</p>' },
            { title: 'Estimating', steps: ['37 × 492', 'Round every number to 1 s.f.: 37 → 40, 492 → 500', '40 × 500 = <b>20 000</b>', 'So 37 × 492 ≈ 20 000 (the real answer is 18 204)'], html: '' },
            { title: 'Units as powers', html: '<p>1 m = 100 cm, but areas and volumes square or cube that:</p><p class="ex">1 m² = 100 cm × 100 cm = 100² cm² = 10⁴ cm² = <b>10 000 cm²</b></p><p class="ex">1 m³ = 100³ cm³ = 10⁶ cm³ = <b>1 000 000 cm³</b></p>' },
          ],
          practice: [genSigFig, genSigFig, genFirstSF, genEstimate, genSigFig, genUnitsPower, genEstimate, genUnitsPower,
            mcqS('Round 21 561 to 2 significant figures.', '22 000', ['21 000', '22', '21 600'], 'Keep 2 figures (2, 1). The next digit is 5, so round up: 22 000. Zeros keep the place value.'),
            genSigFig],
        },
      ],
    },
    {
      n: 2, code: 'Unit 2', title: '2D shapes and 3D solids',
      lessons: [
        {
          id: 'm2.1', title: 'Prisms: surface area, volume and capacity',
          keys: [
            'A <b>prism</b> has the same cross-section all the way through (cuboid, triangular prism).',
            '<b>Surface area</b>: add the area of every face. Cube with side 2 cm → 6 × 4 = 24 cm²',
            '<b>Volume of a prism</b> = cross-section area × length. Triangle ½ × 4 × 3.5 = 7, × 5 = 35 cm³',
            '<b>Capacity</b>: 1 cm³ = 1 ml; 1 litre = 1000 cm³; 1 m³ = 1000 litres',
          ],
          learn: [
            { title: 'Build a prism', sim: 'prism', html: '<p>A prism is a cross-section stretched out. Volume = <b>cross-section area × length</b>.</p>' },
            { title: 'Surface area', html: '<p>Add the area of <b>every</b> face. A cube has 6 identical square faces.</p><p class="ex">Cube with side 2 cm: each face 2 × 2 = 4 cm², 6 faces → <b>24 cm²</b></p><p class="ex">Cuboid 5 × 3 × 2: 2 × (15 + 10 + 6) = <b>62 cm²</b></p>' },
            { title: 'Capacity', html: '<table class="mini"><tr><td>1 cm³</td><td>=</td><td>1 ml</td></tr><tr><td>1000 cm³</td><td>=</td><td>1 litre</td></tr><tr><td>1 m³</td><td>=</td><td>1000 litres</td></tr></table>' },
          ],
          practice: [genSurfaceArea, genPrismVolume, genCapacity, genSurfaceArea, genPrismVolume, genCapacity,
            mcqS('Which of these is <b>not</b> a prism?', 'Sphere', ['Cuboid', 'Triangular prism', 'Cylinder'], 'A sphere doesn’t have the same cross-section all the way through.'),
            genPrismVolume],
        },
        {
          id: 'm2.2', title: 'Circles',
          keys: [
            'Diameter = 2 × radius (d = 2r)',
            '<b>Circumference</b>: C = πd or C = 2πr. d = 12 → 37.7 cm; r = 7 → 44.0 cm',
            '<b>Area</b>: A = πr² (always use the radius). r = 7 → 153.9 cm²',
            'Semicircle = ½ of a circle; quarter circle = ¼',
          ],
          learn: [
            { title: 'Radius, diameter, circumference', sim: 'circle', html: '<p>Drag the slider. The circumference is always a bit more than 3 diameters — exactly π times.</p>' },
            { title: 'The formulas', steps: ['Circumference: <b>C = πd</b> or <b>C = 2πr</b>', 'd = 12 → C = π × 12 = 37.699… = <b>37.7 cm</b>', 'Area: <b>A = πr²</b> — always use the radius', 'r = 7 → A = π × 49 = 153.938… = <b>153.9 cm²</b>'], html: '<p class="warn-box">Given a diameter for area? Halve it first: d = 10 → r = 5 → A = π × 25 = 78.5 cm².</p>' },
          ],
          practice: [genRadius, genCircumference, genCircleArea, genCircumference, genCircleArea, genCircleArea,
            mcqS('A circle has radius 7 cm. What is its area (1 d.p.)?', '153.9 cm²', ['44.0 cm²', '43.98 cm²', '21.99 cm²'], 'A = πr² = π × 49 = 153.9 cm². (44.0 is the circumference.)'),
            genCircumference],
        },
        {
          id: 'm2.3', title: 'Cylinders',
          keys: [
            'A cylinder is a prism with a circle cross-section.',
            '<b>Volume</b>: V = πr²h. r = 5, h = 9 → 706.9 cm³',
            '<b>Surface area</b>: SA = 2πr² + 2πrh. r = 3, h = 8 → 207.3 cm²',
            '2πr² = the two circle ends; 2πrh = the curved surface (a rectangle when unrolled).',
          ],
          learn: [
            { title: 'Unroll a cylinder', sim: 'cylinder', html: '<p>The curved surface unrolls into a rectangle: its width is the circumference 2πr and its height is h.</p>' },
            { title: 'Worked examples', steps: ['Volume, r = 5, h = 9: V = π × 5² × 9 = π × 225', '= 706.858… = <b>706.9 cm³</b>', 'Surface area, r = 3, h = 8: 2π × 3² + 2π × 3 × 8', '= 56.55… + 150.80… = <b>207.3 cm²</b>'], html: '' },
          ],
          practice: [genCylinder, genCylinder, genCylinder, genCylinder,
            mcqS('Which part of SA = 2πr² + 2πrh is the curved surface?', '2πrh', ['2πr²', 'πr²h', 'πd'], 'Unrolled, the curved surface is a rectangle 2πr wide and h tall.'),
            genCylinder, genCylinder],
        },
        {
          id: 'm2.4', title: 'Pythagoras’ theorem',
          keys: [
            'Only for <b>right-angled</b> triangles. c = the hypotenuse, the <b>longest</b> side (opposite the right angle).',
            'Long side: <b>c² = a² + b²</b>. 3, 4 → c = 5',
            'Short side: <b>a² = c² − b²</b>. 13, 5 → a = 12',
          ],
          learn: [
            { title: 'Squares on the sides', sim: 'pythag', html: '<p>The two small squares always add up to the big square on the hypotenuse.</p>' },
            { title: 'Long side or short side?', steps: ['Finding the <b>hypotenuse</b>? <b>Add</b> the squares.', '3, 4 → c² = 9 + 16 = 25 → c = <b>5</b>', 'Finding a <b>shorter side</b>? <b>Subtract</b> the squares.', '13, 5 → a² = 169 − 25 = 144 → a = <b>12</b>'], html: '<p class="warn-box">Check: the hypotenuse must be the longest side.</p>' },
          ],
          practice: [genPythagoras, genPythagoras, genPythagoras, genPythagoras,
            mcqS('In a right-angled triangle, which side is the hypotenuse?', 'The longest side, opposite the right angle', ['The shortest side', 'The side next to the right angle', 'Any side'], 'c is always the longest side.'),
            genPythagoras, genPythagoras],
        },
      ],
    },
    {
      n: 3, code: 'Unit 3', title: 'Expressions (3.1–3.4)',
      lessons: [
        {
          id: 'm3.1', title: 'Expressions, formulae, equations and identities',
          keys: [
            '<b>Expression</b>: no equals sign. 3x + 4y',
            '<b>Formula</b>: a rule linking variables. P = 4t + 5',
            '<b>Equation</b>: true only for some values. 2x + 5 = 11 → x = 3',
            '<b>Identity</b> (≡): true for every value. x + x + 5 ≡ 2x + 5',
          ],
          learn: [
            { title: 'Four words to know', html: '<table class="mini"><tr><th>Word</th><th>Example</th><th>Meaning</th></tr><tr><td>Expression</td><td>3x + 4y</td><td>No equals sign</td></tr><tr><td>Formula</td><td>P = 4t + 5</td><td>A rule linking variables</td></tr><tr><td>Equation</td><td>2x + 5 = 11</td><td>True only for some values (x = 3)</td></tr><tr><td>Identity</td><td>x + x + 5 ≡ 2x + 5</td><td>True for every value</td></tr></table>' },
            { title: 'Solving an equation', steps: ['2x + 5 = 11', 'Subtract 5 from both sides: 2x = 6', 'Divide both sides by 2: <b>x = 3</b>', 'Check: 2 × 3 + 5 = 11 ✓'], html: '' },
          ],
          practice: [genClassify, genClassify, genClassify, genSolveLinear, genClassify, genSolveLinear,
            mcqS('What does the symbol ≡ mean?', 'Identical — true for every value', ['Approximately equal', 'Not equal', 'Only true for one value'], 'x + x + 5 ≡ 2x + 5 is an identity.'),
            genClassify],
        },
        {
          id: 'm3.2', title: 'Multiplying and dividing terms',
          keys: [
            'Multiply terms: multiply the numbers, <b>add</b> the powers. 3x³y × 5xy² = 15x⁴y³',
            'Divide terms: divide the numbers, <b>subtract</b> the powers. 20x⁵ ÷ 4x⁸ = 5x⁻³ = 5/x³',
            'A letter with no power has power 1: x = x¹.',
          ],
          learn: [
            { title: 'Multiplying terms', steps: ['3x³y × 5xy²', 'Numbers: 3 × 5 = 15', 'x: x³ × x¹ = x⁴ (add 3 + 1)', 'y: y¹ × y² = y³ (add 1 + 2)', '= <b>15x⁴y³</b>'], html: '' },
            { title: 'Dividing terms', steps: ['20x⁵ ÷ 4x⁸', 'Numbers: 20 ÷ 4 = 5', 'Powers: 5 − 8 = −3 → x⁻³', '= 5x⁻³ = <b>5/x³</b>'], html: '<p>Remember a⁻ⁿ = 1/aⁿ from Unit 1.</p>' },
          ],
          practice: [genMultiplyTerms, genDivideTerms, genMultiplyTerms, genDivideTerms, genMultiplyTerms, genDivideTerms,
            mcqS('Simplify 3x³y × 5xy²', '15x<sup>4</sup>y<sup>3</sup>', ['8x<sup>4</sup>y<sup>3</sup>', '15x<sup>3</sup>y<sup>2</sup>', '15x<sup>4</sup>y<sup>2</sup>'], 'Multiply the numbers (15), add the powers: x³⁺¹ = x⁴, y¹⁺² = y³.'),
            genMultiplyTerms],
        },
        {
          id: 'm3.3', title: 'Expanding brackets',
          keys: [
            'Expand: multiply <b>every</b> term inside the bracket. 2p(4 + 5p + p²) = 8p + 10p² + 2p³',
            'Watch the signs: −3(p + 2) = −3p − 6',
            'Expand and simplify: collect like terms (same letters <b>and</b> same powers).',
            '3(x + 5) + 4(x − 1) = 3x + 15 + 4x − 4 = 7x + 11',
          ],
          learn: [
            { title: 'Every term gets multiplied', sim: 'expand', html: '<p>The term outside multiplies <b>each</b> term inside.</p>' },
            { title: 'Signs', html: '<p class="ex">−3(p + 2) = −3 × p + (−3) × 2 = <b>−3p − 6</b></p><p class="ex">−2(x − 4) = −2x + 8 (negative × negative = positive)</p>' },
            { title: 'Expand and simplify', steps: ['3(x + 5) + 4(x − 1)', 'Expand each bracket: 3x + 15 + 4x − 4', 'Collect x terms: 3x + 4x = 7x', 'Collect numbers: 15 − 4 = 11', '= <b>7x + 11</b>'], html: '<p class="warn-box">Like terms have the same letters <b>and</b> the same powers: 3x and 4x are like terms; 3x and 3x² are not.</p>' },
          ],
          practice: [genExpandSingle, genExpandSingle, genExpandSimplify, genExpandSingle, genExpandSimplify,
            mcqS('Expand 2p(4 + 5p + p²)', '8p + 10p² + 2p³', ['8p + 5p + p²', '8 + 10p + 2p²', '8p + 10p + 2p²'], '2p × 4 = 8p, 2p × 5p = 10p², 2p × p² = 2p³.'),
            mcqS('Expand −3(p + 2)', '−3p − 6', ['−3p + 6', '−3p + 2', '3p − 6'], 'Multiply both terms by −3: −3 × p = −3p and −3 × 2 = −6.'),
            genExpandSimplify],
        },
        {
          id: 'm3.4', title: 'HCF and factorising',
          keys: [
            '<b>HCF</b>: the biggest number + the lowest power of each shared letter. HCF of 12xy³ and 8x²y² = 4xy²',
            '<b>Factorise completely</b>: take out the HCF. 4x² + 12x = 4x(x + 3)',
            '12xy³ + 8x²y² = 4xy²(3y + 2x)',
            'Check by expanding back.',
          ],
          learn: [
            { title: 'Finding the HCF', steps: ['12xy³ and 8x²y²', 'Biggest number that divides 12 and 8: <b>4</b>', 'Lowest power of x: x¹ and x² → <b>x</b>', 'Lowest power of y: y³ and y² → <b>y²</b>', 'HCF = <b>4xy²</b>'], html: '' },
            { title: 'Factorising completely', steps: ['4x² + 12x', 'HCF of 4x² and 12x is 4x', '4x² ÷ 4x = x and 12x ÷ 4x = 3', '= <b>4x(x + 3)</b>', 'Check: 4x(x + 3) = 4x² + 12x ✓'], html: '<p class="warn-box">2(2x² + 6x) is factorised, but <b>not completely</b> — there’s still a common factor inside.</p>' },
          ],
          practice: [genHCF, genFactorise, genHCF, genFactorise, genFactorise,
            mcqS('Factorise completely 12xy³ + 8x²y²', '4xy²(3y + 2x)', ['4xy(3y² + 2xy)', '2xy²(6y + 4x)', '4x²y³(3 + 2)'], 'HCF = 4xy². 12xy³ ÷ 4xy² = 3y and 8x²y² ÷ 4xy² = 2x.'),
            genHCF, genFactorise],
        },
      ],
    },
    {
      n: 4, code: 'For later', title: 'Quadratics',
      lessons: [
        {
          id: 'mq.1', title: 'Sequences',
          keys: [
            'Arithmetic sequence nth term = dn + (first term − d). 5, 9, 13 → 4n + 1',
            'Quadratic sequence: the nth term has n².',
            'Geometric: multiply by the same number each time (common ratio).',
          ],
          learn: [
            { title: 'Find the nth term', sim: 'sequence', html: '<p>The difference d tells you the “d n”. Then adjust with the first term − d.</p>' },
            { title: 'Three kinds of sequence', html: '<table class="mini"><tr><td>Arithmetic</td><td>5, 9, 13, 17</td><td>+4 each time</td></tr><tr><td>Geometric</td><td>3, 6, 12, 24</td><td>× 2 each time</td></tr><tr><td>Quadratic</td><td>1, 4, 9, 16</td><td>nth term has n²</td></tr></table>' },
          ],
          practice: [genNthTerm, genSequenceType, genNthTerm, genSequenceType, genNthTerm, genNthTerm],
        },
        {
          id: 'mq.2', title: 'Double brackets and special products',
          keys: [
            'Double brackets: (x + 2)(x + 4) = x² + 6x + 8',
            'Perfect square: (x + a)² = x² + 2ax + a²',
            'Difference of two squares: x² − a² = (x + a)(x − a)',
          ],
          learn: [
            { title: 'The grid method', sim: 'grid', html: '<p>Each box is one multiplication. Add the four boxes and collect like terms.</p>' },
            { title: 'Special products', html: '<p class="ex">(x + 3)² = (x + 3)(x + 3) = <b>x² + 6x + 9</b> — don’t forget the middle term!</p><p class="ex">x² − 25 = <b>(x + 5)(x − 5)</b> — the middle terms cancel out.</p>' },
          ],
          practice: [genExpandDouble, genExpandDouble, genPerfectSquare, genDOTS, genExpandDouble, genPerfectSquare, genDOTS],
        },
        {
          id: 'mq.3', title: 'Factorising and solving quadratics',
          keys: [
            'Factorise x² + bx + c: find two numbers that <b>add</b> to b and <b>multiply</b> to c. x² + 7x + 10 = (x + 5)(x + 2)',
            'Solve: make it = 0, factorise, set each bracket = 0. x² + 6x − 27 = 0 → x = −9 or 3',
          ],
          learn: [
            { title: 'Factorising', steps: ['x² + 7x + 10', 'Two numbers that multiply to 10 and add to 7', '5 × 2 = 10 and 5 + 2 = 7 ✓', '= <b>(x + 5)(x + 2)</b>'], html: '' },
            { title: 'Solving', steps: ['x² + 6x − 27 = 0', 'Multiply to −27, add to 6: 9 and −3', '(x + 9)(x − 3) = 0', 'x + 9 = 0 → x = −9;  x − 3 = 0 → x = 3', '<b>x = −9 or x = 3</b>'], html: '' },
          ],
          practice: [genFactoriseQuad, genFactoriseQuad, genSolveQuad, genFactoriseQuad, genSolveQuad, genSolveQuad],
        },
      ],
    },
  ],
};

export const _test = { genPow10, genIndexLaw, genNegativeZeroPower, genFractionPower, genToStandardForm, genFromStandardForm, genSFMultiply,
  genSFDivide, genSFFix, genSFAdd, genSFOrder, genSigFig, genFirstSF, genEstimate, genUnitsPower, genSurfaceArea, genPrismVolume, genCapacity,
  genCircumference, genCircleArea, genRadius, genCylinder, genPythagoras, genClassify, genSolveLinear, genMultiplyTerms, genDivideTerms,
  genExpandSingle, genExpandSimplify, genHCF, genFactorise, genNthTerm, genSequenceType, genExpandDouble, genPerfectSquare, genDOTS,
  genFactoriseQuad, genSolveQuad };
