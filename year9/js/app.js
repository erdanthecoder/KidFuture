import { MATHS } from './content-maths.js';
import { SCIENCE } from './content-science.js';
import { ENGLISH } from './content-english.js';
import { GEOGRAPHY } from './content-geography.js';
import { HISTORY } from './content-history.js';
import { SIMS } from './sims.js';
import { checkTyped, shuffle, pick, prettyNum, escapeHtml, mcq } from './engine.js';
import { confetti, floatText, countUp, sound, setSound } from './fx.js';
import { currentUser, signInWithGoogle, googleAvailable, signOutUser, continueAsGuest } from './auth.js';
import { CARDS } from './content-cards.js';
import { schedule, preview, formatInterval, retrievability, AGAIN, HARD, GOOD, EASY, MIN } from './scheduler.js';
import { LIFE } from './content-life.js';

// ------------------------------------------------------------------ content index
export const SUBJECTS = [MATHS, SCIENCE, ENGLISH, GEOGRAPHY, HISTORY];
const LESSONS = new Map();
for (const s of SUBJECTS) for (const u of s.units) for (const l of u.lessons) LESSONS.set(l.id, { lesson: l, unit: u, subject: s });

// ------------------------------------------------------------------ progress (saved per account)
const DAY = 864e5;
const INTERVALS = [0, 1, 2, 4, 7, 14]; // days until the next review, by box
const DAILY_GOAL = 20; // minutes
let user = currentUser();
let P = load();
P.cards ||= {}; P.newCards ||= {}; P.explains ||= {}; P.best ||= {};

function blank() { return { xp: 0, days: {}, lessons: {}, sessions: 0, sound: true, lastSubject: null, tests: {}, cards: {}, newCards: {}, explains: {}, best: {} }; }
function storeKey() { return `y9.v1.${user?.uid || 'guest'}`; }
function load() { try { const d = { ...blank(), ...JSON.parse(localStorage.getItem(storeKey()) || '{}') }; d.cards ||= {}; d.newCards ||= {}; d.explains ||= {}; d.best ||= {}; return d; } catch { return blank(); } }
function save() { try { localStorage.setItem(storeKey(), JSON.stringify(P)); } catch { /* storage unavailable */ } }
setSound(P.sound);

const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const minutesToday = () => Math.floor((P.days[dayKey()] || 0) / 60);
function streak() {
  let n = 0, t = Date.now();
  if (!P.days[dayKey(t)]) t -= DAY;
  while (P.days[dayKey(t)]) { n++; t -= DAY; }
  return n;
}
const level = () => Math.floor(P.xp / 250) + 1;
const lessonState = (id) => (P.lessons[id] ||= { learned: false, box: 0, due: 0, correct: 0, total: 0 });
const stars = (id) => { const s = P.lessons[id]; if (!s?.learned) return 0; return s.box >= 5 ? 3 : s.box >= 3 ? 2 : 1; };
const starHtml = (id) => `<span class="stars" title="Mastery">${[1, 2, 3].map((k) => `<i class="${k <= stars(id) ? 'on' : ''}">★</i>`).join('')}</span>`;
const isDue = (id) => { const s = P.lessons[id]; return s?.learned && s.due <= Date.now(); };

function recordResults(results) {
  const by = new Map();
  for (const r of results) {
    if (!r.lessonId) continue;
    const e = by.get(r.lessonId) || { c: 0, t: 0 };
    e.t++; if (r.correct) e.c++;
    by.set(r.lessonId, e);
  }
  for (const [id, { c, t }] of by) {
    const s = lessonState(id);
    s.correct += c; s.total += t;
    if (!s.learned) continue;
    const acc = c / t;
    s.box = acc >= 0.8 ? Math.min(5, s.box + 1) : acc >= 0.5 ? Math.max(1, s.box) : 1;
    s.due = Date.now() + INTERVALS[s.box] * DAY;
  }
  save();
}

// Active study time: counted only while a lesson/quiz is open, the tab is visible and you've interacted recently.
let studying = false, lastActive = Date.now();
['pointerdown', 'keydown'].forEach((e) => addEventListener(e, () => { lastActive = Date.now(); }, { passive: true }));
setInterval(() => {
  if (studying && document.visibilityState === 'visible' && Date.now() - lastActive < 90000) {
    const k = dayKey();
    const before = Math.floor((P.days[k] || 0) / 60);
    P.days[k] = (P.days[k] || 0) + 5;
    if (Math.floor(P.days[k] / 60) === DAILY_GOAL && before < DAILY_GOAL) { toast('🎯 Daily goal reached — 20 minutes!'); confetti(80); sound('finish'); }
    save();
  }
}, 5000);

// ------------------------------------------------------------------ helpers
const app = document.getElementById('app');
const $ = (s, r = app) => r.querySelector(s);
const $$ = (s, r = app) => [...r.querySelectorAll(s)];
let cleanup = [];
let renderId = 0;
// A delayed step that is cancelled if the user moves to another page first.
function later(fn, ms) {
  const id = renderId;
  const t = setTimeout(() => { if (id === renderId) fn(); }, ms);
  cleanup.push(() => clearTimeout(t));
}
let keyHandler = null;
addEventListener('keydown', (e) => keyHandler?.(e));

function toast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}

function make(item, lessonId) {
  const q = typeof item === 'function' ? item() : { ...item };
  q.lessonId = lessonId;
  if (q.type === 'order') {
    let s;
    do s = shuffle(q.items); while (s.join() === q.items.join() && q.items.length > 1);
    q.pool = s;
  }
  if (q.type === 'match') q.right = shuffle(q.pairs.map((p) => p[1]));
  return q;
}

function practiceSet(lesson, n) {
  const items = shuffle(lesson.practice);
  const gens = lesson.practice.filter((p) => typeof p === 'function');
  while (items.length < n) items.push(pick(gens));
  return items.slice(0, n).map((it) => make(it, lesson.id));
}

const learnedIds = () => [...LESSONS.keys()].filter((id) => P.lessons[id]?.learned);

function nextLesson() {
  const order = SUBJECTS.map((s) => s.id);
  const start = P.lastSubject ? (order.indexOf(P.lastSubject) + 1) % order.length : 0;
  for (let k = 0; k < order.length; k++) {
    const s = SUBJECTS[(start + k) % order.length];
    for (const u of s.units) for (const l of u.lessons) if (!P.lessons[l.id]?.learned) return l;
  }
  return null;
}

function sessionPlan() {
  const due = learnedIds().filter(isDue).sort((a, b) => P.lessons[a].due - P.lessons[b].due);
  const warmIds = due.slice(0, 5);
  if (warmIds.length < 3) for (const id of shuffle(learnedIds())) if (!warmIds.includes(id) && warmIds.length < 4) warmIds.push(id);
  const lesson = nextLesson();
  return { warmIds, lesson, due: due.length };
}

const answerHtml = (q) => {
  if (q.type === 'mcq') return q.options[q.answer];
  if (q.type === 'tf') return q.answer ? 'True' : 'False';
  if (q.type === 'match') return q.pairs.map(([a, b]) => `${a} → ${b}`).join('<br>');
  if (q.type === 'order') return q.items.map((x, i) => `${i + 1}. ${x}`).join('<br>');
  return q.type === 'num' ? prettyNum(String(q.answer)) : escapeHtml(q.answer);
};

