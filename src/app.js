import { AGAIN, HARD, GOOD, EASY, DAY, MIN, preview, formatInterval } from './scheduler.js';
import { escapeHtml, format, renderCard, checkAnswer, parseBulk, nextClozeNumber, clozeNumbers } from './cards.js';
import {
  load, save, migrate, emptyState, addDeck, deleteDeck, saveNote, deleteNote, answer, undo, counts,
  nextCard, nextLearningDue, streak, trueRetention, forecast, reviewsPerDay, dayKey, dayStart,
} from './store.js';
import { GUIDE_HTML, TIPS, STARTER_DECK } from './content.js';

let state = load();
const app = document.getElementById('app');
let session = null;
let blurt = null;
let timer = null;

const RATING_LABELS = { [AGAIN]: 'Again', [HARD]: 'Hard', [GOOD]: 'Good', [EASY]: 'Easy' };
const $ = (sel, root = app) => root.querySelector(sel);
const $$ = (sel, root = app) => [...root.querySelectorAll(sel)];

function persist() {
  if (!save(state)) toast('Storage is full — export a backup in Settings.');
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}

function addStarterDeck() {
  const deck = addDeck(state, STARTER_DECK.name);
  for (const n of STARTER_DECK.notes) saveNote(state, { deckId: deck.id, back: '', extra: '', reverse: false, ...n });
  return deck;
}

if (!state.seeded) {
  addStarterDeck();
  state.seeded = true;
  persist();
}

const deckName = (id) => state.decks.find((d) => d.id === id)?.name ?? 'Deleted deck';
const noteOf = (card) => state.notes.find((n) => n.id === card.noteId);
const plain = (s, max = 90) => {
  const t = String(s ?? '').replace(/\{\{c\d+::(.*?)(::.*?)?\}\}/g, '$1').replace(/\*\*|`/g, '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
};

// ---------------------------------------------------------------- router

function route() {
  const [name = '', arg = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return { name, arg: decodeURIComponent(arg) };
}

function render() {
  clearInterval(timer);
  timer = null;
  const { name, arg } = route();
  const views = { '': home, study, deck, add: (a) => editor(null, a), edit: (a) => editor(a), recall, stats, guide, settings };
  (views[name] || home)(arg);
  $$('nav a', document).forEach((a) => {
    const target = a.getAttribute('href').replace('#/', '');
    a.classList.toggle('active', target === name || (target === '' && ['deck', 'add', 'edit'].includes(name)));
  });
}

window.addEventListener('hashchange', render);

// ---------------------------------------------------------------- home

function home() {
  session = null;
  const now = Date.now();
  const c = counts(state, now);
  const due = c.learning + c.review;
  const tip = TIPS[Math.floor(dayStart(now) / DAY) % TIPS.length];
  const ret = trueRetention(state, now);
  const s = streak(state, now);

  app.innerHTML = `
    <section class="hero">
      <div class="hero-nums">
        <div><span class="big">${due}</span><span class="label">to review</span></div>
        <div><span class="big new">${c.newToday}</span><span class="label">new today</span></div>
      </div>
      ${due + c.newToday
        ? `<a class="btn primary big-btn" href="#/study">Start practice</a>`
        : `<p class="done-msg">All done for today. Come back tomorrow — spacing is what makes it stick.</p>`}
      <div class="hero-meta">
        <span>${s ? `🔥 ${s}-day streak` : 'Start a streak today'}</span>
        ${ret && ret.total >= 20 ? `<span>Remembered ${Math.round(ret.rate * 100)}% (30 days)</span>` : ''}
      </div>
    </section>
    <p class="tip"><strong>Tip:</strong> ${escapeHtml(tip)}</p>
    <section>
      <div class="section-head">
        <h2>Decks</h2>
        <form id="new-deck" class="inline-form">
          <input name="name" placeholder="New deck name" aria-label="New deck name" required maxlength="80">
          <button class="btn">Add deck</button>
        </form>
      </div>
      <ul class="deck-list">
        ${state.decks.map((d) => {
          const dc = counts(state, now, d.id);
          const total = state.notes.filter((n) => n.deckId === d.id).length;
          return `<li>
            <a class="deck-name" href="#/deck/${d.id}">${escapeHtml(d.name)}</a>
            <span class="deck-counts">
              <span class="due" title="Due">${dc.learning + dc.review}</span>
              <span class="new" title="New today">${dc.newToday}</span>
              <span class="muted" title="Notes">${total} notes</span>
            </span>
            <a class="btn small" href="#/study/${d.id}">Study</a>
          </li>`;
        }).join('') || '<li class="muted">No decks yet. Create one above.</li>'}
      </ul>
    </section>`;

  $('#new-deck').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = addDeck(state, e.target.name.value);
    persist();
    location.hash = `#/add/${d.id}`;
  });
}

