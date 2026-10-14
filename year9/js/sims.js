// Interactive, animated mini-simulations used inside lessons.
// Each sim(el, slide) renders into el and returns a cleanup function.

import { poly } from './content-maths.js';
import { CHAPTERS } from './content-english.js';
import { EVENTS } from './content-history.js';
import { shiftDecimal, prettyNum, roundSF } from './engine.js';

const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (el, s) => el.querySelector(s);
const html = (el, s) => { el.innerHTML = s; return el; };
const r1 = (x) => (Math.round(x * 10) / 10).toFixed(1);

function canvas(el, height) {
  const cv = document.createElement('canvas');
  const w = Math.min(el.clientWidth || 320, 640);
  const dpr = devicePixelRatio || 1;
  cv.width = w * dpr; cv.height = height * dpr;
  cv.style.width = `${w}px`; cv.style.height = `${height}px`;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  el.append(cv);
  return { ctx, w, h: height };
}

function loop(fn) {
  let id = 0, last = performance.now(), alive = true;
  const step = (t) => { if (!alive) return; fn(Math.min(0.05, (t - last) / 1000), t); last = t; id = requestAnimationFrame(step); };
  id = requestAnimationFrame(step);
  return () => { alive = false; cancelAnimationFrame(id); };
}

function timers() {
  const list = [];
  return { add: (id) => list.push(id), clear: () => list.forEach((t) => { clearTimeout(t); clearInterval(t); }) };
}

// ===================================================================== MATHS

function powerladder(el) {
  const rows = [3, 2, 1, 0, -1, -2, -3];
  let i = 0;
  html(el, `<div class="ladder">${rows.map((n, k) => `<div class="rung" data-k="${k}"><span>10<sup>${String(n).replace('-', '−')}</sup></span><b>${n >= 0 ? prettyNum(String(10 ** n)) : shiftDecimal('1', n)}</b>${k < rows.length - 1 ? '<em>÷ 10</em>' : ''}</div>`).join('')}</div>
    <div class="sim-row center"><button class="btn small" id="up">▲ × 10</button><button class="btn small" id="dn">▼ ÷ 10</button></div><p class="sim-out" id="lo"></p>`);
  const draw = () => {
    el.querySelectorAll('.rung').forEach((r, k) => r.classList.toggle('on', k === i));
    const n = rows[i];
    $(el, '#lo').innerHTML = n > 0 ? `10<sup>${n}</sup> = ${prettyNum(String(10 ** n))} — 1 followed by ${n} zero${n > 1 ? 's' : ''}.`
      : n === 0 ? '10<sup>0</sup> = 1 — anything to the power 0 is 1.'
      : `10<sup>−${-n}</sup> = 1/10<sup>${-n}</sup> = ${shiftDecimal('1', n)} — a negative power gives a number <b>less than 1</b>.`;
  };
  $(el, '#up').addEventListener('click', () => { i = Math.max(0, i - 1); draw(); });
  $(el, '#dn').addEventListener('click', () => { i = Math.min(rows.length - 1, i + 1); draw(); });
  draw();
  return () => {};
}

function sfmove(el) {
  const presets = ['41000', '4500000', '93000000', '0.00394', '0.05', '0.000301'];
  html(el, `<div class="chips-row">${presets.map((p) => `<button class="chip-btn" data-n="${p}">${prettyNum(p)}</button>`).join('')}</div>
    <div class="digits" id="dg"></div><p class="sim-out" id="so">Tap a number.</p>`);
  let timer = 0;
  const run = (num) => {
    clearInterval(timer);
    el.querySelectorAll('[data-n]').forEach((b) => b.classList.toggle('on', b.dataset.n === num));
    const [int, dec = ''] = num.split('.');
    const big = int !== '0';
    const digits = big ? int : dec;
    const lead = big ? 0 : dec.match(/^0*/)[0].length;
    let pos = big ? int.length : 0;
    const target = big ? 1 : lead + 1;
    let moves = 0;
    const render = () => {
      $(el, '#dg').innerHTML = (big ? '' : '<span class="d zero">0</span>') +
        [...digits].map((d, i) => `${i === pos ? '<span class="pt">.</span>' : ''}<span class="d ${i < lead ? 'zero' : ''}">${d}</span>`).join('') +
        (pos >= digits.length ? '<span class="pt">.</span>' : '');
      $(el, '#so').innerHTML = `Jumps: <b>${moves}</b> ${big ? '← left' : 'right →'}`;
    };
    render();
    timer = setInterval(() => {
      if (pos === target) {
        clearInterval(timer);
        const n = big ? moves : -moves;
        $(el, '#so').innerHTML = `${prettyNum(num)} = <b>${shiftDecimal(num, -n)} × 10<sup>${String(n).replace('-', '−')}</sup></b> — ${big ? 'big number, positive power' : 'small number, negative power'}`;
        return;
      }
      pos += big ? -1 : 1; moves++;
      render();
    }, reduced() ? 60 : 480);
  };
  el.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => run(b.dataset.n)));
  run('41000');
  return () => clearInterval(timer);
}

function sigfig(el) {
  const presets = [['21561', 2], ['0.05713', 3], ['37', 1], ['492', 1], ['0.0571', 2], ['8.0472', 3]];
  html(el, `<div class="chips-row">${presets.map(([p, n], i) => `<button class="chip-btn" data-i="${i}">${p} → ${n} s.f.</button>`).join('')}</div>
    <div class="digits sf" id="sd"></div><p class="sim-out" id="sfo"></p>`);
  const show = (x, n) => {
    let count = 0, started = false;
    $(el, '#sd').innerHTML = [...x].map((ch) => {
      if (ch === '.') return '<span class="pt">.</span>';
      if (!started && ch === '0') return '<span class="d zero" title="leading zero — not significant">0</span>';
      started = true; count++;
      const cls = count <= n ? 'keep' : count === n + 1 ? 'decider' : 'drop';
      return `<span class="d ${cls}" style="--d:${count}">${ch}<small>${count <= n ? count : count === n + 1 ? 'next' : ''}</small></span>`;
    }).join('');
    const digits = x.replace('.', '').replace(/^0+/, '');
    const next = Number(digits[n] ?? 0);
    $(el, '#sfo').innerHTML = `Keep <b>${n}</b> figure${n > 1 ? 's' : ''} (green). Next digit is <b>${next}</b> → ${next >= 5 ? 'round <b>up</b>' : 'stays the same'}.<br>${prettyNum(x)} to ${n} s.f. = <b>${prettyNum(roundSF(x, n))}</b>`;
  };
  el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => {
    el.querySelectorAll('[data-i]').forEach((x) => x.classList.toggle('on', x === b));
    show(...presets[b.dataset.i]);
  }));
  el.querySelector('[data-i]').click();
  return () => {};
}

function prism(el) {
  html(el, `<div class="sim-grid"><label>Base <b id="pbv">4</b> cm<input type="range" id="pb" min="2" max="8" value="4"></label>
    <label>Height <b id="phv">3.5</b> cm<input type="range" id="ph" min="1" max="7" step="0.5" value="3.5"></label>
    <label>Length <b id="plv">5</b> cm<input type="range" id="pl" min="1" max="10" value="5"></label></div>
    <svg viewBox="0 0 320 200" class="sim-svg prism" id="ps"></svg><p class="sim-out" id="po"></p>`);
  const draw = () => {
    const b = Number($(el, '#pb').value), h = Number($(el, '#ph').value), L = Number($(el, '#pl').value);
    $(el, '#pbv').textContent = b; $(el, '#phv').textContent = h; $(el, '#plv').textContent = L;
    const s = 16, ox = 40, oy = 175, dx = L * 12, dy = -L * 7;
    const F = [[ox, oy], [ox + b * s, oy], [ox + (b * s) / 2, oy - h * s]];
    const B = F.map(([x, y]) => [x + dx, y + dy]);
    const pts = (a) => a.map((p) => p.join(',')).join(' ');
    let slices = '';
    for (let k = 1; k < L; k++) {
      const t = k / L;
      slices += `<polygon class="slice" style="--d:${k}" points="${pts(F.map(([x, y]) => [x + dx * t, y + dy * t]))}"/>`;
    }
    $(el, '#ps').innerHTML = `<polygon class="face back" points="${pts(B)}"/>
      <polygon class="face side" points="${pts([F[1], B[1], B[2], F[2]])}"/><polygon class="face side" points="${pts([F[0], B[0], B[1], F[1]])}"/>
      ${slices}<polygon class="face front" points="${pts(F)}"/>
      <text x="${ox + (b * s) / 2}" y="${oy + 16}" text-anchor="middle" class="small">${b} cm</text>
      <text x="${(F[1][0] + B[1][0]) / 2 + 8}" y="${(F[1][1] + B[1][1]) / 2 + 12}" class="small">${L} cm</text>`;
    const A = (b * h) / 2;
    $(el, '#po').innerHTML = `Cross-section = ½ × ${b} × ${h} = <b>${A} cm²</b><br>Volume = ${A} × ${L} = <b>${A * L} cm³</b>`;
  };
  el.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
  return () => {};
}