// ------------------------------------------------------------------ router
function route() {
  const [name = '', ...args] = location.hash.replace(/^#\/?/, '').split('/');
  return { name, args: args.map(decodeURIComponent) };
}

function render() {
  cleanup.forEach((f) => { try { f(); } catch { /* ignore */ } });
  cleanup = [];
  renderId++;
  keyHandler = null;
  studying = false;
  document.body.classList.remove('focus-mode');
  scrollTo(0, 0);
  if (!user) return loginView();
  const { name, args } = route();
  const views = { guide: guideView, explain: explainView, speed: speedView, cards: cardsView, '': homeView, subject: subjectView, lesson: lessonView, practice: practiceView, session: sessionView, test: testView, topics: topicsView, profile: profileView };
  (views[name] || homeView)(...args);
  $$('nav a', document).forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#/${name}` || (a.getAttribute('href') === '#/' && name === '')));
  const av = document.getElementById('avatar');
  av.innerHTML = user.photo ? `<img src="${escapeHtml(user.photo)}" alt="" referrerpolicy="no-referrer">` : escapeHtml(user.name[0] || '?');
  document.getElementById('topbar').hidden = false;
}
addEventListener('hashchange', render);

// ------------------------------------------------------------------ login
function loginView() {
  document.getElementById('topbar').hidden = true;
  app.innerHTML = `
    <section class="login">
      <div class="login-card pop-in">
        <div class="logo-big">Y9</div>
        <h1>Year 9 Revision</h1>
        <p class="lead">Maths · Science · English · Geography · History</p>
        <p class="muted">15–30 minutes a day. Learn it, practise it, remember it.</p>
        <button class="btn google" id="g"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continue with Google</button>
        <p class="small muted" id="gnote">Use your school Google Workspace account.</p>
        <div class="or">or</div>
        <form id="guest" class="guest"><input name="n" placeholder="Your first name" maxlength="30" aria-label="Your first name"><button class="btn">Try as a guest</button></form>
      </div>
    </section>`;
  googleAvailable().then((ok) => {
    if (!ok) { $('#g').disabled = true; $('#gnote').textContent = 'Google sign-in works on year9topics.web.app. Here, try as a guest.'; }
  });
  $('#g').addEventListener('click', async () => {
    $('#g').disabled = true;
    try {
      user = await signInWithGoogle();
      P = load(); setSound(P.sound);
      toast(`Welcome, ${escapeHtml(user.name.split(' ')[0])}!`);
      location.hash = '#/'; render();
    } catch (e) {
      if (!/popup-closed|cancelled-popup/i.test(String(e?.code || e?.message))) toast(escapeHtml(e.message || 'Sign-in failed.'));
      $('#g').disabled = false;
    }
  });
  $('#guest').addEventListener('submit', (e) => {
    e.preventDefault();
    user = continueAsGuest(e.target.n.value);
    P = load(); setSound(P.sound);
    location.hash = '#/'; render();
  });
}

// ------------------------------------------------------------------ home
function ring(value, max, size = 92, cls = '') {
  const r = size / 2 - 7, c = 2 * Math.PI * r, f = Math.min(1, value / max);
  return `<svg class="ring ${cls}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" style="--c:${c};--off:${c * (1 - f)}" stroke-dasharray="${c}" stroke-dashoffset="${c}"/></svg>`;
}

function homeView() {
  const plan = sessionPlan();
  const mins = minutesToday(), s = streak(), lv = level();
  const first = user.name.split(' ')[0];
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const cardsDue = cardQueue().length;
  const ref = plan.lesson ? LESSONS.get(plan.lesson.id) : null;
  const steps = [plan.warmIds.length && 'Warm-up', dueReviewCards().length && 'Cards', ref && 'Learn', ref && 'Practise', ref && CARDS[plan.lesson.id] && 'New cards', 'Mix'].filter(Boolean);

  app.innerHTML = `
    <section class="hello slide-up">
      <p class="eyebrow">${date}</p>
      <h1>Hi, ${escapeHtml(first)}</h1>
    </section>
    <section class="today slide-up" style="--d:1">
      <div class="today-top"><span class="eyebrow">Today’s session</span><span class="goal-mini">${ring(mins, DAILY_GOAL, 34)}<span><b id="mins">0</b>/${DAILY_GOAL} min</span></span></div>
      ${ref ? `<p class="today-subject"><span class="dot ${ref.subject.id}"></span>${ref.subject.name} · ${escapeHtml(ref.unit.code)}</p><h2>${escapeHtml(plan.lesson.title)}</h2>`
        : '<h2>Mixed review</h2><p class="muted">You’ve learned every topic. Keep them fresh.</p>'}
      <ol class="steps-line">${steps.map((t) => `<li>${t}</li>`).join('')}</ol>
      <a class="btn primary big wide" href="#/session">Start · about 20 min</a>
    </section>
    <section class="quick slide-up" style="--d:2">
      <div class="q-item"><b id="streak">0</b><small>day streak</small></div>
      <a class="q-item" href="#/cards"><b id="cdue">0</b><small>cards to review</small></a>
      <a class="q-item" href="#/profile"><b id="xp">0</b><small>XP · level ${lv}</small></a>
    </section>
    <section class="slide-up" style="--d:3">
      <h2>Activities</h2>
      <div class="activities">
        <a class="act" href="#/speed"><span class="act-i">⚡</span><b>Speed round</b><small>60 seconds${P.best.speed ? ` · best ${P.best.speed}` : ''}</small></a>
        <a class="act" href="#/explain"><span class="act-i">✍</span><b>Explain it</b><small>Teach a topic in your own words</small></a>
        <a class="act" href="#/guide"><span class="act-i">🏆</span><b>Get an A+</b><small>Methods that work</small></a>
      </div>
    </section>
    <section class="slide-up" style="--d:4">
      <div class="section-head"><h2>Subjects</h2><a href="#/topics" class="link">All topics</a></div>
      <div class="subject-list">${SUBJECTS.map((sub) => {
        const ids = sub.units.flatMap((u) => u.lessons.map((l) => l.id));
        const done = ids.filter((id) => P.lessons[id]?.learned).length;
        const dueN = ids.filter(isDue).length;
        return `<a class="subject-row" href="#/subject/${sub.id}"><span class="s-icon ${sub.id}">${sub.icon}</span>
          <span class="s-text"><b>${sub.name}</b><small>${escapeHtml(sub.sub)}${dueN ? ` · <span class="due">${dueN} to review</span>` : ''}</small></span>
          <span class="s-prog"><span class="sbar ${sub.id}"><i style="--w:${(100 * done) / ids.length}%"></i></span><small>${done}/${ids.length}</small></span></a>`;
      }).join('')}</div>
    </section>`;
  countUp($('#mins'), mins);
  countUp($('#streak'), s);
  countUp($('#xp'), P.xp);
  countUp($('#cdue'), cardsDue);
  requestAnimationFrame(() => $$('.ring-fg').forEach((c) => c.setAttribute('stroke-dashoffset', c.style.getPropertyValue('--off'))));
}

// ------------------------------------------------------------------ subject & topics
function subjectView(id) {
  const s = SUBJECTS.find((x) => x.id === id);
  if (!s) { location.hash = '#/'; return; }
  app.innerHTML = `
    <a href="#/" class="back">← Home</a>
    <h1 class="subject-title ${s.id}"><span>${s.icon}</span>${s.name} <small>${escapeHtml(s.sub)}</small></h1>
    ${s.units.map((u, ui) => `
      <section class="unit slide-up" style="--d:${ui}">
        <div class="unit-head"><div><span class="pill">${escapeHtml(u.code)}</span><h2>${escapeHtml(u.title)}</h2></div>
          <a class="btn small" href="#/test/${s.id}/${u.n}">📝 Unit test${P.tests[`${s.id}${u.n}`] != null ? ` · best ${P.tests[`${s.id}${u.n}`]}%` : ''}</a></div>
        <ul class="lesson-list">${u.lessons.map((l) => `
          <li class="${P.lessons[l.id]?.learned ? 'learned' : ''}">
            <div class="l-main"><b>${escapeHtml(l.title)}</b>${starHtml(l.id)}${isDue(l.id) ? '<span class="chip due">review due</span>' : ''}</div>
            <div class="l-actions"><a class="btn small ${P.lessons[l.id]?.learned ? 'ghost' : 'primary'}" href="#/lesson/${l.id}">${P.lessons[l.id]?.learned ? 'Re-learn' : 'Learn'}</a>
            <a class="btn small" href="#/practice/${l.id}">Practise</a>${CARDS[l.id] ? `<a class="btn small" href="#/cards/${l.id}">Cards</a>` : ''}<a class="btn small" href="#/explain/${l.id}">Explain</a></div>
          </li>`).join('')}</ul>
      </section>`).join('')}`;
}

function topicsView() {
  app.innerHTML = `
    <div class="section-head"><a href="#/" class="back">← Home</a>${window.Y9_PREVIEW ? '' : '<button class="btn small" id="print">🖨 Print</button>'}</div>
    <h1>All topics — revision sheet</h1>
    <p><a class="btn small" href="#/guide">🏆 How to get an A+</a></p>
    <p class="muted">Every topic in the app, with the key facts. Tap a topic title to learn it.</p>
    ${SUBJECTS.map((s) => `
      <section class="sheet ${s.id}">
        <h2 class="sheet-subject">${s.icon} ${s.name} <small>${escapeHtml(s.sub)}</small></h2>
        ${s.units.map((u) => `<div class="sheet-unit"><h3><span class="pill">${escapeHtml(u.code)}</span> ${escapeHtml(u.title)}</h3>
          ${u.lessons.map((l) => `<details class="sheet-lesson" open><summary><a href="#/lesson/${l.id}">${escapeHtml(l.title)}</a> ${starHtml(l.id)}</summary><ul>${l.keys.map((k) => `<li>${k}</li>`).join('')}</ul>${LIFE[l.id] ? `<p class="life-line"><b>In real life:</b> ${LIFE[l.id]}</p>` : ''}</details>`).join('')}
        </div>`).join('')}
      </section>`).join('')}`;
  $('#print')?.addEventListener('click', () => print());
}

// ------------------------------------------------------------------ learn slides
function runLearn(root, lesson, onDone) {
  studying = true;
  const slides = [...lesson.learn, { title: 'Key facts to remember', keysSlide: true }];
  let i = 0, simStop = null;
  const show = () => {
    simStop?.(); simStop = null;
    const s = slides[i];
    root.innerHTML = `
      <div class="learn">
        <div class="dots-bar">${slides.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>
        <article class="slide pop-in">
          <h2>${s.title}</h2>
          ${s.keysSlide ? `<ul class="keys">${lesson.keys.map((k, n) => `<li style="--d:${n}">${k}</li>`).join('')}</ul><p class="muted small">Read each one, then cover the screen and try to say them from memory.</p>${LIFE[lesson.id] ? `<div class="life"><b>In real life</b><p>${LIFE[lesson.id]}</p></div>` : ''}` : ''}
          ${s.html || ''}
          ${s.steps ? `<ol class="steps">${s.steps.map((st, n) => `<li data-n="${n}" class="${n === 0 ? 'show' : ''}">${st}</li>`).join('')}</ol>` : ''}
          ${s.sim ? '<div class="sim" id="sim"></div>' : ''}
        </article>
        <div class="learn-nav">
          <button class="btn ghost" id="prev" ${i === 0 ? 'disabled' : ''}>← Back</button>
          ${s.steps ? '<button class="btn" id="step">Next step ↓</button>' : ''}
          <button class="btn primary" id="next">${i === slides.length - 1 ? 'Start practising →' : 'Next →'}</button>
        </div>
      </div>`;
    if (s.sim && SIMS[s.sim]) simStop = SIMS[s.sim]($('#sim', root), s);
    const stepBtn = $('#step', root);
    const nextStep = () => {
      const hidden = $$('.steps li:not(.show)', root);
      if (hidden.length) { hidden[0].classList.add('show'); sound('tap'); }
      if (hidden.length <= 1 && stepBtn) stepBtn.hidden = true;
    };
    stepBtn?.addEventListener('click', nextStep);
    if (s.steps?.length === 1 && stepBtn) stepBtn.hidden = true;
    $('#prev', root).addEventListener('click', () => { i--; show(); });
    $('#next', root).addEventListener('click', () => {
      if (stepBtn && !stepBtn.hidden) { nextStep(); return; }
      if (i === slides.length - 1) { simStop?.(); onDone(); return; }
      i++; show();
    });
    keyHandler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); $('#next', root)?.click(); }
      if (e.key === 'ArrowLeft' && i > 0) { i--; show(); }
      if (e.key === ' ' && stepBtn && !stepBtn.hidden) { e.preventDefault(); nextStep(); }
    };
  };
  show();
  cleanup.push(() => simStop?.());
}