// ---------------------------------------------------------------- study

function startSession(deckId) {
  session = { deckId: deckId || null, seenNotes: new Set(), sinceNew: 0, reviewed: 0, again: 0, started: Date.now(),
    current: null, revealed: false, typed: '', shownAt: 0, history: [] };
}

function study(deckId) {
  if (!session || session.deckId !== (deckId || null)) startSession(deckId);
  const now = Date.now();
  if (!session.current) {
    session.current = nextCard(state, now, session);
    session.revealed = false;
    session.typed = '';
    session.shownAt = now;
  } else {
    // The card may have been edited or deleted while we were away.
    session.current = state.cards.find((c) => c.id === session.current.id) || null;
    if (!session.current) return study(deckId);
  }
  const card = session.current;
  if (!card) return finished();

  const note = noteOf(card);
  const c = counts(state, now, session.deckId);
  const view = renderCard(note, card.variant);
  const typing = state.settings.typeAnswers && view.expected;
  const long = view.expected.length > 40;
  const badge = card.state === 'new' ? 'New' : card.state === 'review' ? 'Review' : card.state === 'learning' ? 'Learning' : 'Relearning';
  const isCloze = card.variant.startsWith('c');

  let revealHtml = '';
  if (session.revealed) {
    let verdict = typing ? checkAnswer(session.typed, view.expected) : 'blank';
    // Long answers in your own words can't be string-matched fairly: let the learner judge.
    if (verdict === 'wrong' && long) verdict = 'compare';
    const suggest = { exact: GOOD, close: HARD, wrong: AGAIN }[verdict];
    const pv = preview(card, now, { retention: state.settings.retention, id: card.id });
    const verdictText = {
      exact: '✓ Correct',
      close: '≈ Almost — check the details',
      wrong: '✗ Not quite — compare carefully',
      compare: 'Compare with the answer below — same idea counts.',
    }[verdict];
    revealHtml = `
      ${verdict !== 'blank' ? `<div class="typed ${verdict}"><span class="verdict">${verdictText}</span>
        <span class="you">You wrote: ${escapeHtml(session.typed)}</span></div>` : ''}
      ${isCloze ? '' : `<hr><div class="answer">${view.answer || '<span class="muted">(no answer)</span>'}</div>`}
      ${note.extra ? `<div class="extra"><span class="label">Why / example</span>${format(note.extra)}</div>` : ''}
      ${card.leech ? `<div class="warn">🩹 <strong>Leech:</strong> you've forgotten this ${card.lapses} times. More repetition won't fix it —
        <a href="#/edit/${note.id}">rewrite it</a>: make it smaller, add a why or an example, or a memory hook.</div>` : ''}
      <div class="ratings" role="group" aria-label="How well did you remember?">
        ${[AGAIN, HARD, GOOD, EASY].map((g) => `
          <button class="rate g${g} ${suggest === g ? 'suggested' : ''}" data-rate="${g}">
            <span class="ivl">${formatInterval(pv[g])}</span>
            <span class="name">${RATING_LABELS[g]}</span>
            <kbd>${g}</kbd>
          </button>`).join('')}
      </div>`;
  }

  app.innerHTML = `
    <div class="study-bar">
      <a href="#/" class="btn ghost small" aria-label="Stop">✕ Stop</a>
      <span class="queue" title="Learning · Review · New">
        <span class="learn">${c.learning}</span><span class="due">${c.review}</span><span class="new">${c.newToday}</span>
      </span>
      <span class="muted small">${session.deckId ? escapeHtml(deckName(session.deckId)) : 'All decks, mixed'}</span>
    </div>
    <article class="card">
      <div class="card-meta"><span>${escapeHtml(deckName(note.deckId))}</span><span class="badge ${card.state}">${badge}</span></div>
      <div class="question">${session.revealed && isCloze ? view.answer : view.question}</div>
      ${!session.revealed && card.state === 'new' ? '<p class="hint">New card — have a guess before you look. Even a wrong guess helps.</p>' : ''}
      ${!session.revealed ? `
        ${typing
          ? (long
            ? `<textarea id="typed" rows="3" placeholder="Type your answer… (Ctrl+Enter to check)" autocomplete="off"></textarea>`
            : `<input id="typed" placeholder="Type your answer… (Enter to check)" autocomplete="off" autocapitalize="off" spellcheck="false">`)
          : '<p class="hint">Answer out loud or in your head first.</p>'}
        <button class="btn primary wide" id="reveal">Show answer <kbd>Space</kbd></button>` : revealHtml}
      <div class="card-tools">
        <a href="#/edit/${note.id}" class="btn ghost small">Edit <kbd>E</kbd></a>
        ${session.history.length ? '<button class="btn ghost small" id="undo">Undo <kbd>U</kbd></button>' : ''}
      </div>
    </article>`;

  const input = $('#typed');
  if (input) {
    input.value = session.typed;
    if (matchMedia('(hover: hover)').matches) input.focus();
    input.addEventListener('input', () => { session.typed = input.value; });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (input.tagName === 'INPUT' || e.ctrlKey || e.metaKey)) { e.preventDefault(); reveal(); }
    });
  }
  $('#reveal')?.addEventListener('click', reveal);
  $('#undo')?.addEventListener('click', undoLast);
  $$('[data-rate]').forEach((b) => b.addEventListener('click', () => rate(Number(b.dataset.rate))));
}

