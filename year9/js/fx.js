// Visual and sound effects. Everything respects "reduce motion" and the sound setting.

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let soundOn = true;
export const setSound = (on) => { soundOn = on; };

// ---------- confetti ----------
let canvas, ctx, parts = [], raf = 0;
export function confetti(amount = 120, origin = { x: 0.5, y: 0.35 }) {
  if (reduced()) return;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    document.body.append(canvas);
    ctx = canvas.getContext('2d');
  }
  const dpr = devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = ['#7c5cff', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
  for (let i = 0; i < amount; i++) {
    const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
    parts.push({ x: innerWidth * origin.x, y: innerHeight * origin.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6,
      r: 4 + Math.random() * 5, c: colors[i % colors.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 0 });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life < 160 && p.y < innerHeight + 40);
  for (const p of parts) {
    p.life++; p.vy += 0.28; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, 1 - p.life / 160);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
    ctx.restore();
  }
  raf = parts.length ? requestAnimationFrame(tick) : 0;
  if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
}

// ---------- floating "+10 XP" ----------
export function floatText(text, el, cls = '') {
  const r = el.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = `float-text ${cls}`;
  f.textContent = text;
  f.style.left = `${r.left + r.width / 2}px`;
  f.style.top = `${r.top}px`;
  document.body.append(f);
  setTimeout(() => f.remove(), 1200);
}

// ---------- count-up numbers ----------
export function countUp(el, to, ms = 900, suffix = '') {
  if (!el) return;
  if (reduced()) { el.textContent = to + suffix; return; }
  const start = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - start) / ms);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suffix;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- sounds (generated, no files) ----------
let ac;
function tone(freq, start, dur, type = 'sine', gain = 0.12) {
  ac ||= new (window.AudioContext || window.webkitAudioContext)();
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
  o.connect(g).connect(ac.destination);
  o.start(ac.currentTime + start);
  o.stop(ac.currentTime + start + dur + 0.05);
}
export function sound(kind) {
  if (!soundOn) return;
  try {
    if (kind === 'correct') { tone(660, 0, 0.12); tone(880, 0.09, 0.18); }
    else if (kind === 'wrong') { tone(220, 0, 0.18, 'triangle'); tone(180, 0.12, 0.22, 'triangle'); }
    else if (kind === 'combo') { [660, 830, 990, 1320].forEach((f, i) => tone(f, i * 0.06, 0.12)); }
    else if (kind === 'finish') { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.1)); }
    else if (kind === 'tap') tone(440, 0, 0.05, 'sine', 0.05);
  } catch { /* audio not available */ }
}