// ------------------------------------------------------------------ question runner
const PRAISE = ['Nice!', 'Correct!', 'Brilliant!', 'Spot on!', 'Great job!', 'Yes!', 'Excellent!'];

function runQuiz(root, { questions, mode = 'practice', title = '', onDone }) {
  studying = true;
  const queue = [...questions];
  const retried = new Set();
  const results = [];
  let i = 0, combo = 0, xp = 0;
  const start = Date.now();
  const test = mode === 'test';

  const next = () => {
    if (i >= queue.length) { keyHandler = null; onDone({ results, xp, secs: Math.round((Date.now() - start) / 1000) }); return; }
    renderQ(queue[i]);
  };

  function finish(q, correct, extraNote = '') {
    const first = !retried.has(q);
    if (first) results.push({ q, correct, lessonId: q.lessonId });
    if (test) { i++; next(); return; }
    if (correct) {
      combo++;
      const gain = (first ? 10 : 5) + Math.min(10, Math.max(0, combo - 2) * 2);
      xp += gain; P.xp += gain; save();
      sound(combo > 0 && combo % 5 === 0 ? 'combo' : 'correct');
      floatText(`+${gain} XP`, $('.qcard', root) || root, 'xp');
      if (combo % 5 === 0) confetti(60, { x: 0.5, y: 0.25 });
    } else {
      combo = 0;
      sound('wrong');
      $('.qcard', root)?.classList.add('shake');
      if (first && !test) { queue.push(q); retried.add(q); }
    }
    const sheet = document.createElement('div');
    sheet.className = `sheet-fb ${correct ? 'good' : 'bad'}`;
    sheet.innerHTML = `<div class="fb-inner"><div class="fb-title">${correct ? `✅ ${pick(PRAISE)}${combo >= 3 ? ` <span class="combo">🔥 ${combo} in a row</span>` : ''}` : '❌ Not quite'}</div>
      ${!correct ? `<div class="fb-answer"><small>Correct answer</small><div>${answerHtml(q)}</div></div>` : ''}
      ${extraNote ? `<p class="fb-note">${extraNote}</p>` : ''}
      ${q.why ? `<p class="fb-why">💡 ${q.why}</p>` : ''}
      ${!correct && retried.has(q) && results.at(-1)?.q === q ? '<p class="fb-note small">You’ll see this one again at the end.</p>' : ''}
      <button class="btn ${correct ? 'good' : 'bad'} wide" id="cont">Continue</button></div>`;
    root.append(sheet);
    requestAnimationFrame(() => sheet.classList.add('open'));
    const go = () => { sheet.remove(); i++; next(); };
    $('#cont', sheet).addEventListener('click', go);
    $('#cont', sheet).focus({ preventScroll: true });
    keyHandler = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
  }

  function renderQ(q) {
    const total = queue.length;
    root.innerHTML = `
      <div class="quiz">
        <div class="qtop"><button class="btn ghost small" id="quit" aria-label="Stop">✕</button>
          <div class="pbar"><i style="--w:${(100 * i) / total}%"></i></div>
          ${test ? `<span class="qtimer" id="qt"></span>` : `<span class="combo-badge ${combo >= 2 ? 'hot' : ''}">🔥 ${combo}</span>`}</div>
        ${title ? `<p class="qlabel">${title}${retried.has(q) ? ' · <b>try again</b>' : ''}</p>` : ''}
        <article class="qcard pop-in"><div class="qtext">${q.q}</div><div id="ans"></div></article>
        <div class="qbottom"><button class="btn primary wide" id="check" disabled>Check</button></div>
      </div>`;
    $('#quit', root).addEventListener('click', () => { toast('Stopped — your progress is saved.'); location.hash = '#/'; });
    if (test) {
      const tick = () => { const s = Math.round((Date.now() - start) / 1000); const el = $('#qt', root); if (el) el.textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
      tick(); const t = setInterval(tick, 1000); cleanup.push(() => clearInterval(t));
    }
    const ans = $('#ans', root), check = $('#check', root);
    let getResult = null;
    const ready = (fn) => { getResult = fn; check.disabled = !fn; };

    if (q.type === 'mcq' || q.type === 'tf') {
      const opts = q.type === 'tf' ? ['True', 'False'] : q.options;
      ans.innerHTML = `<div class="options ${q.type}">${opts.map((o, k) => `<button class="opt" data-k="${k}" style="--d:${k}"><kbd>${k + 1}</kbd><span>${o}</span></button>`).join('')}</div>`;
      const choose = (k) => {
        $$('.opt', ans).forEach((b) => b.classList.toggle('sel', Number(b.dataset.k) === k));
        sound('tap');
        ready(() => {
          const ok = q.type === 'tf' ? (k === 0) === q.answer : k === q.answer;
          $$('.opt', ans).forEach((b) => {
            const kk = Number(b.dataset.k);
            const right = q.type === 'tf' ? (kk === 0) === q.answer : kk === q.answer;
            if (!test && right) b.classList.add('right');
            if (!test && kk === k && !ok) b.classList.add('wrong');
            b.disabled = true;
          });
          return [ok];
        });
      };
      $$('.opt', ans).forEach((b) => b.addEventListener('click', () => choose(Number(b.dataset.k))));
      keyHandler = (e) => {
        const n = Number(e.key);
        if (n >= 1 && n <= opts.length) choose(n - 1);
        if (e.key === 'Enter' && getResult) { e.preventDefault(); check.click(); }
      };
    } else if (q.type === 'num' || q.type === 'text') {
      ans.innerHTML = `<input class="answer-input" id="inp" ${q.type === 'num' ? 'inputmode="decimal"' : ''} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${q.type === 'num' ? 'Type your answer' : 'Type your answer'}">
        ${q.type === 'num' ? '<p class="hint small">Numbers like 0.125, 1/8, −3 or 5.4 × 10^7 are all fine.</p>' : ''}`;
      const inp = $('#inp', ans);
      later(() => inp.focus({ preventScroll: true }), 250);
      inp.addEventListener('input', () => ready(inp.value.trim() ? () => {
        const r = checkTyped(q, inp.value);
        if (r === 'invalid') { inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); toast(q.type === 'num' ? 'Type a number, e.g. 2.5 or 1/4' : 'Type an answer'); return null; }
        inp.disabled = true;
        inp.classList.add(r === 'wrong' ? 'wrong' : 'right');
        return [r !== 'wrong', r === 'typo' ? `Small spelling slip — the answer is <b>${escapeHtml(q.answer)}</b>.` : ''];
      } : null));
      keyHandler = (e) => { if (e.key === 'Enter' && getResult) { e.preventDefault(); check.click(); } };
    } else if (q.type === 'match') {
      let selL = null, mistakes = 0, matched = 0;
      ans.innerHTML = `<div class="match"><div class="col">${q.pairs.map((p, k) => `<button class="m-item" data-l="${k}">${p[0]}</button>`).join('')}</div>
        <div class="col">${q.right.map((r, k) => `<button class="m-item" data-r="${k}">${r}</button>`).join('')}</div></div><p class="hint small">Tap one on the left, then its partner on the right.</p>`;
      check.hidden = true;
      $$('[data-l]', ans).forEach((b) => b.addEventListener('click', () => {
        if (b.classList.contains('done')) return;
        $$('[data-l]', ans).forEach((x) => x.classList.toggle('sel', x === b));
        selL = Number(b.dataset.l); sound('tap');
      }));
      $$('[data-r]', ans).forEach((b) => b.addEventListener('click', () => {
        if (selL == null || b.classList.contains('done')) return;
        const L = $(`[data-l="${selL}"]`, ans);
        if (q.pairs[selL][1] === q.right[Number(b.dataset.r)]) {
          L.classList.remove('sel'); L.classList.add('done'); b.classList.add('done');
          matched++; selL = null; sound('tap');
          if (matched === q.pairs.length) later(() => finish(q, mistakes === 0, mistakes ? `You matched them all, with ${mistakes} mistake${mistakes > 1 ? 's' : ''} on the way.` : ''), 350);
        } else {
          mistakes++;
          b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
          if (!test) sound('wrong');
        }
      }));
    } else if (q.type === 'order') {
      const placed = [];
      const draw = () => {
        ans.innerHTML = `<div class="order-slots">${placed.map((k, n) => `<button class="chip-o placed" data-p="${n}"><b>${n + 1}</b>${q.pool[k]}</button>`).join('') || '<span class="muted small">Tap the items below in the right order.</span>'}</div>
          <div class="order-pool">${q.pool.map((t, k) => placed.includes(k) ? '' : `<button class="chip-o" data-k="${k}">${t}</button>`).join('')}</div>`;
        $$('[data-k]', ans).forEach((b) => b.addEventListener('click', () => { placed.push(Number(b.dataset.k)); sound('tap'); draw(); }));
        $$('[data-p]', ans).forEach((b) => b.addEventListener('click', () => { placed.splice(Number(b.dataset.p)); draw(); }));
        ready(placed.length === q.pool.length ? () => {
          const ok = placed.every((k, n) => q.pool[k] === q.items[n]);
          if (!test) $$('.placed', ans).forEach((b, n) => b.classList.add(q.pool[placed[n]] === q.items[n] ? 'right' : 'wrong'));
          return [ok];
        } : null);
      };
      draw();
    }

    check.addEventListener('click', () => {
      if (!getResult) return;
      const r = getResult();
      if (!r) return;
      check.disabled = true;
      later(() => finish(q, r[0], r[1] || ''), test ? 150 : 250);
    });
  }

  next();
}