function circle(el) {
  html(el, `<div class="sim-row"><label>Radius <b id="crv">7</b> cm</label><input type="range" id="cr" min="1" max="10" value="7"></div>
    <svg viewBox="0 0 320 170" class="sim-svg circ" id="cs"></svg><p class="sim-out" id="co"></p>`);
  const draw = () => {
    const r = Number($(el, '#cr').value);
    $(el, '#crv').textContent = r;
    const R = 7 * r, cx = 85, cy = 80;
    const C = 2 * Math.PI * r, A = Math.PI * r * r;
    const scale = 140 / (2 * Math.PI * 10);
    $(el, '#cs').innerHTML = `<circle cx="${cx}" cy="${cy}" r="${R}" class="disc"/><circle cx="${cx}" cy="${cy}" r="${R}" class="rim" style="--len:${2 * Math.PI * R}"/>
      <line x1="${cx}" y1="${cy}" x2="${cx + R}" y2="${cy}" class="radius"/><text x="${cx + R / 2}" y="${cy - 5}" text-anchor="middle" class="small">r = ${r}</text>
      <line x1="${cx - R}" y1="${cy + R + 8}" x2="${cx + R}" y2="${cy + R + 8}" class="diam"/><text x="${cx}" y="${cy + R + 20}" text-anchor="middle" class="small">d = ${2 * r}</text>
      <text x="175" y="30" class="small">Circumference unrolled:</text><line x1="175" y1="45" x2="${175 + C * scale}" y2="45" class="unroll"/>
      ${[0, 1, 2].map((k) => `<line x1="${175 + k * 2 * r * scale}" y1="58" x2="${175 + (k + 1) * 2 * r * scale - 2}" y2="58" class="diam"/>`).join('')}
      <text x="175" y="75" class="small">3 diameters — a little short!</text>`;
    $(el, '#co').innerHTML = `C = 2πr = 2 × π × ${r} = <b>${r1(C)} cm</b> · A = πr² = π × ${r * r} = <b>${r1(A)} cm²</b><br><span class="muted">C ÷ d = π = 3.14159… for every circle.</span>`;
  };
  $(el, '#cr').addEventListener('input', draw);
  draw();
  return () => {};
}

function cylinder(el) {
  html(el, `<div class="sim-grid"><label>Radius <b id="yrv">3</b> cm<input type="range" id="yr" min="1" max="6" value="3"></label>
    <label>Height <b id="yhv">8</b> cm<input type="range" id="yh" min="2" max="10" value="8"></label></div>
    <div class="sim-row center"><button class="btn small" id="unroll">Unroll the label</button></div>
    <svg viewBox="0 0 320 200" class="sim-svg cyl" id="ys"></svg><p class="sim-out" id="yo"></p>`);
  let open = false;
  const draw = () => {
    const r = Number($(el, '#yr').value), h = Number($(el, '#yh').value);
    $(el, '#yrv').textContent = r; $(el, '#yhv').textContent = h;
    const R = r * 9, H = h * 14, cx = 70, top = 20;
    const W = Math.min(200, 2 * Math.PI * R * 0.5);
    $(el, '#ys').innerHTML = `<g class="${open ? 'faded' : ''}"><rect x="${cx - R}" y="${top}" width="${2 * R}" height="${H}" class="label"/>
      <ellipse cx="${cx}" cy="${top + H}" rx="${R}" ry="${R / 3}" class="end"/><ellipse cx="${cx}" cy="${top}" rx="${R}" ry="${R / 3}" class="end top"/></g>
      <g class="net ${open ? 'show' : ''}"><rect x="${150}" y="${top}" width="${W}" height="${H}" class="label"/>
      <text x="${150 + W / 2}" y="${top + H + 14}" text-anchor="middle" class="small">width = 2πr = ${r1(2 * Math.PI * r)} cm</text>
      <text x="${150 + W + 4}" y="${top + H / 2}" class="small">h</text></g>`;
    const V = Math.PI * r * r * h, ends = 2 * Math.PI * r * r, curved = 2 * Math.PI * r * h;
    $(el, '#yo').innerHTML = `V = πr²h = π × ${r * r} × ${h} = <b>${r1(V)} cm³</b><br>SA = 2πr² + 2πrh = ${r1(ends)} + ${r1(curved)} = <b>${r1(ends + curved)} cm²</b>`;
  };
  el.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  $(el, '#unroll').addEventListener('click', () => { open = !open; $(el, '#unroll').textContent = open ? 'Roll it back' : 'Unroll the label'; draw(); });
  draw();
  return () => {};
}

function pythag(el) {
  html(el, `<div class="sim-grid"><label>a = <b id="av">3</b><input type="range" id="a" min="1" max="8" value="3"></label>
    <label>b = <b id="bv">4</b><input type="range" id="b" min="1" max="8" value="4"></label></div>
    <svg viewBox="0 0 320 260" class="sim-svg pyth" id="ys"></svg><p class="sim-out" id="yo"></p>`);
  const draw = () => {
    const a = Number($(el, '#a').value), b = Number($(el, '#b').value), c = Math.hypot(a, b);
    $(el, '#av').textContent = a; $(el, '#bv').textContent = b;
    const s = 130 / Math.max(a + b, 8);
    const O = [110, 150], A = [110, 150 - a * s], B = [110 + b * s, 150];
    const p = (arr) => arr.map((q) => q.join(',')).join(' ');
    const sqA = [O, A, [A[0] - a * s, A[1]], [O[0] - a * s, O[1]]];
    const sqB = [O, B, [B[0], B[1] + b * s], [O[0], O[1] + b * s]];
    const v = [B[0] - A[0], B[1] - A[1]], nrm = [v[1], -v[0]];
    const sqC = [A, B, [B[0] + nrm[0], B[1] + nrm[1]], [A[0] + nrm[0], A[1] + nrm[1]]];
    $(el, '#ys').innerHTML = `<polygon class="sq sa" points="${p(sqA)}"/><polygon class="sq sb" points="${p(sqB)}"/><polygon class="sq sc" points="${p(sqC)}"/>
      <polygon class="tri" points="${p([O, A, B])}"/><rect x="${O[0]}" y="${O[1] - 8}" width="8" height="8" class="right"/>
      <text x="${O[0] - (a * s) / 2}" y="${O[1] - (a * s) / 2 + 4}" text-anchor="middle">${a * a}</text>
      <text x="${O[0] + (b * s) / 2}" y="${O[1] + (b * s) / 2 + 4}" text-anchor="middle">${b * b}</text>
      <text x="${(A[0] + B[0]) / 2 + nrm[0] / 2}" y="${(A[1] + B[1]) / 2 + nrm[1] / 2 + 4}" text-anchor="middle">${a * a + b * b}</text>`;
    $(el, '#yo').innerHTML = `a² + b² = ${a * a} + ${b * b} = <b>${a * a + b * b}</b> = c²<br>c = √${a * a + b * b} = <b>${Number.isInteger(c) ? c : `${r1(c)} (1 d.p.)`}</b>${Number.isInteger(c) ? ' — a whole number!' : ''}`;
  };
  el.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
  return () => {};
}

function expand(el) {
  const ex = [
    { out: '2p', ins: ['4', '+ 5p', '+ p²'], prods: ['8p', '+ 10p²', '+ 2p³'] },
    { out: '−3', ins: ['p', '+ 2'], prods: ['−3p', '− 6'] },
    { out: '4x', ins: ['x', '+ 3'], prods: ['4x²', '+ 12x'] },
  ];
  const t = timers();
  html(el, `<div class="chips-row">${ex.map((e, i) => `<button class="chip-btn" data-i="${i}">${e.out}(${e.ins.join(' ')})</button>`).join('')}</div>
    <div class="expand-stage" id="es"></div>`);
  const play = (i) => {
    t.clear();
    el.querySelectorAll('[data-i]').forEach((b) => b.classList.toggle('on', Number(b.dataset.i) === i));
    const e = ex[i];
    $(el, '#es').innerHTML = `<div class="ex-line"><span class="ex-out">${e.out}</span>(${e.ins.map((x, k) => `<span class="ex-in" data-k="${k}">${x}</span>`).join(' ')})</div>
      <div class="ex-line result">= ${e.prods.map((x, k) => `<span class="ex-prod" data-k="${k}">${x}</span>`).join(' ')}</div>`;
    e.ins.forEach((_, k) => t.add(setTimeout(() => {
      el.querySelectorAll('.ex-in').forEach((x) => x.classList.toggle('hit', Number(x.dataset.k) === k));
      el.querySelector(`.ex-prod[data-k="${k}"]`)?.classList.add('show');
    }, (reduced() ? 50 : 700) * (k + 1))));
  };
  el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => play(Number(b.dataset.i))));
  play(0);
  return t.clear;
}