function reveal() {
  if (!session?.current || session.revealed) return;
  session.revealed = true;
  render();
}

function rate(g) {
  if (!session?.current || !session.revealed) return;
  const now = Date.now();
  const card = session.current;
  const spent = Math.min(now - session.shownAt, 60000);
  const { before } = answer(state, card.id, g, now, spent);
  session.history.push({ before, reviewed: session.reviewed, again: session.again, sinceNew: session.sinceNew,
    hadNote: session.seenNotes.has(card.noteId) });
  if (session.history.length > 20) session.history.shift();
  session.seenNotes.add(card.noteId);
  session.sinceNew = before.state === 'new' ? 0 : session.sinceNew + 1;
  session.reviewed++;
  if (g === AGAIN) session.again++;
  session.current = null;
  persist();
  render();
}

function undoLast() {
  const h = session?.history.pop();
  if (!h) return;
  undo(state, h.before);
  Object.assign(session, { reviewed: h.reviewed, again: h.again, sinceNew: h.sinceNew, current: h.before,
    revealed: false, typed: '', shownAt: Date.now() });
  if (!h.hadNote) session.seenNotes.delete(h.before.noteId);
  persist();
  render();
}

function finished() {
  const now = Date.now();
  const next = nextLearningDue(state, session.deckId);
  const mins = Math.round((now - session.started) / MIN);
  const tomorrow = forecast(state, now, 2)[1];
  const waiting = next && next < dayStart(now) + DAY;

  app.innerHTML = `
    <section class="finished">
      <h1>${session.reviewed ? 'Nice work!' : 'Nothing to study right now'}</h1>
      ${session.reviewed ? `
        <div class="hero-nums">
          <div><span class="big">${session.reviewed}</span><span class="label">answers</span></div>
          <div><span class="big">${Math.round(100 * (1 - session.again / session.reviewed))}%</span><span class="label">remembered</span></div>
          <div><span class="big">${Math.max(1, mins)}</span><span class="label">min</span></div>
        </div>` : ''}
      ${waiting ? `<p>A few cards you just learned come back <strong id="countdown">in ${formatInterval(next - now)}</strong>.
        Stay or come back later — the app will show them when they're ready.</p>`
        : `<p>${tomorrow ? `Tomorrow: <strong>${tomorrow}</strong> card${tomorrow === 1 ? '' : 's'} to review.` : 'Add some new cards to keep learning.'}</p>
           <p class="muted">Stopping here is right. Cards you know will come back just before you'd forget them.</p>`}
      <div class="row">
        <a class="btn" href="#/">Home</a>
        <a class="btn" href="#/recall">Free recall</a>
        ${session.deckId ? `<a class="btn" href="#/add/${session.deckId}">Add cards</a>` : ''}
      </div>
    </section>`;

  if (waiting) {
    timer = setInterval(() => {
      const left = next - Date.now();
      if (left <= 0) { session.current = null; render(); return; }
      const el = document.getElementById('countdown');
      if (el) el.textContent = `in ${left < MIN ? `${Math.ceil(left / 1000)}s` : formatInterval(left)}`;
    }, 1000);
  }
}

document.addEventListener('keydown', (e) => {
  if (route().name !== 'study' || !session?.current || e.ctrlKey || e.metaKey || e.altKey) return;
  const typingInField = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
  if (typingInField) return;
  if (!session.revealed && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); reveal(); }
  else if (session.revealed && ['1', '2', '3', '4'].includes(e.key)) rate(Number(e.key));
  else if (session.revealed && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); const sug = $('.rate.suggested'); sug ? sug.click() : rate(GOOD); }
  else if (e.key === 'u') undoLast();
  else if (e.key === 'e') location.hash = `#/edit/${session.current.noteId}`;
});

// ---------------------------------------------------------------- deck