function resultsView(root, { results, xp, secs, title, onAgain, againLabel = 'Practise again', bonus = 0, review = true }) {
  studying = false;
  const correct = results.filter((r) => r.correct).length, total = results.length || 1;
  const pct = Math.round((100 * correct) / total);
  if (bonus) { P.xp += bonus; save(); }
  const wrong = results.filter((r) => !r.correct);
  const msg = pct >= 90 ? 'Outstanding! 🏆' : pct >= 75 ? 'Great work! 🌟' : pct >= 50 ? 'Good effort — keep going! 💪' : 'Keep practising — you’re learning! 🌱';
  root.innerHTML = `
    <section class="results pop-in">
      <h1>${title}</h1>
      <div class="res-ring">${ring(correct, total, 150, pct >= 75 ? 'good' : pct >= 50 ? 'mid' : 'low')}<span><b id="pct">0</b>%</span></div>
      <p class="res-msg">${msg}</p>
      <div class="res-stats"><div><b>${correct}/${results.length}</b><small>correct</small></div><div><b>+<span id="rx">0</span></b><small>XP</small></div><div><b>${Math.max(1, Math.round(secs / 60))}</b><small>min</small></div></div>
      ${review && wrong.length ? `<h2>Review your mistakes</h2><ul class="review">${wrong.map((r) => `<li><div class="rq">${r.q.q}</div><div class="ra"><small>Answer</small> ${answerHtml(r.q)}</div>${r.q.why ? `<div class="rw">💡 ${r.q.why}</div>` : ''}</li>`).join('')}</ul>` : ''}
      <div class="row center">${onAgain ? `<button class="btn" id="again">${againLabel}</button>` : ''}<a class="btn primary" href="#/">Home</a></div>
    </section>`;
  countUp($('#pct', root), pct);
  countUp($('#rx', root), xp + bonus);
  requestAnimationFrame(() => $$('.ring-fg', root).forEach((c) => c.setAttribute('stroke-dashoffset', c.style.getPropertyValue('--off'))));
  if (pct >= 70) later(() => { confetti(pct >= 90 ? 200 : 110); sound('finish'); }, 400);
  $('#again', root)?.addEventListener('click', onAgain);
}

// ------------------------------------------------------------------ lesson / practice / test
function lessonView(id) {
  const ref = LESSONS.get(id);
  if (!ref) { location.hash = '#/'; return; }
  document.body.classList.add('focus-mode');
  app.innerHTML = `<div class="crumb"><a href="#/subject/${ref.subject.id}">← ${ref.subject.name}</a> · ${escapeHtml(ref.unit.code)} · <b>${escapeHtml(ref.lesson.title)}</b></div><div id="stage"></div>`;
  const stage = $('#stage');
  runLearn(stage, ref.lesson, () => {
    const s = lessonState(id);
    if (!s.learned) { s.learned = true; s.box = 0; P.xp += 20; toast('📘 Topic learned! +20 XP'); }
    P.lastSubject = ref.subject.id;
    save();
    runPractice(stage, ref);
  });
}

function runPractice(stage, ref) {
  runQuiz(stage, {
    questions: practiceSet(ref.lesson, 8), title: ref.lesson.title,
    onDone: (r) => { recordResults(r.results); resultsView(stage, { ...r, title: ref.lesson.title, onAgain: () => runPractice(stage, ref) }); },
  });
}

function practiceView(id) {
  const ref = LESSONS.get(id);
  if (!ref) { location.hash = '#/'; return; }
  document.body.classList.add('focus-mode');
  app.innerHTML = '<div id="stage"></div>';
  runPractice($('#stage'), ref);
}