function grid(el) {
  html(el, `<div class="sim-grid"><label>(x + <b id="ga">2</b>)<input type="range" id="a" min="-6" max="6" value="2"></label>
    <label>(x + <b id="gb">4</b>)<input type="range" id="b" min="-6" max="6" value="4"></label></div>
    <div class="gridm" id="gm"></div><p class="sim-out" id="go"></p>`);
  const draw = () => {
    const a = Number($(el, '#a').value), b = Number($(el, '#b').value);
    $(el, '#ga').textContent = a; $(el, '#gb').textContent = b;
    const s = (n) => (n < 0 ? `− ${-n}` : `+ ${n}`);
    $(el, '#gm').innerHTML = `<div></div><div class="gh">x</div><div class="gh">${s(b)}</div>
      <div class="gh">x</div><div class="gc pop" style="--d:0">x²</div><div class="gc pop" style="--d:1">${poly([b, 0])}</div>
      <div class="gh">${s(a)}</div><div class="gc pop" style="--d:2">${poly([a, 0])}</div><div class="gc pop" style="--d:3">${String(a * b).replace('-', '−')}</div>`;
    $(el, '#go').innerHTML = `(${poly([1, a])})(${poly([1, b])}) = <b>${poly([1, a + b, a * b])}</b>${a === -b ? ' — difference of two squares!' : a === b ? ' — a perfect square!' : ''}`;
  };
  el.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => { if (i.value === '0') i.value = '1'; draw(); }));
  draw();
  return () => {};
}

function sequence(el) {
  html(el, `<div class="sim-grid"><label>First term <b id="fa">5</b><input type="range" id="a" min="-5" max="12" value="5"></label>
    <label>Difference d <b id="fd">4</b><input type="range" id="d" min="-5" max="8" value="4"></label></div>
    <div class="seq" id="sq"></div><p class="sim-out" id="so"></p>`);
  const draw = () => {
    const a = Number($(el, '#a').value), d = Number($(el, '#d').value) || 1;
    $(el, '#fa').textContent = a; $(el, '#fd').textContent = d;
    const terms = [0, 1, 2, 3, 4].map((k) => a + k * d);
    $(el, '#sq').innerHTML = terms.map((v, k) => `<span class="term" style="--d:${k}">${String(v).replace('-', '−')}</span>${k < 4 ? `<span class="jump">${d > 0 ? '+' : '−'}${Math.abs(d)}</span>` : ''}`).join('');
    $(el, '#so').innerHTML = `nth term = dn + (first − d) = ${d}n + (${a} − ${d < 0 ? `(${d})` : d}) = <b>${poly([d, a - d], 'n')}</b>`.replace(/-/g, '−');
  };
  el.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
  return () => {};
}

// ===================================================================== SCIENCE 8D

function bacterium(el) {
  const parts = {
    capsule: ['Slimy capsule', 'Protects the bacterium.'],
    wall: ['Cell wall', 'Protects the cell and gives it shape.'],
    membrane: ['Cell membrane', 'Controls what goes in and out.'],
    cyto: ['Cytoplasm', 'Jelly where the cell’s reactions happen.'],
    chromo: ['Circular chromosome', 'Carries the genes. (No nucleus!)'],
    plasmid: ['Plasmids', 'Small loops of extra genes.'],
    flag: ['Flagellum', 'A tail that spins for movement.'],
  };
  html(el, `<svg viewBox="0 0 320 170" class="sim-svg bact">
    <path data-p="flag" class="part flag" d="M262 85 C 280 60, 295 110, 312 80"/>
    <rect data-p="capsule" class="part capsule" x="40" y="35" width="225" height="100" rx="50"/>
    <rect data-p="wall" class="part wall" x="50" y="45" width="205" height="80" rx="40"/>
    <rect data-p="membrane" class="part membrane" x="57" y="52" width="191" height="66" rx="33"/>
    <rect data-p="cyto" class="part cyto" x="60" y="55" width="185" height="60" rx="30"/>
    <path data-p="chromo" class="part chromo" d="M110 85 c 0 -18 50 -18 50 0 c 0 18 -50 18 -50 0"/>
    <circle data-p="plasmid" class="part plasmid" cx="195" cy="75" r="7"/><circle data-p="plasmid" class="part plasmid" cx="210" cy="98" r="5"/>
    </svg><p class="sim-out" id="bo">Tap a part of the bacterium.</p>`);
  el.querySelectorAll('[data-p]').forEach((p) => p.addEventListener('click', (e) => {
    e.stopPropagation();
    el.querySelectorAll('.part').forEach((x) => x.classList.toggle('on', x.dataset.p === p.dataset.p));
    const [n, d] = parts[p.dataset.p];
    $(el, '#bo').innerHTML = `<b>${n}</b>: ${d}`;
  }));
  return () => {};
}