function deck(deckId) {
  const d = state.decks.find((x) => x.id === deckId);
  if (!d) { location.hash = '#/'; return; }
  const now = Date.now();
  const c = counts(state, now, d.id);
  const notes = state.notes.filter((n) => n.deckId === d.id).sort((a, b) => b.created - a.created);

  app.innerHTML = `
    <div class="section-head">
      <h1>${escapeHtml(d.name)}</h1>
      <div class="row">
        <a class="btn primary" href="#/study/${d.id}">Study (${c.learning + c.review + c.newToday})</a>
        <a class="btn" href="#/add/${d.id}">+ Add card</a>
      </div>
    </div>
    <details class="panel" id="bulk">
      <summary>Add many at once</summary>
      <p class="small muted">One card per line: <code>question :: answer :: why/example (optional)</code>.
        Tab-separated works too (paste from a spreadsheet). Lines with <code>{{c1::…}}</code> become cloze cards.</p>
      <textarea id="bulk-text" rows="6" placeholder="Capital of France :: Paris&#10;Water boils at {{c1::100}} °C at sea level :: lower on mountains"></textarea>
      <div class="row"><span id="bulk-info" class="small muted"></span><button class="btn" id="bulk-go">Import</button></div>
    </details>
    <input id="search" type="search" placeholder="Search ${notes.length} notes…" aria-label="Search notes">
    <ul class="note-list" id="notes"></ul>
    <details class="panel danger-zone">
      <summary>Deck options</summary>
      <form id="rename" class="inline-form"><input name="name" value="${escapeHtml(d.name)}" maxlength="80" aria-label="Deck name"><button class="btn">Rename</button></form>
      <button class="btn danger" id="del-deck">Delete deck and all its cards</button>
    </details>`;

  const cardsByNote = new Map();
  for (const card of state.cards) {
    if (!cardsByNote.has(card.noteId)) cardsByNote.set(card.noteId, []);
    cardsByNote.get(card.noteId).push(card);
  }
  const status = (n) => {
    const cs = cardsByNote.get(n.id) || [];
    if (cs.some((x) => x.leech)) return '<span class="chip leech">leech</span>';
    if (cs.every((x) => x.state === 'new')) return '<span class="chip new">new</span>';
    const due = Math.min(...cs.filter((x) => x.state !== 'new').map((x) => x.due));
    return due <= now ? '<span class="chip due">due</span>' : `<span class="chip">${formatInterval(due - now)}</span>`;
  };
  const draw = (q = '') => {
    const needle = q.toLowerCase();
    const shown = notes.filter((n) => !needle || `${n.front} ${n.back} ${n.extra}`.toLowerCase().includes(needle));
    $('#notes').innerHTML = shown.map((n) => `
      <li><a href="#/edit/${n.id}">
        <span class="q">${escapeHtml(plain(n.front))}</span>
        ${n.kind === 'basic' ? `<span class="a muted">${escapeHtml(plain(n.back, 60))}</span>` : '<span class="a muted">cloze</span>'}
        ${status(n)}
      </a></li>`).join('') || `<li class="muted">${q ? 'No matches.' : 'No cards yet — add your first one.'}</li>`;
  };
  draw();
  $('#search').addEventListener('input', (e) => draw(e.target.value));

  const bulkText = $('#bulk-text');
  bulkText.addEventListener('input', () => {
    const { notes: parsed, errors } = parseBulk(bulkText.value);
    $('#bulk-info').textContent = `${parsed.length} card${parsed.length === 1 ? '' : 's'} ready${errors.length ? ` · ${errors[0]}` : ''}`;
  });
  $('#bulk-go').addEventListener('click', () => {
    const { notes: parsed } = parseBulk(bulkText.value);
    if (!parsed.length) return toast('Nothing to import.');
    for (const n of parsed) saveNote(state, { ...n, deckId: d.id });
    persist();
    toast(`Imported ${parsed.length} cards.`);
    render();
  });
  $('#rename').addEventListener('submit', (e) => {
    e.preventDefault();
    d.name = e.target.name.value.trim() || d.name;
    persist();
    render();
  });
  $('#del-deck').addEventListener('click', () => {
    if (!confirm(`Delete "${d.name}" and all ${notes.length} notes? This can't be undone.`)) return;
    deleteDeck(state, d.id);
    persist();
    location.hash = '#/';
  });
}

// ---------------------------------------------------------------- editor