function testView(subjectId, unitN) {
  const s = SUBJECTS.find((x) => x.id === subjectId);
  const u = s?.units.find((x) => String(x.n) === String(unitN));
  if (!u) { location.hash = '#/'; return; }
  document.body.classList.add('focus-mode');
  app.innerHTML = `<section class="intro pop-in"><span class="pill">${escapeHtml(u.code)} · Unit test</span><h1>${escapeHtml(u.title)}</h1>
    <ul class="facts"><li>12 questions from every topic in this unit</li><li>No hints and no feedback until the end — just like a real test</li><li>Then you’ll see every mistake explained</li></ul>
    <button class="btn primary big" id="go">Start test</button></section>`;
  $('#go').addEventListener('click', () => {
    const qs = [];
    const lessons = shuffle(u.lessons);
    for (let k = 0; qs.length < 12; k++) {
      const l = lessons[k % lessons.length];
      qs.push(make(pick(l.practice), l.id));
    }
    const stage = app;
    runQuiz(stage, {
      questions: shuffle(qs), mode: 'test', title: `${u.code} test`,
      onDone: (r) => {
        const pct = Math.round((100 * r.results.filter((x) => x.correct).length) / r.results.length);
        const k = `${s.id}${u.n}`;
        P.tests[k] = Math.max(P.tests[k] ?? 0, pct);
        const xp = r.results.filter((x) => x.correct).length * 8;
        P.xp += xp; save();
        recordResults(r.results.filter((x) => P.lessons[x.lessonId]?.learned));
        resultsView(stage, { ...r, xp, title: `${u.code} test: ${pct}%`, onAgain: () => testView(subjectId, unitN), againLabel: 'Take it again' });
      },
    });
  });
}

// ------------------------------------------------------------------ flashcards (FSRS spaced repetition)
const ALL_CARDS = [];
for (const [lessonId, list] of Object.entries(CARDS)) list.forEach(([front, back], i) => ALL_CARDS.push({ id: `${lessonId}:${i}`, lessonId, front, back }));
const NEW_PER_DAY = 20;
const endOfToday = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };
const lessonOrder = [...LESSONS.keys()];

function dueReviewCards() {
  const now = Date.now(), end = endOfToday();
  return shuffle(ALL_CARDS.filter((c) => { const s = P.cards[c.id]; return s && (s.state === 'review' ? s.due <= end : s.due <= now + 20 * MIN); }));
}
function newCardsToday() {
  const left = Math.max(0, NEW_PER_DAY - (P.newCards[dayKey()] || 0));
  const learned = new Set(learnedIds());
  return ALL_CARDS.filter((c) => !P.cards[c.id])
    .sort((a, b) => (learned.has(b.lessonId) - learned.has(a.lessonId)) || (lessonOrder.indexOf(a.lessonId) - lessonOrder.indexOf(b.lessonId)))
    .slice(0, left);
}
const cardQueue = () => [...dueReviewCards(), ...newCardsToday()];

function rateCard(card, g) {
  const before = P.cards[card.id];
  if (!before) P.newCards[dayKey()] = (P.newCards[dayKey()] || 0) + 1;
  const base = before || { state: 'new', due: 0, stability: 0, difficulty: 0, reps: 0, lapses: 0, step: 0, lastReview: null };
  P.cards[card.id] = schedule(base, g, Date.now(), { id: card.id, retention: 0.9 });
  const gain = g === AGAIN ? 1 : 3;
  P.xp += gain;
  save();
  return gain;
}

function runCards(root, list, { title = 'Flashcards', onDone }) {
  studying = true;
  const queue = [...list];
  const again = []; // cards to see again in this sitting
  let current = null, flipped = false, reviewed = 0, knew = 0, xp = 0;
  const start = Date.now();

  const pickNext = () => {
    const now = Date.now();
    again.sort((a, b) => P.cards[a.id].due - P.cards[b.id].due);
    if (again.length && P.cards[again[0].id].due <= now) return again.shift();
    if (queue.length) return queue.shift();
    return again.shift() || null;
  };

  const show = () => {
    current = pickNext();
    flipped = false;
    if (!current) { keyHandler = null; finish(); return; }
    const ref = LESSONS.get(current.lessonId);
    const left = queue.length + again.length + 1;
    const pv = preview(P.cards[current.id] || { state: 'new', due: 0, stability: 0, difficulty: 0, reps: 0, lapses: 0, step: 0, lastReview: null }, Date.now(), { id: current.id, retention: 0.9 });
    root.innerHTML = `
      <div class="fc-wrap">
        <div class="qtop"><button class="btn ghost small" id="quit" aria-label="Stop">✕</button>
          <div class="pbar"><i style="--w:${(100 * reviewed) / (reviewed + left)}%"></i></div><span class="fc-left">${left} left</span></div>
        <p class="qlabel">${escapeHtml(title)}${!P.cards[current.id] ? ' · <b>new</b>' : ''}</p>
        <button class="fc ${ref.subject.id}" id="fc" aria-label="Flip card">
          <span class="fc-in">
            <span class="fc-face fc-front"><span class="fc-tag">${ref.subject.icon} ${escapeHtml(ref.lesson.title)}</span><span class="fc-text">${current.front}</span><span class="fc-hint">Think of the answer… then tap to flip</span></span>
            <span class="fc-face fc-back"><span class="fc-tag">${escapeHtml(current.front.replace(/<[^>]+>/g, ''))}</span><span class="fc-text">${current.back}</span></span>
          </span>
        </button>
        <div class="fc-rate" id="rate" hidden>
          ${[[AGAIN, 'Again', 'Forgot'], [HARD, 'Hard', 'Struggled'], [GOOD, 'Good', 'Got it'], [EASY, 'Easy', 'Instantly']].map(([g, n, d]) => `
            <button class="rate g${g}" data-g="${g}"><span class="ivl">${formatInterval(pv[g])}</span><b>${n}</b><small>${d}</small></button>`).join('')}
        </div>
        <button class="btn primary wide" id="flip">Show answer <kbd>Space</kbd></button>
      </div>`;
    $('#quit', root).addEventListener('click', () => { toast('Stopped — your progress is saved.'); location.hash = '#/cards'; });
    const flip = () => {
      if (flipped) return;
      flipped = true; sound('tap');
      $('#fc', root).classList.add('flipped');
      $('#rate', root).hidden = false;
      $('#flip', root).hidden = true;
    };
    $('#fc', root).addEventListener('click', flip);
    $('#flip', root).addEventListener('click', flip);
    $$('[data-g]', root).forEach((b) => b.addEventListener('click', () => rate(Number(b.dataset.g))));
    keyHandler = (e) => {
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); flip(); }
      else if (flipped && ['1', '2', '3', '4'].includes(e.key)) rate(Number(e.key));
    };
  };

  const rate = (g) => {
    if (!flipped || !current) return;
    const gain = rateCard(current, g);
    xp += gain; reviewed++;
    if (g !== AGAIN) knew++;
    sound(g === AGAIN ? 'wrong' : 'correct');
    floatText(`+${gain} XP`, $('#fc', root), 'xp');
    const st = P.cards[current.id];
    if (st.due <= Date.now() + 20 * MIN) again.push(current); // still learning: comes back in a few minutes
    const fc = $('#fc', root);
    fc.classList.add(g === AGAIN ? 'out-left' : 'out-right');
    keyHandler = null;
    later(show, 330);
  };

  const finish = () => {
    studying = false;
    const pct = reviewed ? Math.round((100 * knew) / reviewed) : 0;
    const tomorrow = ALL_CARDS.filter((c) => { const s = P.cards[c.id]; return s && s.due > endOfToday() && s.due <= endOfToday() + DAY; }).length;
    if (onDone) { onDone({ reviewed, knew, xp, secs: (Date.now() - start) / 1000 }); return; }
    root.innerHTML = `<section class="results pop-in"><h1>Cards done! 🃏</h1>
      <div class="res-stats"><div><b>${reviewed}</b><small>cards</small></div><div><b>${pct}%</b><small>knew it</small></div><div><b>+${xp}</b><small>XP</small></div></div>
      <p class="muted">${tomorrow ? `${tomorrow} card${tomorrow > 1 ? 's' : ''} will come back tomorrow.` : 'Cards you know come back later, just before you would forget them.'}</p>
      <div class="row center"><a class="btn" href="#/cards">Flashcards</a><a class="btn primary" href="#/">Home</a></div></section>`;
    if (reviewed) { confetti(90); sound('finish'); }
  };

  show();
}