function virus(el) {
  const stages = ['1. A virus lands on a cell.', '2. It gets inside the cell.', '3. It makes the cell copy the virus — lots of times.', '4. The new viruses burst out to infect more cells.'];
  const t = timers();
  html(el, `<svg viewBox="0 0 320 170" class="sim-svg vir" id="vs"></svg><div class="sim-row center"><button class="btn small" id="vp">▶ Play</button></div><p class="sim-out" id="vo">A virus: genes inside a protein coat, with an envelope with spikes.</p>`);
  const virusSvg = (x, y, cls = '') => `<g class="vp ${cls}" transform="translate(${x} ${y})"><circle r="9" class="env"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<line x1="0" y1="-9" x2="0" y2="-14" class="spike" transform="rotate(${k * 45})"/>`).join('')}<path d="M-4 -2 q 4 -5 8 0 q -4 5 -8 0" class="gene"/></g>`;
  const draw = (s) => {
    let inner = '';
    if (s === 2) inner = [0, 1, 2, 3, 4].map((k) => virusSvg(130 + (k % 3) * 25, 70 + Math.floor(k / 3) * 30, 'pop')).join('');
    $(el, '#vs').innerHTML = `<circle cx="160" cy="90" r="${s === 3 ? 0 : 65}" class="host ${s === 3 ? 'burst' : ''}"/><circle cx="160" cy="90" r="${s === 3 ? 0 : 14}" class="host-n"/>
      ${s === 0 ? virusSvg(160, 18, 'land') : ''}${s === 1 ? virusSvg(160, 55, 'enter') : ''}${inner}
      ${s === 3 ? [0, 1, 2, 3, 4, 5].map((k) => virusSvg(160 + Math.cos(k) * 100, 90 + Math.sin(k) * 60, 'fly')).join('') : ''}`;
    $(el, '#vo').textContent = stages[s];
  };
  $(el, '#vp').addEventListener('click', () => {
    t.clear();
    [0, 1, 2, 3].forEach((s) => t.add(setTimeout(() => draw(s), s * (reduced() ? 100 : 1600))));
  });
  draw(0);
  return t.clear;
}

function sizes(el) {
  const items = [['Paramecium (protoctist)', 200, 'about 200 µm'], ['Bacterium', 2, 'about 2 µm'], ['Virus', 0.1, 'about 0.1 µm']];
  let zoom = 0;
  html(el, `<div class="sizes" id="sz"></div><div class="sim-row center"><button class="btn small" id="zo">Zoom in × 100</button><button class="btn small ghost" id="zr">Reset</button></div><p class="sim-out" id="zt"></p>`);
  const draw = () => {
    const mag = [1, 100, 10000][zoom];
    $(el, '#sz').innerHTML = items.map(([n, um, label]) => {
      const px = um * mag * 0.9;
      return `<div class="size-item"><span class="blob" style="--s:${Math.min(px, 400)}px">${px > 600 ? '<em>too big to fit!</em>' : ''}</span><b>${n}</b><small>${label}${px < 1 ? ' · too small to see' : ''}</small></div>`;
    }).join('');
    $(el, '#zt').innerHTML = `Magnification: <b>× ${mag.toLocaleString()}</b> relative to the start. Size: <b>protoctist &gt; bacterium &gt; virus</b>.`;
    $(el, '#zo').disabled = zoom === 2;
  };
  $(el, '#zo').addEventListener('click', () => { zoom = Math.min(2, zoom + 1); draw(); });
  $(el, '#zr').addEventListener('click', () => { zoom = 0; draw(); });
  draw();
  return () => {};
}

function diffusion(el) {
  html(el, '<div id="dc"></div><div class="sim-row center"><button class="btn small" id="dr">Restart</button></div><p class="sim-out" id="do"></p>');
  const c = canvas($(el, '#dc'), 170);
  let ps = [];
  const reset = () => { ps = Array.from({ length: 120 }, () => ({ x: 10 + Math.random() * (c.w / 2 - 20), y: 10 + Math.random() * 150, a: Math.random() * 7 })); };
  reset();
  $(el, '#dr').addEventListener('click', reset);
  const stop = loop((dt) => {
    const g = c.ctx; g.clearRect(0, 0, c.w, c.h);
    g.strokeStyle = css('--border'); g.setLineDash([4, 4]); g.beginPath(); g.moveTo(c.w / 2, 0); g.lineTo(c.w / 2, c.h); g.stroke(); g.setLineDash([]);
    g.fillStyle = css('--science');
    let left = 0;
    for (const p of ps) {
      p.a += (Math.random() - 0.5) * 1.5;
      p.x += Math.cos(p.a) * 70 * dt; p.y += Math.sin(p.a) * 70 * dt;
      if (p.x < 4 || p.x > c.w - 4) { p.a = Math.PI - p.a; p.x = Math.max(4, Math.min(c.w - 4, p.x)); }
      if (p.y < 4 || p.y > c.h - 4) { p.a = -p.a; p.y = Math.max(4, Math.min(c.h - 4, p.y)); }
      if (p.x < c.w / 2) left++;
      g.beginPath(); g.arc(p.x, p.y, 3, 0, 7); g.fill();
    }
    $(el, '#do').innerHTML = `Left: <b>${left}</b> · Right: <b>${ps.length - left}</b> — particles spread from where there are <b>more</b> to where there are <b>fewer</b>.`;
  });
  return stop;
}

function growth(el) {
  html(el, `<svg viewBox="0 0 320 180" class="sim-svg growth" id="gs"></svg><input type="range" id="gt" min="0" max="100" value="10"><p class="sim-out" id="go"></p>`);
  const f = (t) => 10 + 130 / (1 + Math.exp(-(t - 45) / 8)); // S-shaped growth curve
  const X = (t) => 30 + t * 2.8, Y = (v) => 165 - v;
  const path = Array.from({ length: 101 }, (_, t) => `${t ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`).join(' ');
  const draw = () => {
    const t = Number($(el, '#gt').value);
    const phase = t < 28 ? 0 : t < 62 ? 1 : 2;
    $(el, '#gs').innerHTML = `<line x1="30" y1="165" x2="310" y2="165" class="axis"/><line x1="30" y1="165" x2="30" y2="10" class="axis"/>
      <text x="300" y="178" text-anchor="end" class="small">time →</text><text x="34" y="18" class="small">number of yeast cells</text>
      <rect x="${X(0)}" y="10" width="${X(28) - X(0)}" height="155" class="phase ${phase === 0 ? 'on' : ''}"/>
      <rect x="${X(28)}" y="10" width="${X(62) - X(28)}" height="155" class="phase ${phase === 1 ? 'on' : ''}"/>
      <rect x="${X(62)}" y="10" width="${X(100) - X(62)}" height="155" class="phase ${phase === 2 ? 'on' : ''}"/>
      <path d="${path}" class="curve"/><circle cx="${X(t)}" cy="${Y(f(t))}" r="6" class="dot-accent"/>`;
    $(el, '#go').innerHTML = ['<b>Slow start</b>: only a few cells, so few new buds.', '<b>Fastest growth</b> (steepest part): lots of cells budding, plenty of food.', '<b>No growth</b> (flat part): the food runs out — it is the <b>limiting factor</b>.'][phase];
  };
  $(el, '#gt').addEventListener('input', draw);
  draw();
  return () => {};
}

function leaf(el) {
  html(el, `<svg viewBox="0 0 320 200" class="sim-svg leaf-sim">
    <circle cx="40" cy="36" r="20" class="sun"/>${[0, 1, 2, 3].map((i) => `<line x1="58" y1="${44 + i * 8}" x2="150" y2="${80 + i * 10}" class="ray" style="--d:${i}"/>`).join('')}
    <path d="M150 170 C 120 120, 150 60, 250 50 C 260 120, 220 170, 150 170 Z" class="leaf"/>
    <path d="M150 170 C 190 130, 220 90, 250 50" class="vein"/><rect x="146" y="168" width="8" height="30" class="stem"/>
    ${[0, 1, 2].map((i) => `<text class="mol co2" style="--d:${i}" x="290" y="${100 + i * 22}">CO₂</text>`).join('')}
    ${[0, 1].map((i) => `<text class="mol o2" style="--d:${i}" x="215" y="${120 + i * 20}">O₂</text>`).join('')}
    ${[0, 1, 2].map((i) => `<text class="mol h2o" style="--d:${i}" x="138" y="198">H₂O</text>`).join('')}
    <text x="186" y="118" class="glucose">glucose</text></svg>
    <p class="sim-out">Light (absorbed by <b>chlorophyll</b>) + carbon dioxide + water → <b>glucose</b> + <b>oxygen</b></p>`);
  return () => {};
}

function pyramid(el) {
  const levels = [['Fox', 'Tertiary consumer', 18], ['Blackbird', 'Secondary consumer', 40], ['Caterpillars', 'Primary consumer', 70], ['Grass and plants', 'Producer', 100]];
  html(el, `<div class="pyr">${levels.map(([n, role, w], i) => `<div class="pyr-row" style="--w:${w}%;--d:${3 - i}"><b>${n}</b><small>${role}</small></div>${i < 3 ? '<div class="pyr-loss">↑ energy lost (movement, heat, waste)</div>' : ''}`).join('')}</div>
    <p class="sim-out">Each bar is the <b>biomass</b> at that level. It gets smaller going up, because energy is lost at each level.</p>`);
  return () => {};
}

function carbon(el) {
  const nodes = { air: [160, 30, 'CO₂ in the air'], plants: [50, 120, 'Plants'], animals: [160, 190, 'Animals'], dec: [270, 120, 'Decomposers'], fossil: [270, 220, 'Fossil fuels'] };
  const arrows = [
    ['air', 'plants', 'Photosynthesis', 'Plants take CO₂ out of the air to make glucose. (Removes CO₂.)'],
    ['plants', 'air', 'Respiration', 'Plants respire, releasing CO₂. (Adds CO₂.)'],
    ['plants', 'animals', 'Feeding', 'Animals eat plants, taking in their carbon compounds.'],
    ['animals', 'air', 'Respiration', 'Animals respire, releasing CO₂. (Adds CO₂.)'],
    ['animals', 'dec', 'Death and waste', 'Dead tissue and waste are broken down by decomposers.'],
    ['dec', 'air', 'Decay', 'Decomposers break down dead tissue using enzymes and release CO₂. (Adds CO₂.)'],
    ['dec', 'fossil', 'Fossil fuels form', 'Over millions of years, buried remains can become coal, oil or gas.'],
    ['fossil', 'air', 'Combustion', 'Burning fossil fuels releases CO₂. This is why CO₂ in the air has risen.'],
  ];
  const off = (a, b, k) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [-dy / L * k, dx / L * k]; };
  html(el, `<svg viewBox="0 0 330 250" class="sim-svg carbon">
    <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="ah"/></marker></defs>
    ${arrows.map(([f, t], i) => { const A = nodes[f], B = nodes[t], [ox, oy] = off(A, B, 9); return `<line class="flow" data-i="${i}" x1="${A[0] + ox}" y1="${A[1] + oy}" x2="${B[0] + ox}" y2="${B[1] + oy}" marker-end="url(#ah)" style="--d:${i}"/>`; }).join('')}
    ${Object.values(nodes).map(([x, y, l]) => `<g class="node"><rect x="${x - 48}" y="${y - 14}" width="96" height="28" rx="14"/><text x="${x}" y="${y + 5}" text-anchor="middle">${l}</text></g>`).join('')}
    </svg><p class="sim-out" id="cc">Tap an arrow.</p>`);
  el.querySelectorAll('.flow').forEach((l) => l.addEventListener('click', () => {
    el.querySelectorAll('.flow').forEach((x) => x.classList.remove('on'));
    l.classList.add('on');
    const [, , name, desc] = arrows[l.dataset.i];
    $(el, '#cc').innerHTML = `<b>${name}</b>: ${desc}`;
  }));
  return () => {};
}

// ===================================================================== SCIENCE 8G

function reactivity(el) {
  const metals = [['Magnesium', 14, 'lots of fizzing'], ['Zinc', 6, 'steady fizzing'], ['Iron', 2, 'a few slow bubbles'], ['Copper', 0, 'no reaction']];
  html(el, `<div class="tubes">${metals.map(([n, b], i) => `<div class="tube-wrap"><div class="tube" id="t${i}"><div class="acid"></div><div class="metal"></div>${Array.from({ length: b }, (_, k) => `<span class="bub" style="--x:${(k * 37) % 30 - 15}px;--d:${(k * 0.29) % 2}s;--s:${1.2 + (k % 3) * 0.3}s"></span>`).join('')}</div><b>${n}</b></div>`).join('')}</div>
    <div class="sim-row center"><button class="btn small" id="pop">🔥 Test the gas with a lit splint</button></div><p class="sim-out" id="ro">Metals in dilute hydrochloric acid. The bubbles (effervescence) are hydrogen.</p>`);
  $(el, '#pop').addEventListener('click', () => {
    const b = $(el, '#t0');
    b.classList.remove('popped'); void b.offsetWidth; b.classList.add('popped');
    $(el, '#ro').innerHTML = '<b>Squeaky pop!</b> That proves the gas is <b>hydrogen</b>. More reactive metals fizz faster: magnesium &gt; zinc &gt; iron &gt; copper.';
  });
  return () => {};
}

function series(el) {
  const s = ['Potassium', 'Sodium', 'Lithium', 'Calcium', 'Magnesium', 'Aluminium', 'Zinc', 'Iron', 'Tin', 'Lead', 'Copper', 'Silver', 'Gold'];
  html(el, `<div class="series">${s.map((m, i) => `<div class="metal-row" style="--d:${i};--w:${100 - i * 7}%"><span>${i + 1}</span><b>${m}</b><i></i></div>`).join('')}</div>
    <p class="sim-out"><b>Most reactive at the top</b>. Bar = how vigorously it reacts. Silver and gold (at the bottom) hardly react at all.</p>`);
  return () => {};
}

function rusting(el) {
  const tubes = [['A', 'Water + air', true, 'Rusts — it has <b>both</b> water and oxygen.'], ['B', 'Boiled water + oil layer', false, 'No rust — boiling removed the air and the oil stops more getting in: <b>no oxygen</b>.'], ['C', 'Dry air (with a drying agent)', false, 'No rust — <b>no water</b>.']];
  html(el, `<div class="tubes">${tubes.map(([k, label, , ], i) => `<div class="tube-wrap"><div class="tube r${i}"><div class="${i === 2 ? 'dry' : 'acid water'}"></div>${i === 1 ? '<div class="oil"></div>' : ''}<div class="nail" id="n${i}"></div></div><b>${k}</b><small>${label}</small></div>`).join('')}</div>
    <div class="sim-row center"><button class="btn small" id="wk">⏩ Wait one week</button><button class="btn small ghost" id="rs">Reset</button></div><p class="sim-out" id="rso">Three iron nails. Which will rust?</p>`);
  $(el, '#wk').addEventListener('click', () => {
    $(el, '#n0').classList.add('rusty');
    $(el, '#rso').innerHTML = tubes.map(([k, , , why]) => `<b>${k}</b>: ${why}`).join('<br>') + '<br>Rusting needs <b>BOTH</b> water and oxygen.';
  });
  $(el, '#rs').addEventListener('click', () => { $(el, '#n0').classList.remove('rusty'); $(el, '#rso').textContent = 'Three iron nails. Which will rust?'; });
  return () => {};
}

function alloy(el) {
  const grid = (alloyed) => {
    let s = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
      const big = alloyed && (r * 8 + c) % 7 === 3;
      s += `<circle class="atom ${big ? 'big' : ''} row${r}" cx="${20 + c * 22}" cy="${20 + r * 22}" r="${big ? 14 : 10}"/>`;
    }
    return s;
  };
  html(el, `<div class="two-col"><div><small>Pure metal</small><svg viewBox="0 0 190 100" class="sim-svg lattice" id="l1">${grid(false)}</svg></div>
    <div><small>Alloy</small><svg viewBox="0 0 190 100" class="sim-svg lattice" id="l2">${grid(true)}</svg></div></div>
    <div class="sim-row center"><button class="btn small" id="push">👉 Push the top layers</button></div><p class="sim-out" id="ao">All the atoms in a pure metal are the same size, in neat layers.</p>`);
  $(el, '#push').addEventListener('click', () => {
    for (const id of ['#l1', '#l2']) { const s = $(el, id); s.classList.remove('pushed'); void s.getBoundingClientRect(); s.classList.add('pushed'); }
    $(el, '#ao').innerHTML = 'Pure metal: the layers <b>slide</b> easily (soft, malleable). Alloy: the <b>different-sized atoms</b> stop the layers sliding, so it is <b>harder</b>.';
  });
  return () => {};
}

// ===================================================================== SCIENCE 8L

function daynight(el) {
  html(el, `<svg viewBox="0 0 320 180" class="sim-svg dn"><circle cx="20" cy="90" r="40" class="sun"/>${[0, 1, 2, 3, 4].map((i) => `<line x1="70" y1="${50 + i * 20}" x2="150" y2="${50 + i * 20}" class="ray" style="--d:${i}"/>`).join('')}
    <g transform="translate(220 90)"><circle r="60" class="earth-disc"/><path d="M0 -60 A60 60 0 0 1 0 60 Z" class="night"/>
    <g id="spin"><circle cx="0" cy="-60" r="7" class="person"/></g><circle r="3" class="axis-dot"/></g></svg><p class="sim-out" id="dno"></p>`);
  let a = 0;
  const stop = loop((dt) => {
    a = (a + dt * 40) % 360;
    $(el, '#spin').setAttribute('transform', `rotate(${a})`);
    const x = Math.sin((a * Math.PI) / 180);
    $(el, '#dno').innerHTML = `${x < 0 ? '☀ <b>Day</b> — facing the Sun' : '🌙 <b>Night</b> — facing away from the Sun'} · one full spin = <b>24 hours</b>`;
  });
  return stop;
}

function seasons(el) {
  html(el, `<input type="range" id="sm" min="0" max="11" value="5"><svg viewBox="0 0 320 200" class="sim-svg seas" id="ss"></svg><p class="sim-out" id="so"></p>`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const draw = () => {
    const m = Number($(el, '#sm').value);
    // angle around the orbit: June solstice on the left (north pole tilted towards the Sun at the centre)
    const ang = Math.PI + ((m - 5.7) / 12) * 2 * Math.PI;
    const ex = 160 + Math.cos(ang) * 120, ey = 100 + Math.sin(ang) * 55;
    const tilt = 23.5;
    // the axis always leans the same way in space (top towards the right of the picture),
    // so the north pole points at the Sun when the Earth is on the left of the orbit
    const north = Math.abs(Math.cos(ang)) < 0.35 ? 'spring/autumn' : (Math.cos(ang) < 0 ? 'summer' : 'winter');
    const south = north === 'summer' ? 'winter' : north === 'winter' ? 'summer' : 'autumn/spring';
    $(el, '#ss').innerHTML = `<ellipse cx="160" cy="100" rx="120" ry="55" class="orbit"/><circle cx="160" cy="100" r="18" class="sun"/>
      <g transform="translate(${ex} ${ey}) rotate(${tilt})"><circle r="16" class="earth-disc"/><line x1="0" y1="-26" x2="0" y2="26" class="tilt-axis"/><text y="-29" text-anchor="middle" class="small">N</text></g>
      <text x="${ex}" y="${ey + 34}" text-anchor="middle" class="small">${months[m]}</text>`;
    $(el, '#so').innerHTML = `<b>${months[m]}</b>: Northern hemisphere — <b>${north}</b>${north === 'summer' ? ' (tilted <b>towards</b> the Sun: longer days, Sun higher, rays concentrated)' : north === 'winter' ? ' (tilted <b>away</b> from the Sun)' : ''}. Southern hemisphere — <b>${south}</b>.<br><span class="muted">The axis is tilted 23.5° and always points the same way. Distance from the Sun is not the cause.</span>`;
  };
  $(el, '#sm').addEventListener('input', draw);
  draw();
  return () => {};
}

function models(el) {
  const M = {
    Ptolemy: { centre: 'Earth', ellipse: false, text: '<b>Ptolemy</b>: the <b>Earth</b> is at the centre. The Sun and planets orbit the Earth.' },
    Copernicus: { centre: 'Sun', ellipse: false, text: '<b>Copernicus</b>: the <b>Sun</b> is at the centre, and the planets move in <b>circular</b> orbits.' },
    Kepler: { centre: 'Sun', ellipse: true, text: '<b>Modern (Kepler)</b>: the <b>Sun</b> is at the centre, and the planets move in <b>elliptical</b> (oval) orbits.' },
  };
  let cur = 'Ptolemy';
  html(el, `<div class="chips-row">${Object.keys(M).map((k) => `<button class="chip-btn" data-m="${k}">${k}</button>`).join('')}</div><div id="mc"></div><p class="sim-out" id="mo"></p>`);
  const c = canvas($(el, '#mc'), 200);
  const pick = (k) => { cur = k; el.querySelectorAll('[data-m]').forEach((b) => b.classList.toggle('on', b.dataset.m === k)); $(el, '#mo').innerHTML = M[k].text; };
  el.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => pick(b.dataset.m)));
  pick('Ptolemy');
  let t = 0;
  const stop = loop((dt) => {
    t += dt;
    const g = c.ctx, cx = c.w / 2, cy = 100, m = M[cur];
    g.clearRect(0, 0, c.w, c.h);
    const bodies = m.centre === 'Earth' ? [['Moon', 30, 2.5, '#cbd5e1', 4], ['Sun', 70, 0.6, '#fbbf24', 10], ['Mars', 92, 0.4, '#ef4444', 5]] : [['Mercury', 30, 1.6, '#a8a29e', 4], ['Earth', 58, 0.8, '#3b82f6', 6], ['Mars', 88, 0.5, '#ef4444', 5]];
    for (const [name, r, speed, col, size] of bodies) {
      const rx = m.ellipse ? r * 1.25 : r, ry = m.ellipse ? r * 0.8 : r, fx = m.ellipse ? Math.sqrt(rx * rx - ry * ry) : 0;
      g.strokeStyle = css('--border'); g.beginPath(); g.ellipse(cx + fx, cy, rx * (c.w / 330), ry, 0, 0, 7); g.stroke();
      const a = t * speed;
      const x = cx + fx + Math.cos(a) * rx * (c.w / 330), y = cy + Math.sin(a) * ry;
      g.fillStyle = col; g.beginPath(); g.arc(x, y, size, 0, 7); g.fill();
      g.fillStyle = css('--muted'); g.font = '11px system-ui'; g.fillText(name, x + 7, y - 6);
    }
    g.fillStyle = m.centre === 'Earth' ? '#3b82f6' : '#fbbf24';
    g.beginPath(); g.arc(cx, cy, m.centre === 'Earth' ? 9 : 13, 0, 7); g.fill();
    g.fillStyle = css('--text'); g.font = 'bold 12px system-ui'; g.fillText(m.centre, cx - 14, cy + 28);
  });
  return stop;
}

function moonPath(r, theta) {
  // theta: 0 = new moon, π = full moon. Lit area drawn for the view from Earth (northern hemisphere).
  const k = Math.cos(theta);
  const rx = Math.abs(k) * r;
  const waxing = theta <= Math.PI;
  const crescent = k > 0;
  const d = `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${rx} ${r} 0 0 ${crescent ? 0 : 1} 0 ${-r} Z`;
  return { d, flip: !waxing };
}

function phases(el) {
  const names = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
  html(el, `<input type="range" id="pd" min="0" max="29.5" step="0.5" value="7.5"><div class="two-col"><svg viewBox="-100 -80 200 160" class="sim-svg orbitv" id="po"></svg>
    <div class="moonview"><small>Seen from Earth</small><svg viewBox="-45 -45 90 90" class="sim-svg" id="pm"></svg><b id="pn"></b></div></div>
    <p class="sim-out">The Sun always lights <b>half</b> of the Moon. As the Moon orbits the Earth (about 29.5 days), we see different amounts of that lit half — the <b>phases</b>.</p>`);
  const draw = () => {
    const day = Number($(el, '#pd').value);
    const theta = (day / 29.5) * 2 * Math.PI;
    // orbit view: Sun to the left; new moon is between Earth and Sun
    const mx = -Math.cos(theta) * 55, my = Math.sin(theta) * 55;
    $(el, '#po').innerHTML = `<text x="-96" y="-66" class="small">☀ Sun light →</text><circle r="55" class="orbit"/><circle r="12" class="earth-disc"/>
      <g transform="translate(${mx} ${my})"><circle r="8" class="moon-dark"/><path d="M0 -8 A8 8 0 0 0 0 8 Z" class="moon-lit"/></g>`;
    const { d, flip } = moonPath(38, theta);
    $(el, '#pm').innerHTML = `<circle r="38" class="moon-dark"/><path d="${d}" class="moon-lit" transform="${flip ? 'scale(-1 1)' : ''}"/>`;
    $(el, '#pn').textContent = `${names[Math.round((day / 29.5) * 8) % 8]} · day ${day}`;
  };
  $(el, '#pd').addEventListener('input', draw);
  draw();
  return () => {};
}

function magnet(el) {
  let flipped = false;
  html(el, `<div class="chips-row"><button class="chip-btn on" data-v="field">Field + compasses</button><button class="chip-btn" data-v="pair">Two magnets</button></div>
    <svg viewBox="0 0 320 190" class="sim-svg mag" id="ms"></svg><div class="sim-row center"><button class="btn small" id="mf" hidden>Flip the right magnet</button></div><p class="sim-out" id="mo"></p>`);
  const bar = (x, y, flip) => `<g transform="translate(${x} ${y})"><rect x="-40" y="-12" width="40" height="24" class="${flip ? 'pole-s' : 'pole-n'}"/><rect x="0" y="-12" width="40" height="24" class="${flip ? 'pole-n' : 'pole-s'}"/>
    <text x="-20" y="5" text-anchor="middle" class="pole-t">${flip ? 'S' : 'N'}</text><text x="20" y="5" text-anchor="middle" class="pole-t">${flip ? 'N' : 'S'}</text></g>`;
  const field = () => {
    // field of a bar magnet modelled as two poles: + at N (left end), − at S (right end)
    const N = [125, 95], S = [195, 95];
    let s = '';
    for (let x = 15; x <= 305; x += 26) for (let y = 15; y <= 180; y += 24) {
      if (x > 112 && x < 208 && y > 78 && y < 112) continue;
      const v = [0, 0];
      for (const [p, q] of [[N, 1], [S, -1]]) { const dx = x - p[0], dy = y - p[1], r3 = Math.hypot(dx, dy) ** 3; v[0] += (q * dx) / r3; v[1] += (q * dy) / r3; }
      const ang = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
      const strength = Math.min(1, Math.hypot(...v) * 3000);
      s += `<g transform="translate(${x} ${y}) rotate(${ang})" opacity="${0.35 + strength * 0.65}"><path d="M-8 0 L0 -3 L0 3 Z" class="needle-s"/><path d="M8 0 L0 -3 L0 3 Z" class="needle-n"/></g>`;
    }
    $(el, '#ms').innerHTML = s + bar(160, 95, false);
    $(el, '#mo').innerHTML = 'Each compass needle’s red tip points along the field: <b>out of N, into S</b>. The needles line up most strongly near the <b>poles</b>, where the field is strongest.';
  };
  const pair = () => {
    const attract = !flipped;
    $(el, '#ms').innerHTML = `<g class="${attract ? 'm-attract' : 'm-repel'}"><g class="mL">${bar(80, 95, false)}</g><g class="mR">${bar(240, 95, flipped)}</g></g>`;
    $(el, '#mo').innerHTML = attract ? 'S faces N: <b>unlike poles attract</b>.' : 'S faces S: <b>like poles repel</b>.';
  };
  el.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
    el.querySelectorAll('[data-v]').forEach((x) => x.classList.toggle('on', x === b));
    $(el, '#mf').hidden = b.dataset.v !== 'pair';
    (b.dataset.v === 'pair' ? pair : field)();
  }));
  $(el, '#mf').addEventListener('click', () => { flipped = !flipped; pair(); });
  field();
  return () => {};
}

function weight(el) {
  const places = [['Earth', 10, '10'], ['Moon', 1.6, '1.6'], ['Mars', 3.7, '≈ 3.7'], ['Jupiter', 25, '≈ 25']];
  html(el, `<div class="sim-row"><label>Mass <b id="wm">2</b> kg</label><input type="range" id="m" min="1" max="80" value="2"></div>
    <div class="scales">${places.map(([p, , label], i) => `<div class="scale-item"><div class="spring"><i id="sp${i}"></i></div><b>${p}</b><small>g = ${label} N/kg</small><span id="w${i}"></span></div>`).join('')}</div>
    <p class="sim-out">Mass stays <b id="wm2">2 kg</b> everywhere. Weight W = m × g changes.</p>`);
  const draw = () => {
    const m = Number($(el, '#m').value);
    $(el, '#wm').textContent = m; $(el, '#wm2').textContent = `${m} kg`;
    places.forEach(([, g], i) => {
      const W = Math.round(m * g * 10) / 10;
      $(el, `#w${i}`).innerHTML = `<b>${W} N</b>`;
      $(el, `#sp${i}`).style.height = `${Math.min(100, 8 + W / 20)}%`;
    });
  };
  $(el, '#m').addEventListener('input', draw);
  draw();
  return () => {};
}