function editor(noteId, deckId) {
  const note = noteId ? state.notes.find((n) => n.id === noteId) : null;
  if (noteId && !note) { location.hash = '#/'; return; }
  if (!state.decks.length) addDeck(state, 'My deck');
  const current = note || { kind: editor.lastKind || 'basic', front: '', back: '', extra: '', reverse: false,
    deckId: state.decks.some((d) => d.id === deckId) ? deckId : state.decks[0].id };

  app.innerHTML = `
    <h1>${note ? 'Edit card' : 'Add card'}</h1>
    <form id="note-form" class="editor">
      <div class="row">
        <label>Deck <select name="deckId">${state.decks.map((d) =>
          `<option value="${d.id}" ${d.id === current.deckId ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('')}</select></label>
        <div class="seg" role="radiogroup" aria-label="Card type">
          <label><input type="radio" name="kind" value="basic" ${current.kind === 'basic' ? 'checked' : ''}> Question</label>
          <label><input type="radio" name="kind" value="cloze" ${current.kind === 'cloze' ? 'checked' : ''}> Fill the gap</label>
        </div>
      </div>
      <label class="field"><span class="flabel" data-basic>Question</span><span class="flabel" data-cloze>Text — select a word and press “Make gap”</span>
        <textarea name="front" rows="3" required>${escapeHtml(current.front)}</textarea></label>
      <div data-cloze class="row"><button type="button" class="btn small" id="make-gap">[…] Make gap <kbd>Ctrl+Shift+C</kbd></button>
        <span class="small muted">Each gap becomes its own card.</span></div>
      <label class="field" data-basic><span class="flabel">Answer</span>
        <textarea name="back" rows="2">${escapeHtml(current.back)}</textarea></label>
      <label class="check" data-basic><input type="checkbox" name="reverse" ${current.reverse ? 'checked' : ''}> Also ask it the other way round (answer → question)</label>
      <label class="field"><span class="flabel">Why / example <span class="muted">(optional, shown after answering)</span></span>
        <textarea name="extra" rows="2" placeholder="Why is it true? An example? A memory hook?">${escapeHtml(current.extra)}</textarea></label>
      <div id="warnings"></div>
      <div class="row">
        <button class="btn primary">${note ? 'Save' : 'Add'} <kbd>Ctrl+Enter</kbd></button>
        ${note ? '<button type="button" class="btn danger" id="del-note">Delete</button>' : ''}
        <a class="btn ghost" href="#/deck/${current.deckId}">${note ? 'Cancel' : 'Done'}</a>
      </div>
    </form>
    <details class="panel"><summary>How to write cards that stick</summary>
      <ul class="small">
        <li><strong>One idea per card.</strong> Short answers are fast to recall and easy to grade honestly.</li>
        <li><strong>Ask a real question</strong> — "Why does ice float?" not "Ice — density".</li>
        <li><strong>Use your own words</strong>, and only add things you already understand.</li>
        <li><strong>Lists are hard.</strong> Turn them into one gap per item instead.</li>
        <li><strong>Add the why or an example</strong> — links to what you know make memories stronger.</li>
      </ul>
    </details>`;

  const form = $('#note-form');
  const kind = () => form.kind.value;
  const sync = () => {
    $$('[data-basic]').forEach((el) => { el.hidden = kind() !== 'basic'; });
    $$('[data-cloze]').forEach((el) => { el.hidden = kind() !== 'cloze'; });
    const w = [];
    const front = form.front.value;
    if (kind() === 'cloze' && front.trim() && !clozeNumbers(front).length) w.push('Select a word and press “Make gap” — this card has no gaps yet.');
    if (kind() === 'basic' && form.back.value.length > 140) w.push('Long answer. Long answers are hard to recall and grade — can you split it into smaller cards?');
    if (kind() === 'basic' && (form.back.value.match(/,|\n|;/g) || []).length >= 3) w.push('Looks like a list. Lists are hard to remember as one card — try “Fill the gap” with one gap per item.');
    if (kind() === 'cloze' && clozeNumbers(front).length > 5) w.push('Lots of gaps in one text. Consider splitting it into a few shorter texts.');
    $('#warnings').innerHTML = w.map((x) => `<p class="warn small">${escapeHtml(x)}</p>`).join('');
  };
  const makeGap = () => {
    const ta = form.front;
    const { selectionStart: a, selectionEnd: b, value } = ta;
    if (a === b) return toast('Select the word(s) to hide first.');
    const n = nextClozeNumber(value);
    ta.value = `${value.slice(0, a)}{{c${n}::${value.slice(a, b)}}}${value.slice(b)}`;
    ta.focus();
    sync();
  };
  form.addEventListener('input', sync);
  form.addEventListener('change', sync);
  $('#make-gap').addEventListener('click', makeGap);
  form.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); form.requestSubmit(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c' && kind() === 'cloze') { e.preventDefault(); makeGap(); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = { deckId: form.deckId.value, kind: kind(), front: form.front.value.trim(),
      back: form.back.value.trim(), extra: form.extra.value.trim(), reverse: form.reverse.checked };
    if (fields.kind === 'basic' && !fields.back) return toast('Add an answer.');
    if (fields.kind === 'cloze' && !clozeNumbers(fields.front).length) return toast('Make at least one gap.');
    if (fields.kind === 'cloze') { fields.back = ''; fields.reverse = false; }
    saveNote(state, fields, note?.id);
    // A rewritten leech gets a fresh chance.
    if (note) state.cards.forEach((c) => { if (c.noteId === note.id) c.leech = false; });
    editor.lastKind = fields.kind;
    persist();
    if (note) {
      toast('Saved.');
      history.length > 1 ? history.back() : (location.hash = `#/deck/${fields.deckId}`);
    } else {
      toast('Added.');
      form.front.value = ''; form.back.value = ''; form.extra.value = '';
      form.front.focus();
      sync();
    }
  });
  $('#del-note')?.addEventListener('click', () => {
    if (!confirm('Delete this card?')) return;
    deleteNote(state, note.id);
    persist();
    if (session?.current?.noteId === note.id) session.current = null;
    location.hash = `#/deck/${note.deckId}`;
  });
  sync();
  form.front.focus();
}