function cardsView(lessonId) {
  document.body.classList.remove('focus-mode');
  if (lessonId) {
    const ref = LESSONS.get(lessonId);
    if (!ref || !CARDS[lessonId]) { location.hash = '#/cards'; return; }
    document.body.classList.add('focus-mode');
    app.innerHTML = '<div id="stage"></div>';
    runCards($('#stage'), shuffle(ALL_CARDS.filter((c) => c.lessonId === lessonId)), { title: ref.lesson.title });
    return;
  }
  const due = dueReviewCards(), fresh = newCardsToday(), q = [...due, ...fresh];
  const seen = ALL_CARDS.filter((c) => P.cards[c.id]).length;
  const strong = ALL_CARDS.filter((c) => P.cards[c.id]?.state === 'review' && P.cards[c.id].stability >= 7).length;
  app.innerHTML = `
    <section class="cards-hero slide-up">
      <div class="deck" aria-hidden="true"><span></span><span></span><span>🃏</span></div>
      <div><h1>Flashcards</h1><p class="muted">${ALL_CARDS.length} cards from all your topics. Cards you know come back less often; cards you forget come back soon.</p></div>
    </section>
    <section class="stat-row cards-stats slide-up" style="--d:1">
      <div class="stat"><div><b>${due.length}</b><small>due for review</small></div></div>
      <div class="stat"><div><b>${fresh.length}</b><small>new today</small></div></div>
      <div class="stat"><div><b>${seen}/${ALL_CARDS.length}</b><small>seen</small></div></div>
      <div class="stat"><div><b>${strong}</b><small>known well</small></div></div>
    </section>
    ${memoryHtml()}
    ${q.length ? `<button class="btn primary big wide slide-up" style="--d:2" id="go">▶ Study ${q.length} card${q.length > 1 ? 's' : ''}</button>` : '<p class="done-msg slide-up">All caught up for today! Come back tomorrow, or study a topic below.</p>'}
    ${SUBJECTS.map((s) => `<section class="unit slide-up" style="--d:3"><h2>${s.icon} ${s.name}</h2><ul class="lesson-list">${s.units.flatMap((u) => u.lessons).filter((l) => CARDS[l.id]).map((l) => {
      const cs = ALL_CARDS.filter((c) => c.lessonId === l.id);
      const known = cs.filter((c) => P.cards[c.id]?.state === 'review').length;
      return `<li><div class="l-main"><b>${escapeHtml(l.title)}</b><span class="chip">${known}/${cs.length} known</span></div><div class="l-actions"><a class="btn small" href="#/cards/${l.id}">Study</a></div></li>`;
    }).join('')}</ul></section>`).join('')}`;
  $('#go')?.addEventListener('click', () => { document.body.classList.add('focus-mode'); runCards(app, cardQueue(), { title: 'Flashcards' }); });
}

// ------------------------------------------------------------------ memory strength
function memoryHtml() {
  const now = Date.now();
  const rows = SUBJECTS.map((sub) => {
    const ids = new Set(sub.units.flatMap((u) => u.lessons.map((l) => l.id)));
    const seen = ALL_CARDS.filter((c) => ids.has(c.lessonId) && P.cards[c.id]?.stability);
    if (!seen.length) return '';
    const avg = seen.reduce((a, c) => { const st = P.cards[c.id]; return a + retrievability((now - st.lastReview) / DAY, st.stability); }, 0) / seen.length;
    const pct = Math.round(avg * 100);
    return `<div class="mem-row"><span class="dot ${sub.id}"></span><b>${sub.name}</b><span class="mem-bar"><i class="${pct < 80 ? 'low' : ''}" style="--w:${pct}%"></i></span><span class="mem-pct">${pct}%</span></div>`;
  }).join('');
  return rows ? `<section class="memory slide-up" style="--d:1"><h2>Memory strength</h2><p class="muted small">How much of each subject you’d remember right now, based on your flashcard reviews. Reviews push it back up.</p>${rows}</section>` : '';
}