function scale(el) {
  const steps = [
    ['🌙', 'Moon', 'about 3 500 km across. Orbits a planet (the Earth).'],
    ['🌍', 'Planet (Earth)', 'about 12 700 km across — nearly 4 Moons wide.'],
    ['☀', 'Star (the Sun)', 'about 1.4 million km across — over 100 Earths wide.'],
    ['🌌', 'Galaxy (Milky Way)', 'about 100 000 light years across, with hundreds of billions of stars.'],
    ['✨', 'Universe', 'everything — billions of galaxies.'],
  ];
  let i = 0;
  html(el, `<div class="scale-stage"><span id="se" class="scale-emoji">🌙</span></div><div class="dots" id="sdots"></div>
    <div class="sim-row center"><button class="btn small" id="sz">Zoom out ➜</button></div><p class="sim-out" id="sto"></p>`);
  const draw = () => {
    const [e, n, d] = steps[i];
    const s = $(el, '#se'); s.textContent = e; s.classList.remove('zoom'); void s.offsetWidth; s.classList.add('zoom');
    $(el, '#sdots').innerHTML = steps.map((st, k) => `<span class="${k === i ? 'on' : ''}">${st[1].split(' ')[0]}</span>`).join(' &lt; ');
    $(el, '#sto').innerHTML = `<b>${n}</b>: ${d}`;
    $(el, '#sz').textContent = i === steps.length - 1 ? 'Start again' : 'Zoom out ➜';
  };
  $(el, '#sz').addEventListener('click', () => { i = (i + 1) % steps.length; draw(); });
  draw();
  return () => {};
}