// ---------------------------------------------------------------- free recall

function recall() {
  if (!blurt) {
    app.innerHTML = `
      <h1>Free recall</h1>
      <p>Write down <strong>everything</strong> you remember about a topic — no peeking. Then check what you missed.
        The gaps are exactly what you need to study.</p>
      <form id="blurt-start" class="panel">
        <label class="field"><span class="flabel">Check against a deck</span>
          <select name="deckId"><option value="">— No deck, I'll check my own notes —</option>
          ${state.decks.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}</select></label>
        <label class="field"><span class="flabel">Topic</span><input name="topic" placeholder="e.g. Photosynthesis, Chapter 3, The French Revolution" required maxlength="100"></label>
        <button class="btn primary">Start writing</button>
      </form>
      ${state.blurts.length ? `<h2>Past sessions</h2><ul class="note-list">${state.blurts.slice(-10).reverse().map((b) => `
        <li><div><span class="q">${escapeHtml(b.topic)}</span><span class="a muted">${new Date(b.t).toLocaleDateString()}</span>
        ${b.score != null ? `<span class="chip">${b.score}%</span>` : ''}</div></li>`).join('')}</ul>` : ''}`;
    $('#blurt-start').addEventListener('submit', (e) => {
      e.preventDefault();
      blurt = { deckId: e.target.deckId.value || null, topic: e.target.topic.value.trim(), text: '', missed: '', phase: 'write', started: Date.now(), got: new Set() };
      render();
    });
    return;
  }

  if (blurt.phase === 'write') {
    app.innerHTML = `
      <div class="section-head"><h1>${escapeHtml(blurt.topic)}</h1><span class="timer" id="elapsed">0:00</span></div>
      <p class="muted">Everything you can remember: facts, words, diagrams in words, how things connect. Keep going even when it gets hard.</p>
      <textarea id="dump" rows="14" placeholder="Start writing…">${escapeHtml(blurt.text)}</textarea>
      <div class="row"><button class="btn primary" id="check">I'm out of ideas — check</button>
        <button class="btn ghost" id="cancel">Cancel</button></div>`;
    const dump = $('#dump');
    dump.focus();
    dump.addEventListener('input', () => { blurt.text = dump.value; });
    timer = setInterval(() => {
      const s = Math.floor((Date.now() - blurt.started) / 1000);
      const el = document.getElementById('elapsed');
      if (el) el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }, 1000);
    $('#check').addEventListener('click', () => { blurt.phase = 'check'; render(); });
    $('#cancel').addEventListener('click', () => { blurt = null; render(); });
    return;
  }

  const notes = blurt.deckId ? state.notes.filter((n) => n.deckId === blurt.deckId) : [];
  app.innerHTML = `
    <h1>Check: ${escapeHtml(blurt.topic)}</h1>
    <details class="panel" open><summary>What you wrote</summary><div class="small">${format(blurt.text) || '<span class="muted">(nothing)</span>'}</div></details>
    ${notes.length ? `
      <p>Tick every card whose idea you got <strong>without peeking</strong>. Be strict.</p>
      <ul class="check-list">${notes.map((n) => `
        <li><label><input type="checkbox" data-note="${n.id}" ${blurt.got.has(n.id) ? 'checked' : ''}>
          <span><span class="q">${escapeHtml(plain(n.front, 140))}</span>${n.kind === 'basic' ? `<span class="a muted">${escapeHtml(plain(n.back, 140))}</span>` : ''}</span></label></li>`).join('')}
      </ul>
      <p id="score" class="score"></p>
      <label class="check"><input type="checkbox" id="bring" checked> Bring the cards I missed forward into today's reviews</label>`
    : `<p>Now open your notes or book and compare. What did you miss or get wrong? Write it here — then make cards for the important bits.</p>
      <textarea id="missed" rows="6" placeholder="What I missed…">${escapeHtml(blurt.missed)}</textarea>`}
    <div class="row"><button class="btn primary" id="finish">Finish</button></div>`;

  const updateScore = () => {
    const el = $('#score');
    if (el) el.textContent = `You recalled ${blurt.got.size} of ${notes.length} (${Math.round((100 * blurt.got.size) / notes.length)}%).`;
  };
  $$('[data-note]').forEach((cb) => cb.addEventListener('change', () => {
    cb.checked ? blurt.got.add(cb.dataset.note) : blurt.got.delete(cb.dataset.note);
    updateScore();
  }));
  $('#missed')?.addEventListener('input', (e) => { blurt.missed = e.target.value; });
  updateScore();
  $('#finish').addEventListener('click', () => {
    const now = Date.now();
    let moved = 0;
    if (notes.length && $('#bring').checked) {
      const missed = new Set(notes.filter((n) => !blurt.got.has(n.id)).map((n) => n.id));
      for (const c of state.cards) {
        if (missed.has(c.noteId) && c.state === 'review' && c.due > now) { c.due = now; moved++; }
      }
    }
    state.blurts.push({ t: now, topic: blurt.topic, deckId: blurt.deckId, text: blurt.text, missed: blurt.missed,
      score: notes.length ? Math.round((100 * blurt.got.size) / notes.length) : null });
    if (state.blurts.length > 200) state.blurts.shift();
    persist();
    blurt = null;
    toast(moved ? `Saved. ${moved} missed card${moved === 1 ? '' : 's'} added to today's reviews.` : 'Saved.');
    render();
  });
}