// ------------------------------------------------------------------ explain it (self-explanation)
const keyWords = (k) => [...k.matchAll(/<b>(.*?)<\/b>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').toLowerCase()).filter((w) => w.length > 2);
const plainText = (h) => h.replace(/<[^>]+>/g, '');

function runExplain(root, lesson, { onDone } = {}) {
  studying = true;
  const ref = LESSONS.get(lesson.id);
  root.innerHTML = `
    <section class="explain pop-in">
      <p class="eyebrow">Explain it · ${ref.subject.name}</p>
      <h1>${escapeHtml(lesson.title)}</h1>
      <p class="muted">Explain this topic in your own words, as if you were teaching a friend. Don’t look at your notes. Short sentences are fine.</p>
      <textarea id="ex" rows="9" placeholder="Start writing… What is it? How does it work? An example?"></textarea>
      ${P.explains[lesson.id] ? '<p class="muted small">You’ve explained this before. Try again without looking — it’s good practice.</p>' : ''}
      <div class="row"><button class="btn primary wide" id="check" disabled>Check my explanation</button></div>
      ${onDone ? '<button class="btn ghost small" id="skip">Skip this step</button>' : ''}
    </section>`;
  const ta = $('#ex', root), btn = $('#check', root);
  setTimeout(() => ta.focus({ preventScroll: true }), 200);
  ta.addEventListener('input', () => { btn.disabled = ta.value.trim().length < 15; });
  $('#skip', root)?.addEventListener('click', () => onDone({ xp: 0, results: [] }));
  btn.addEventListener('click', () => {
    const text = ta.value.trim();
    const low = text.toLowerCase();
    P.explains[lesson.id] = { text, t: Date.now() };
    save();
    root.innerHTML = `
      <section class="explain pop-in">
        <p class="eyebrow">Check your explanation</p>
        <h1>${escapeHtml(lesson.title)}</h1>
        <div class="your-text"><small>You wrote</small><p>${escapeHtml(text).replace(/\n/g, '<br>')}</p></div>
        <p>Tick each key point you included. Points that look covered are already ticked — check each one honestly.</p>
        <ul class="tick-list">${lesson.keys.map((k, i) => {
          const words = keyWords(k);
          const hit = words.length && words.some((w) => low.includes(w.split(' ')[0]));
          return `<li><label><input type="checkbox" data-k="${i}" ${hit ? 'checked' : ''}><span>${k}</span></label></li>`;
        }).join('')}</ul>
        <p class="score-line" id="sc"></p>
        <button class="btn primary wide" id="done">Done</button>
      </section>`;
    const boxes = $$('[data-k]', root);
    const upd = () => { const n = boxes.filter((b) => b.checked).length; $('#sc', root).innerHTML = `You covered <b>${n} of ${boxes.length}</b> key points. ${n === boxes.length ? 'Brilliant — you really understand this!' : 'Read the ones you missed out loud — that’s how they stick.'}`; };
    boxes.forEach((b) => b.addEventListener('change', upd));
    upd();
    $('#done', root).addEventListener('click', () => {
      const results = boxes.map((b) => ({ correct: b.checked, lessonId: lesson.id, q: { q: plainText(lesson.keys[b.dataset.k]) } }));
      const xp = results.filter((r) => r.correct).length * 5;
      P.xp += xp; save();
      if (lessonState(lesson.id).learned) recordResults(results);
      if (results.every((r) => r.correct)) confetti(80);
      sound('finish');
      if (onDone) onDone({ xp, results });
      else { toast(`+${xp} XP`); location.hash = `#/subject/${ref.subject.id}`; }
    });
  });
}

function explainView(id) {
  let lessonId = id;
  if (!lessonId || !LESSONS.has(lessonId)) {
    const learned = learnedIds();
    lessonId = learned.length ? learned.sort((a, b) => (P.lessons[a].box - P.lessons[b].box) || ((P.explains[a]?.t || 0) - (P.explains[b]?.t || 0)))[0] : [...LESSONS.keys()][0];
  }
  document.body.classList.add('focus-mode');
  app.innerHTML = '<div id="stage"></div>';
  runExplain($('#stage'), LESSONS.get(lessonId).lesson);
}

// ------------------------------------------------------------------ speed round
function speedView() {
  document.body.classList.add('focus-mode');
  const learned = learnedIds();
  const pool = (learned.length >= 2 ? learned : [...LESSONS.keys()]).map((id) => LESSONS.get(id).lesson);
  const nextQ = () => {
    for (let k = 0; k < 40; k++) {
      const l = pick(pool);
      const q = make(pick(l.practice), l.id);
      if (q.type === 'mcq' || q.type === 'tf' || (q.type === 'num' && !q.tol)) return q;
    }
    return make(pick(pool[0].practice), pool[0].id);
  };
  app.innerHTML = `<section class="intro pop-in"><p class="eyebrow">Speed round</p><h1>60 seconds</h1>
    <p class="muted">Answer as many as you can. Questions come from ${learned.length >= 2 ? 'topics you have learned' : 'all subjects'}.${P.best.speed ? ` Your best: <b>${P.best.speed}</b>.` : ''}</p>
    <button class="btn primary big" id="go">Start</button></section>`;
  $('#go').addEventListener('click', () => {
    studying = true;
    const end = Date.now() + 60000;
    let score = 0, streakN = 0, q = null;
    const wrong = [];
    const tick = setInterval(() => {
      const left = Math.max(0, end - Date.now());
      const bar = $('#tbar'); if (bar) bar.style.width = `${(100 * left) / 60000}%`;
      const t = $('#tleft'); if (t) t.textContent = Math.ceil(left / 1000);
      if (left <= 0) { clearInterval(tick); finish(); }
    }, 100);
    cleanup.push(() => clearInterval(tick));
    const show = () => {
      q = nextQ();
      app.innerHTML = `<div class="speed"><div class="speed-top"><span class="speed-score">${score}</span><span class="speed-time"><span id="tleft">${Math.ceil((end - Date.now()) / 1000)}</span>s</span></div>
        <div class="tbar"><i id="tbar"></i></div>
        <article class="qcard pop-in"><div class="qtext">${q.q}</div><div id="ans"></div></article></div>`;
      const ans = $('#ans');
      if (q.type === 'num') {
        ans.innerHTML = '<input class="answer-input" id="inp" inputmode="decimal" autocomplete="off" placeholder="Answer, then Enter"><div class="row"><button class="btn primary" id="ok">OK</button><button class="btn ghost" id="sk">Skip</button></div>';
        const inp = $('#inp'); inp.focus({ preventScroll: true });
        const go = () => { const r = checkTyped(q, inp.value); if (r === 'invalid') { inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); return; } mark(r !== 'wrong'); };
        $('#ok').addEventListener('click', go);
        $('#sk').addEventListener('click', () => mark(false));
        keyHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
      } else {
        const opts = q.type === 'tf' ? ['True', 'False'] : q.options;
        ans.innerHTML = `<div class="options ${q.type}">${opts.map((o, k) => `<button class="opt" data-k="${k}"><kbd>${k + 1}</kbd><span>${o}</span></button>`).join('')}</div>`;
        const choose = (k) => mark(q.type === 'tf' ? (k === 0) === q.answer : k === q.answer, k);
        $$('.opt', ans).forEach((b) => b.addEventListener('click', () => choose(Number(b.dataset.k))));
        keyHandler = (e) => { const n = Number(e.key); if (n >= 1 && n <= opts.length) choose(n - 1); };
      }
    };
    const mark = (ok, k) => {
      keyHandler = null;
      if (ok) { score++; streakN++; sound('correct'); } else { streakN = 0; sound('wrong'); wrong.push(q); }
      const card = $('.qcard');
      card.classList.add(ok ? 'flash-good' : 'flash-bad');
      if (!ok) card.insertAdjacentHTML('beforeend', `<p class="speed-answer">Answer: <b>${answerHtml(q)}</b></p>`);
      if (k != null) $$('.opt').forEach((b, i) => { if ((q.type === 'tf' ? (i === 0) === q.answer : i === q.answer)) b.classList.add('right'); else if (i === k) b.classList.add('wrong'); b.disabled = true; });
      later(() => { if (Date.now() < end) show(); }, ok ? 350 : 1300);
    };
    const finish = () => {
      keyHandler = null; studying = false;
      const best = P.best.speed || 0;
      const isBest = score > best;
      if (isBest) P.best.speed = score;
      P.xp += score * 3; save();
      app.innerHTML = `<section class="results pop-in"><p class="eyebrow">Speed round</p><h1>${isBest ? 'New best score!' : 'Time’s up!'}</h1>
        <div class="big-score">${score}</div><p class="muted">correct answers${best && !isBest ? ` · your best is ${best}` : ''} · +${score * 3} XP</p>
        ${wrong.length ? `<h2>Learn from these</h2><ul class="review">${wrong.map((w) => `<li><div class="rq">${w.q}</div><div class="ra"><small>Answer</small> ${answerHtml(w)}</div>${w.why ? `<div class="rw">💡 ${w.why}</div>` : ''}</li>`).join('')}</ul>` : ''}
        <div class="row center"><a class="btn" href="#/speed" id="again">Play again</a><a class="btn primary" href="#/">Home</a></div></section>`;
      $('#again').addEventListener('click', (e) => { e.preventDefault(); render(); });
      if (isBest || score >= 10) { confetti(120); sound('finish'); }
    };
    show();
  });
}

// ------------------------------------------------------------------ A+ guide
const COMMAND_WORDS = [
  ['State / Name', 'Give a short answer — no explanation needed'],
  ['Describe', 'Say what happens or what something is like'],
  ['Explain', 'Say WHY or HOW — use “because” and “so”'],
  ['Compare', 'Give similarities AND differences, using “whereas”'],
  ['Calculate', 'Work out a number — show your working'],
  ['Suggest', 'Use what you know in a new situation'],
  ['Evaluate', 'Give points for and against, then make a judgement'],
];

function guideView() {
  app.innerHTML = `
    <a href="#/" class="back">← Home</a>
    <h1>How to get an A+</h1>
    <p class="lead-text">Smart students don’t study for longer. They study in ways that make memories stick. These are the methods with the strongest evidence from research.</p>

    <section class="guide-block"><h2>1 · Five habits that work</h2>
      <ol class="guide-list">
        <li><b>Test yourself</b> — close the book and try to answer. Pulling an answer out of your memory makes it much stronger than re-reading. <span class="muted">In the app: quizzes, flashcards, speed round.</span></li>
        <li><b>Space it out</b> — 20 minutes every day beats 3 hours the night before. Review just before you would forget. <span class="muted">In the app: the daily session and flashcard reviews.</span></li>
        <li><b>Mix topics</b> — practise different topics together, not one at a time. It trains you to pick the right method, like in a real exam. <span class="muted">In the app: “Mix it up”.</span></li>
        <li><b>Explain it</b> — teach the topic in your own words, as if to a friend. Gaps in what you know become obvious. <span class="muted">In the app: “Explain it”.</span></li>
        <li><b>Words + pictures</b> — draw it: a timeline, the rock cycle, a labelled bacterium. Two kinds of memory are better than one.</li>
      </ol>
      <p class="warn-box"><b>What doesn’t work well:</b> re-reading notes, highlighting, and copying out neatly. They feel productive, but you remember very little.</p>
    </section>

    <section class="guide-block"><h2>2 · In the exam</h2>
      <ul class="guide-list">
        <li><b>Read the question twice.</b> Underline the command word and the number of marks.</li>
        <li><b>Marks = points.</b> A 4-mark question needs about 4 separate points.</li>
        <li><b>About 1 minute per mark.</b> Never leave a question blank — a sensible guess can still score.</li>
        <li><b>Maths:</b> show every step (method marks!), include units, round as asked, estimate to check.</li>
        <li><b>Science:</b> use the key words (diffusion, chlorophyll, alloy…) and link cause to effect: “…because…, so…”.</li>
        <li><b>English:</b> Point, Evidence (a short quote), Explain what it shows and what Golding wants us to think.</li>
        <li><b>History:</b> use exact dates, names and facts. For “explain why”, give several causes and link them.</li>
        <li><b>Geography:</b> describe processes in order and name real places (Malham, Cheddar Gorge).</li>
      </ul>
    </section>

    <section class="guide-block"><h2>3 · Command words</h2>
      <div class="mini-wrap"><table class="mini">${COMMAND_WORDS.map(([w, m]) => `<tr><td><b>${w}</b></td><td>${m}</td></tr>`).join('')}</table></div>
      <button class="btn primary" id="cw">Practise command words</button>
    </section>

    <section class="guide-block"><h2>4 · Remember it for life</h2>
      <ul class="guide-list">
        <li><b>Keep reviewing, a little.</b> Ten minutes of flashcards a few times a week keeps everything. The gaps between reviews grow to months, so it takes less and less time.</li>
        <li><b>Connect it to real life.</b> Every topic has an “In real life” note. A fact linked to something you know lasts far longer.</li>
        <li><b>Teach someone at home.</b> Explaining to a parent or sibling is one of the strongest ways to remember.</li>
        <li><b>Make memory hooks.</b> MAIN for the causes of WW1. Stalac<b>t</b>ites hang from the <b>t</b>op. Invent your own — silly ones work best.</li>
        <li><b>Sleep 9 hours.</b> Your brain saves the day’s learning while you sleep. All-nighters wipe it.</li>
        <li><b>Phone in another room.</b> Even a silent phone on the desk steals attention.</li>
      </ul>
    </section>

    <section class="guide-block"><h2>5 · Your week</h2>
      <div class="mini-wrap"><table class="mini">
        <tr><td><b>Mon–Fri</b></td><td>Today’s session (about 20 min)</td></tr>
        <tr><td><b>Saturday</b></td><td>Speed round + explain one topic (10 min)</td></tr>
        <tr><td><b>Sunday</b></td><td>Flashcards only, or rest</td></tr>
        <tr><td><b>Before a test</b></td><td>Unit test → review every mistake → flashcards for that topic</td></tr>
      </table></div>
    </section>`;
  $('#cw').addEventListener('click', () => {
    document.body.classList.add('focus-mode');
    const qs = shuffle(COMMAND_WORDS).map(([w, m]) => mcq(`Which command word means: <b>${m.toLowerCase()}</b>?`, w, shuffle(COMMAND_WORDS.filter((c) => c[0] !== w).map((c) => c[0])).slice(0, 3),
      { why: `<b>${w}</b>: ${m}.` }));
    runQuiz(app, { questions: qs, title: 'Command words', onDone: (r) => resultsView(app, { ...r, title: 'Command words' }) });
  });
}

// ------------------------------------------------------------------ today's session
function sessionView() {
  document.body.classList.add('focus-mode');
  const plan = sessionPlan();
  const phases = [];
  if (plan.warmIds.length) phases.push({ kind: 'quiz', label: 'Warm-up', questions: () => plan.warmIds.map((id) => make(pick(LESSONS.get(id).lesson.practice), id)) });
  const dueCards = dueReviewCards().slice(0, 10);
  if (dueCards.length) phases.push({ kind: 'cards', label: 'Flashcards', cards: () => dueCards });
  if (plan.lesson) {
    const ref = LESSONS.get(plan.lesson.id);
    phases.push({ kind: 'learn', label: 'Learn', ref });
    phases.push({ kind: 'quiz', label: 'Practise', questions: () => practiceSet(plan.lesson, 8) });
    if (CARDS[plan.lesson.id]) phases.push({ kind: 'cards', label: 'New cards', cards: () => ALL_CARDS.filter((c) => c.lessonId === plan.lesson.id && !P.cards[c.id]).slice(0, 8) });
    phases.push({ kind: 'explain', label: 'Explain it', lesson: plan.lesson });
  }
  phases.push({ kind: 'quiz', label: 'Mix it up', questions: () => {
    const pool = learnedIds().filter((id) => id !== plan.lesson?.id);
    const ids = pool.length ? shuffle(pool) : [plan.lesson?.id].filter(Boolean);
    const out = [];
    for (let k = 0; out.length < 5 && ids.length; k++) { const id = ids[k % ids.length]; out.push(make(pick(LESSONS.get(id).lesson.practice), id)); }
    return out;
  } });
  const all = [];
  let xpTotal = 0;
  const started = Date.now();
  app.innerHTML = `<div class="phases" id="ph"></div><div id="stage"></div>`;
  const stage = $('#stage');
  const header = (n) => {
    $('#ph').innerHTML = phases.map((p, k) => `<span class="${k < n ? 'done' : k === n ? 'on' : ''}">${k < n ? '✓' : k + 1}. ${p.label}</span>`).join('<i></i>');
  };
  const runPhase = (n) => {
    if (n >= phases.length) {
      P.sessions++; save();
      const mins = Math.round((Date.now() - started) / 60000);
      resultsView(stage, { results: all, xp: xpTotal, secs: (Date.now() - started) / 1000, title: 'Session complete!', bonus: 50,
        onAgain: () => extraRound(), againLabel: `⚡ +10 min challenge${mins >= 25 ? ' (optional)' : ''}` });
      $('#ph').innerHTML = '';
      return;
    }
    header(n);
    const p = phases[n];
    if (p.kind === 'learn') {
      runLearn(stage, p.ref.lesson, () => {
        const s = lessonState(p.ref.lesson.id);
        if (!s.learned) { s.learned = true; s.box = 0; P.xp += 20; xpTotal += 20; }
        P.lastSubject = p.ref.subject.id; save();
        runPhase(n + 1);
      });
      return;
    }
    if (p.kind === 'explain') {
      runExplain(stage, p.lesson, { onDone: (r) => { xpTotal += r.xp; all.push(...r.results); runPhase(n + 1); } });
      return;
    }
    if (p.kind === 'cards') {
      const list = p.cards();
      if (!list.length) { runPhase(n + 1); return; }
      stage.innerHTML = `<div class="phase-intro pop-in"><span class="pill">${p.label}</span><h2>${p.label === 'Flashcards' ? 'Flashcards due today' : 'Lock in the key facts'}</h2>
        <p class="muted">Say the answer in your head, flip, then be honest about how well you knew it.</p></div>`;
      later(() => runCards(stage, list, { title: p.label, onDone: (r) => { xpTotal += r.xp; runPhase(n + 1); } }), 1300);
      return;
    }
    const questions = p.questions();
    if (!questions.length) { runPhase(n + 1); return; }
    stage.innerHTML = `<div class="phase-intro pop-in"><span class="pill">${p.label}</span><h2>${{ 'Warm-up': 'Can you still remember these?', Practise: 'Your turn!', 'Mix it up': 'Mixed questions — different topics' }[p.label]}</h2>
      <p class="muted">${{ 'Warm-up': 'Trying to remember older topics is what makes them stick.', Practise: 'Mistakes come back at the end so you can get them right.', 'Mix it up': 'Switching between topics trains your brain to choose the right method.' }[p.label]}</p></div>`;
    later(() => runQuiz(stage, { questions, title: p.label, onDone: (r) => { all.push(...r.results); xpTotal += r.xp; recordResults(r.results); runPhase(n + 1); } }), 1300);
  };
  const extraRound = () => {
    const ids = learnedIds();
    const qs = shuffle(ids).slice(0, 8).map((id) => make(pick(LESSONS.get(id).lesson.practice), id));
    while (qs.length < 8 && ids.length) { const id = pick(ids); qs.push(make(pick(LESSONS.get(id).lesson.practice), id)); }
    runQuiz(stage, { questions: qs, title: 'Challenge round', onDone: (r) => { recordResults(r.results); resultsView(stage, { ...r, title: 'Challenge complete!', bonus: 20 }); } });
  };
  runPhase(0);
}

// ------------------------------------------------------------------ profile
function profileView() {
  const learned = learnedIds().length, total = LESSONS.size;
  app.innerHTML = `
    <a href="#/" class="back">← Home</a>
    <section class="profile pop-in">
      <div class="avatar big">${user.photo ? `<img src="${escapeHtml(user.photo)}" alt="" referrerpolicy="no-referrer">` : escapeHtml(user.name[0] || '?')}</div>
      <h1>${escapeHtml(user.name)}</h1><p class="muted">${user.google ? escapeHtml(user.email) : 'Guest — progress is saved on this device only'}</p>
      <div class="res-stats"><div><b>${P.xp}</b><small>XP</small></div><div><b>${level()}</b><small>level</small></div><div><b>${learned}/${total}</b><small>topics</small></div><div><b>${P.sessions}</b><small>sessions</small></div></div>
      <label class="check"><input type="checkbox" id="snd" ${P.sound ? 'checked' : ''}> Sound effects</label>
      <div class="row center"><button class="btn" id="out">Sign out</button><button class="btn danger" id="reset">Reset my progress</button></div>
      <p class="small muted">Progress is saved in this browser, separately for each account.</p>
    </section>`;
  $('#snd').addEventListener('change', (e) => { P.sound = e.target.checked; setSound(P.sound); save(); });
  $('#out').addEventListener('click', () => { signOutUser(); user = null; location.hash = '#/'; render(); });
  $('#reset').addEventListener('click', (e) => {
    if (!e.target.dataset.armed) { e.target.dataset.armed = '1'; e.target.textContent = 'Tap again to reset everything'; return; }
    P = blank(); save(); toast('Progress reset.'); render();
  });
}

render();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