// ===================================================================== ENGLISH

function characters(el) {
  const people = [
    ['Ralph', '🐚', 'Elected chief in Chapter 1. Wants rules, shelters and a signal fire so they can be rescued. Ends up hunted, and cries for the loss of innocence.'],
    ['Piggy', '👓', 'Ralph’s clever friend. His glasses light the fire. Stands for reason and science. Says there is no beast. Killed by Roger’s rock in Chapter 11.'],
    ['Jack', '🗡', 'Leader of the choir, who become hunters. Paints his face and becomes savage. Starts his own tribe and rules Castle Rock with fear.'],
    ['Simon', '🌿', 'Builds shelters with Ralph and goes alone to a peaceful clearing. Realises the beast is “only us”. Killed in the frenzied dance in Chapter 9.'],
    ['Roger', '🪨', 'One of Jack’s hunters who enjoys the violence. Pushes the rock that kills Piggy and smashes the conch.'],
    ['Sam and Eric', '👬', 'Twins who think the dead parachutist is the beast. Stay with Ralph, then are captured by Jack’s tribe in Chapter 11.'],
    ['The naval officer', '⚓', 'Arrives at the end because he saw the smoke. He is surprised that British boys behaved like this.'],
  ];
  html(el, `<div class="people">${people.map(([n, e], i) => `<button class="person-card" data-i="${i}"><span>${e}</span><b>${n}</b></button>`).join('')}</div><p class="sim-out" id="pco">Tap a character.</p>`);
  el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => {
    el.querySelectorAll('[data-i]').forEach((x) => x.classList.toggle('on', x === b));
    const [n, , d] = people[b.dataset.i];
    $(el, '#pco').innerHTML = `<b>${n}</b>: ${d}`;
  }));
  return () => {};
}