// ---------------------------------------------------------------- stats

function stats() {
  const now = Date.now();
  const ret = trueRetention(state, now);
  const s = streak(state, now);
  const perDay = reviewsPerDay(state);
  const today = perDay.get(dayKey(now)) || 0;
  const fc = forecast(state, now, 30);
  const fcMax = Math.max(1, ...fc);
  const byState = { new: 0, learning: 0, young: 0, mature: 0 };
  for (const c of state.cards) {
    if (c.state === 'new') byState.new++;
    else if (c.state !== 'review') byState.learning++;
    else if (c.stability >= 21) byState.mature++;
    else byState.young++;
  }
  const leeches = state.cards.filter((c) => c.leech);
  const target = state.settings.retention;

  // Heatmap: last 18 weeks, columns = weeks, rows = days.
  const weeks = 18;
  const start = dayStart(now) - ((weeks - 1) * 7 + new Date(dayStart(now)).getDay()) * DAY;
  const heatMax = Math.max(1, ...perDay.values());
  const cells = [];
  for (let t = start; t <= dayStart(now); t += DAY) {
    const k = dayKey(t + 6 * 3600 * 1000); // mid-morning avoids DST edge cases
    const n = perDay.get(k) || 0;
    const level = n === 0 ? 0 : Math.min(4, Math.ceil((4 * n) / heatMax));
    cells.push(`<span class="hm l${level}" title="${k}: ${n} reviews"></span>`);
  }

  let retNote = 'Do some reviews to see this.';
  if (ret) {
    const gap = ret.rate - target;
    retNote = ret.total < 30 ? 'Not enough reviews yet to judge.'
      : gap < -0.07 ? 'Lower than your target: grade honestly, and rewrite cards you keep failing.'
      : gap > 0.05 ? 'Higher than your target — great. Check you aren\'t pressing Good when you should press Again.'
      : 'On target — the schedule is working.';
  }

  app.innerHTML = `
    <h1>Progress</h1>
    <div class="tiles">
      <div class="tile"><span class="big">${s}</span><span class="label">day streak</span></div>
      <div class="tile"><span class="big">${today}</span><span class="label">answers today</span></div>
      <div class="tile"><span class="big">${ret ? Math.round(ret.rate * 100) + '%' : '—'}</span><span class="label">remembered (30 days, target ${Math.round(target * 100)}%)</span></div>
      <div class="tile"><span class="big">${byState.mature}</span><span class="label">cards known well (21+ days)</span></div>
    </div>
    <p class="small muted">${escapeHtml(retNote)}</p>

    <h2>Reviews coming up</h2>
    <p class="small muted">Cards due each day for the next 30 days. Today: <strong>${fc[0]}</strong>, tomorrow: <strong>${fc[1]}</strong>.</p>
    <div class="bars" role="img" aria-label="Reviews due over the next 30 days">
      ${fc.map((n, i) => `<div class="bar-col" title="${i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `In ${i} days`}: ${n}">
        <span class="bar" style="height:${n ? Math.max(4, (100 * n) / fcMax) : 0}%"></span></div>`).join('')}
    </div>
    <div class="bars-axis small muted"><span>Today</span><span>+15d</span><span>+30d</span></div>

    <h2>Practice days</h2>
    <div class="heatmap" style="--weeks:${weeks}" role="img" aria-label="Reviews per day, last ${weeks} weeks">${cells.join('')}</div>
    <div class="legend small muted">Less <span class="hm l0"></span><span class="hm l1"></span><span class="hm l2"></span><span class="hm l3"></span><span class="hm l4"></span> More</div>

    <h2>Your cards</h2>
    <table class="states">
      <tr><td>New (not seen yet)</td><td>${byState.new}</td></tr>
      <tr><td>Learning</td><td>${byState.learning}</td></tr>
      <tr><td>Young (memory under 3 weeks)</td><td>${byState.young}</td></tr>
      <tr><td>Mature (memory 3+ weeks)</td><td>${byState.mature}</td></tr>
    </table>

    ${leeches.length ? `<h2>Cards to rewrite</h2>
      <p class="small muted">You keep forgetting these. Repeating them won't help — rewrite them smaller, or add a why or an example.</p>
      <ul class="note-list">${leeches.map((c) => {
        const n = noteOf(c);
        return n ? `<li><a href="#/edit/${n.id}"><span class="q">${escapeHtml(plain(n.front))}</span><span class="chip leech">${c.lapses} lapses</span></a></li>` : '';
      }).join('')}</ul>` : ''}`;
}