function timeline(el, slide) {
  const [lo, hi] = slide?.range || [1, 12];
  const status = (n) => ({
    conch: n >= 11 ? ['💥', 'Smashed — order ends'] : n >= 5 ? ['🐚', 'Rejected by Jack'] : ['🐚', 'Order and rules'],
    glasses: n >= 10 ? ['🕶', 'Stolen by Jack’s hunters'] : n >= 4 ? ['👓', 'One lens broken'] : ['👓', 'Whole'],
    fire: n === 12 ? ['🔥', 'Island set on fire to hunt Ralph'] : n === 4 ? ['💨', 'Out — a ship passes'] : n >= 2 ? ['🔥', 'Signal fire for rescue'] : ['—', 'Not lit yet'],
    group: n >= 8 ? ['💔', 'Split: Jack’s tribe vs Ralph'] : ['🤝', 'One group under Ralph'],
  });
  html(el, `<input type="range" id="ch" min="${lo}" max="${hi}" value="${lo}">
    <div class="ch-card" id="cc"></div>`);
  const draw = () => {
    const n = Number($(el, '#ch').value), c = CHAPTERS[n - 1], st = status(n);
    $(el, '#cc').innerHTML = `<div class="ch-head"><span class="ch-num">${n}</span><b>${c.title}</b></div>
      <div class="meter"><small>Order</small><div class="meter-bar"><i style="--v:${c.mood * 10}%"></i></div><small>Savagery</small></div>
      <p>${c.summary}</p>
      <div class="sym-status">${Object.entries(st).map(([k, [e, t]]) => `<span title="${k}"><em>${e}</em>${t}</span>`).join('')}</div>`;
    $(el, '#cc').classList.remove('flash'); void $(el, '#cc').offsetWidth; $(el, '#cc').classList.add('flash');
  };
  $(el, '#ch').addEventListener('input', draw);
  draw();
  return () => {};
}

function symbols(el) {
  const cards = [
    ['🐚', 'The conch', 'Order, rules and democracy. Whoever holds it may speak. When it is smashed (Ch 11), order ends.'],
    ['👓', 'Piggy’s glasses', 'Science, reason and intelligence — and the power to make fire. Broken (Ch 4), then stolen (Ch 10).'],
    ['🔥', 'The signal fire', 'Hope of rescue and the link to civilisation. It goes out when a ship passes (Ch 4).'],
    ['🪰', 'The beast / Lord of the Flies', 'The evil inside every person. “Maybe it’s only us.”'],
  ];
  html(el, `<div class="flip-grid">${cards.map(([e, n, d]) => `<button class="flip"><span class="flip-in"><span class="front"><em>${e}</em><b>${n}</b><small>tap to flip</small></span><span class="back"><b>${n}</b>${d}</span></span></button>`).join('')}</div>`);
  el.querySelectorAll('.flip').forEach((f) => f.addEventListener('click', () => f.classList.toggle('flipped')));
  return () => {};
}


// ===================================================================== GEOGRAPHY

function crystals(el) {
  html(el, `<div class="sim-row"><label>Cooling time</label><input type="range" id="ct" min="1" max="10" value="2"></div><div id="cc"></div><p class="sim-out" id="co"></p>`);
  const c = canvas($(el, '#cc'), 170);
  const draw = () => {
    const t = Number($(el, '#ct').value);
    const g = c.ctx; g.clearRect(0, 0, c.w, c.h);
    // fewer, bigger crystals the slower it cools
    const size = 5 + t * 5, n = Math.round((c.w * c.h) / (size * size * 1.6));
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const cols = [css('--muted'), '#e5d3c4', '#4b4f5c', '#c9b8a6'];
    for (let i = 0; i < n; i++) {
      const x = rnd() * c.w, y = rnd() * c.h, r = size * (0.6 + rnd() * 0.6), a = rnd() * Math.PI;
      g.fillStyle = cols[i % cols.length];
      g.beginPath();
      for (let k = 0; k < 6; k++) { const ang = a + (k * Math.PI) / 3; g.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r * 0.8); }
      g.closePath(); g.fill();
    }
    $(el, '#co').innerHTML = t <= 3 ? '<b>Fast cooling</b> (lava on the surface) → <b>small crystals</b>, like <b>basalt</b>.'
      : t >= 7 ? '<b>Slow cooling</b> (magma deep underground) → <b>large crystals</b>, like <b>granite</b>.'
      : 'Medium cooling → medium-sized crystals.';
  };
  $(el, '#ct').addEventListener('input', draw);
  draw();
  return () => {};
}

function rockcycle(el) {
  const nodes = { ig: [170, 26, 'Igneous rock'], sedi: [282, 108, 'Sediment'], sed: [236, 212, 'Sedimentary rock'], met: [104, 212, 'Metamorphic rock'], mag: [58, 108, 'Magma'] };
  const arrows = [
    ['ig', 'sedi', 'Weathering and erosion', 'Rock at the surface is broken up and carried away as sediment.'],
    ['sedi', 'sed', 'Deposition, compaction, cementation', 'Sediment settles in layers, is squashed and glued into sedimentary rock.'],
    ['sed', 'met', 'Heat and pressure', 'Buried deep, sedimentary rock is changed into metamorphic rock.'],
    ['met', 'mag', 'Melting', 'Very deep, the rock melts into magma.'],
    ['mag', 'ig', 'Cooling', 'Magma cools and hardens into igneous rock (inside the crust or as lava).'],
    ['sed', 'sedi', 'Uplift and weathering', 'Uplift brings rock to the surface, where it is weathered again.'],
    ['met', 'sedi', 'Uplift and weathering', 'Metamorphic rock can be uplifted and weathered too.'],
  ];
  const off = (a, b, k) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [-dy / L * k, dx / L * k]; };
  html(el, `<svg viewBox="0 0 340 236" class="sim-svg carbon"><defs><marker id="ra" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="ah"/></marker></defs>
    ${arrows.map(([f, t], i) => { const A = nodes[f], B = nodes[t], [ox, oy] = off(A, B, 7); return `<line class="flow" data-i="${i}" x1="${A[0] + ox}" y1="${A[1] + oy}" x2="${B[0] + ox}" y2="${B[1] + oy}" marker-end="url(#ra)"/>`; }).join('')}
    ${Object.values(nodes).map(([x, y, l]) => `<g class="node"><rect x="${x - 54}" y="${y - 14}" width="108" height="28" rx="14"/><text x="${x}" y="${y + 5}" text-anchor="middle">${l}</text></g>`).join('')}
    </svg><p class="sim-out" id="rc">Tap an arrow.</p>`);
  el.querySelectorAll('.flow').forEach((l) => l.addEventListener('click', () => {
    el.querySelectorAll('.flow').forEach((x) => x.classList.toggle('on', x === l));
    const [, , n, d] = arrows[l.dataset.i];
    $(el, '#rc').innerHTML = `<b>${n}</b>: ${d}`;
  }));
  return () => {};
}

function freezethaw(el) {
  const t = timers();
  const steps = ['Rain water fills a crack in the rock.', 'At night it freezes. Ice takes up about 9% more space, so it pushes the crack wider.', 'By day the ice thaws, and water runs deeper into the crack.', 'After many freezes and thaws, a piece breaks off and falls as scree.'];
  html(el, `<svg viewBox="0 0 320 180" class="sim-svg ft" id="fs"></svg><div class="sim-row center"><button class="btn small" id="fp">▶ Play</button></div><p class="sim-out" id="fo">${steps[0]}</p>`);
  const draw = (k) => {
    const w = [6, 12, 14, 30][k];
    $(el, '#fs').innerHTML = `<rect x="0" y="0" width="320" height="180" class="${k === 1 ? 'night' : 'day'}"/>
      <path d="M40 170 L40 40 L${160 - w / 2} 40 L${160 - w / 4} 120 L${160 + w / 4} 120 L${160 + w / 2} 40 L280 40 L280 170 Z" class="rockface"/>
      <path d="M${160 - w / 2 + 2} 60 L${160 - w / 4 + 1} 118 L${160 + w / 4 - 1} 118 L${160 + w / 2 - 2} 60 Z" class="${k === 1 ? 'ice' : 'water'}"/>
      ${k === 3 ? '<path d="M200 40 L280 40 L280 80 L220 70 Z" class="rockface fall"/><circle cx="300" cy="166" r="6" class="rockface"/><circle cx="288" cy="170" r="4" class="rockface"/>' : ''}
      <text x="12" y="22" class="small">${k === 1 ? 'Night: below 0 °C' : 'Day: above 0 °C'}</text>`;
    $(el, '#fo').textContent = steps[k];
  };
  $(el, '#fp').addEventListener('click', () => { t.clear(); [0, 1, 2, 3].forEach((k) => t.add(setTimeout(() => draw(k), k * (reduced() ? 80 : 1500)))); });
  draw(0);
  return t.clear;
}

function cave(el) {
  html(el, `<div class="sim-row"><label>Time <b id="cy">0</b> years</label><input type="range" id="cv" min="0" max="100" value="30"></div>
    <svg viewBox="0 0 320 200" class="sim-svg cavesvg" id="cs"></svg><p class="sim-out" id="co"></p>`);
  const draw = () => {
    const v = Number($(el, '#cv').value);
    const years = Math.round(v * 1000);
    $(el, '#cy').textContent = years.toLocaleString();
    const tite = 10 + v * 0.62, mite = 6 + v * 0.62; // grow towards each other
    const joined = tite + mite >= 150;
    $(el, '#cs').innerHTML = `<rect x="0" y="0" width="320" height="200" class="rockface"/>
      <path d="M0 30 Q 160 10 320 30 L320 180 Q160 196 0 180 Z" class="cavern"/>
      <line x1="160" y1="0" x2="160" y2="24" class="joint"/>
      <path d="M150 26 L170 26 L${160 + 3} ${26 + tite} L${160 - 3} ${26 + tite} Z" class="calcite"/>
      <path d="M146 182 L174 182 L${160 + 4} ${182 - mite} L${160 - 4} ${182 - mite} Z" class="calcite"/>
      ${joined ? '' : `<circle cx="160" cy="${30 + tite}" r="3" class="drip"/>`}
      <text x="176" y="${40 + tite / 2}" class="small">stalactite</text><text x="176" y="${178 - mite / 2}" class="small">stalagmite</text>`;
    $(el, '#co').innerHTML = joined ? 'They have joined to make a <b>pillar</b>!' : 'Water drips through the joint. Each drop leaves a tiny bit of <b>calcite</b>, so they grow very slowly — often only about 1 cm every hundred years.';
  };
  $(el, '#cv').addEventListener('input', draw);
  draw();
  return () => {};
}

// ===================================================================== HISTORY

function votes(el) {
  const eras = [
    [1900, 'Before 1918', 'Only some men could vote (it depended on property). No women could vote.', 0, 60],
    [1918, '1918 Act', 'All men over 21. Women over 30 who met a property qualification.', 40, 100],
    [1928, '1928 Act', 'Everyone over 21, men and women equally.', 100, 100],
    [1969, '1969', 'The voting age was lowered to 18 for everyone.', 100, 100],
  ];
  html(el, `<div class="chips-row">${eras.map((e, i) => `<button class="chip-btn" data-i="${i}">${e[1]}</button>`).join('')}</div>
    <div class="vote-bars"><div><small>Women</small><span><i id="vw"></i></span></div><div><small>Men</small><span><i id="vm"></i></span></div></div>
    <p class="sim-out" id="vo"></p>`);
  const show = (i) => {
    el.querySelectorAll('[data-i]').forEach((b) => b.classList.toggle('on', Number(b.dataset.i) === i));
    const [, , text, w, m] = eras[i];
    $(el, '#vw').style.width = `${w}%`; $(el, '#vm').style.width = `${m}%`;
    $(el, '#vo').innerHTML = `${text}<br><span class="muted">Bars show roughly how many adults of each sex could vote.</span>`;
  };
  el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => show(Number(b.dataset.i))));
  show(0);
  return () => {};
}

function histline(el, slide) {
  const [lo, hi] = slide?.range || [1901, 2001];
  const evs = EVENTS.filter((e) => e[0] >= lo && e[0] <= hi);
  html(el, `<div class="sim-row"><label><b id="hy">${lo}</b></label><input type="range" id="hr" min="${lo}" max="${hi}" value="${lo}"></div>
    <div class="tl" id="tl">${evs.map((e, i) => `<div class="tl-ev" data-y="${e[0]}" style="--x:${((e[0] - lo) / Math.max(1, hi - lo)) * 100}%;--r:${i % 3}"><i></i></div>`).join('')}<div class="tl-now" id="tn"></div></div>
    <div class="tl-list" id="tll"></div>`);
  const draw = () => {
    const y = Number($(el, '#hr').value);
    $(el, '#hy').textContent = y;
    $(el, '#tn').style.left = `${((y - lo) / Math.max(1, hi - lo)) * 100}%`;
    el.querySelectorAll('.tl-ev').forEach((d) => d.classList.toggle('past', Number(d.dataset.y) <= y));
    const shown = evs.filter((e) => e[0] <= y).slice(-4).reverse();
    $(el, '#tll').innerHTML = shown.map((e, i) => `<div class="tl-item ${i === 0 ? 'new' : ''}"><b>${e[0]}</b><span>${e[1]}</span></div>`).join('') || '<p class="muted">Drag the slider forward.</p>';
  };
  $(el, '#hr').addEventListener('input', draw);
  draw();
  return () => {};
}

export const SIMS = { powerladder, sfmove, sigfig, prism, circle, cylinder, pythag, expand, grid, sequence,
  bacterium, virus, sizes, diffusion, growth, leaf, pyramid, carbon, reactivity, series, rusting, alloy,
  daynight, seasons, models, phases, magnet, weight, scale, characters, timeline, symbols,
  crystals, rockcycle, freezethaw, cave, votes, histline };