// ---------------------------------------------------------------- guide & settings

function guide() {
  app.innerHTML = `<article class="guide"><h1>How to practise well</h1>${GUIDE_HTML}</article>`;
}

function settings() {
  const st = state.settings;
  app.innerHTML = `
    <h1>Settings</h1>
    <form id="settings" class="panel">
      <label class="field"><span class="flabel">How much do you want to remember? <strong id="ret-val">${Math.round(st.retention * 100)}%</strong></span>
        <input type="range" name="retention" min="0.8" max="0.97" step="0.01" value="${st.retention}">
        <span class="small muted" id="ret-help"></span></label>
      <label class="field"><span class="flabel">New cards per day</span>
        <input type="number" name="newPerDay" min="0" max="200" value="${st.newPerDay}">
        <span class="small muted">Each new card adds about 5–10 reviews over the next month. 10–20 a day is plenty.</span></label>
      <label class="check"><input type="checkbox" name="typeAnswers" ${st.typeAnswers ? 'checked' : ''}> Type answers before revealing (stronger recall, harder to fool yourself)</label>
      <label class="check"><input type="checkbox" name="interleave" ${st.interleave ? 'checked' : ''}> Mix decks together in reviews (interleaving)</label>
    </form>

    <h2>Your data</h2>
    <p class="small muted">Everything is stored only in this browser. Export a backup now and then — clearing browser data deletes it.</p>
    <div class="row">
      <button class="btn" id="export">Export backup</button>
      <label class="btn">Import backup<input type="file" id="import" accept="application/json,.json" hidden></label>
      <button class="btn" id="starter">Add the “How to learn” deck</button>
      <button class="btn danger" id="erase">Erase everything</button>
    </div>`;

  const form = $('#settings');
  const help = () => {
    const r = Number(form.retention.value);
    $('#ret-val').textContent = `${Math.round(r * 100)}%`;
    $('#ret-help').textContent = r < 0.85 ? 'Fewer reviews, but you will forget more often.'
      : r <= 0.92 ? 'Recommended: the best balance of memory and time.'
      : 'You will remember more, but the number of reviews grows fast.';
  };
  help();
  form.addEventListener('input', () => {
    st.retention = Number(form.retention.value);
    st.newPerDay = Math.max(0, Math.min(200, Number(form.newPerDay.value) || 0));
    st.typeAnswers = form.typeAnswers.checked;
    st.interleave = form.interleave.checked;
    help();
    persist();
  });
  $('#export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kidfuture-backup-${dayKey(Date.now())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.cards) || !Array.isArray(data.notes)) throw new Error('bad file');
      if (!confirm('Replace everything in this browser with this backup?')) return;
      state = migrate(data);
      session = null;
      persist();
      toast('Backup restored.');
      render();
    } catch {
      toast('That file is not a KidFuture backup.');
    }
  });
  $('#starter').addEventListener('click', () => {
    addStarterDeck();
    persist();
    toast('Added.');
  });
  $('#erase').addEventListener('click', () => {
    if (prompt('Type DELETE to erase all decks, cards and history.') !== 'DELETE') return;
    state = emptyState();
    state.seeded = true;
    session = null;
    persist();
    location.hash = '#/';
    render();
  });
}

// ---------------------------------------------------------------- boot

render();
navigator.storage?.persist?.();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js');
}
