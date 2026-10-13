// App state, persistence (localStorage) and the study queue.

import { newCardState, schedule, DAY, MIN } from './scheduler.js';
import { variantsFor } from './cards.js';

const KEY = 'kidfuture.v1';
const MAX_LOGS = 40000;
const DAY_STARTS_AT_HOUR = 4; // a late-night session still counts as "today"
const LEARN_AHEAD = 20 * MIN;

export const DEFAULT_SETTINGS = {
  retention: 0.9,
  newPerDay: 15,
  typeAnswers: true,
  interleave: true,
};

export function emptyState() {
  return { version: 1, decks: [], notes: [], cards: [], logs: [], blurts: [], settings: { ...DEFAULT_SETTINGS }, seeded: false };
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    return migrate(JSON.parse(raw));
  } catch {
    return emptyState();
  }
}

export function migrate(data) {
  const s = { ...emptyState(), ...data };
  s.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
  return s;
}

export function save(state) {
  if (state.logs.length > MAX_LOGS) state.logs = state.logs.slice(-MAX_LOGS);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// ---------- time ----------

export function dayStart(now) {
  const d = new Date(now);
  if (d.getHours() < DAY_STARTS_AT_HOUR) d.setDate(d.getDate() - 1);
  d.setHours(DAY_STARTS_AT_HOUR, 0, 0, 0);
  return d.getTime();
}

export const dayEnd = (now) => dayStart(now) + DAY;
export const dayKey = (t) => {
  const d = new Date(dayStart(t));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ---------- decks & notes ----------

export function addDeck(state, name) {
  const deck = { id: uid(), name: name.trim() || 'Untitled', created: Date.now() };
  state.decks.push(deck);
  return deck;
}

export function deleteDeck(state, deckId) {
  const noteIds = new Set(state.notes.filter((n) => n.deckId === deckId).map((n) => n.id));
  state.notes = state.notes.filter((n) => !noteIds.has(n.id));
  state.cards = state.cards.filter((c) => !noteIds.has(c.noteId));
  state.decks = state.decks.filter((d) => d.id !== deckId);
}

/** Create or update a note and keep its cards in sync (keeps review history of unchanged cards). */
export function saveNote(state, fields, noteId = null) {
  let note = noteId && state.notes.find((n) => n.id === noteId);
  if (note) Object.assign(note, fields);
  else {
    note = { id: uid(), created: Date.now(), ...fields };
    state.notes.push(note);
  }
  const want = variantsFor(note);
  const have = state.cards.filter((c) => c.noteId === note.id);
  state.cards = state.cards.filter((c) => c.noteId !== note.id || want.includes(c.variant));
  let order = 0;
  for (const variant of want) {
    if (!have.some((c) => c.variant === variant)) {
      state.cards.push({ id: uid(), noteId: note.id, variant, created: Date.now() + order++, ...newCardState() });
    }
  }
  return note;
}

export function deleteNote(state, noteId) {
  state.notes = state.notes.filter((n) => n.id !== noteId);
  state.cards = state.cards.filter((c) => c.noteId !== noteId);
}

// ---------- reviewing ----------

export function answer(state, cardId, rating, now, durationMs = 0) {
  const i = state.cards.findIndex((c) => c.id === cardId);
  const before = state.cards[i];
  const after = schedule(before, rating, now, { retention: state.settings.retention, id: before.id });
  if (after.lapses >= 6 && rating === 1) after.leech = true;
  state.cards[i] = after;
  // Compact log row: [time, cardId, rating, state before, ms spent]
  state.logs.push([now, cardId, rating, before.state[0], Math.round(durationMs)]);
  return { before, after };
}

export function undo(state, before) {
  const i = state.cards.findIndex((c) => c.id === before.id);
  if (i >= 0) state.cards[i] = before;
  const j = state.logs.findLastIndex((l) => l[1] === before.id);
  if (j >= 0) state.logs.splice(j, 1);
}

export function newIntroducedToday(state, now) {
  const start = dayStart(now);
  let n = 0;
  for (const l of state.logs) if (l[0] >= start && l[3] === 'n') n++;
  return n;
}

function inDecks(state, deckId) {
  if (!deckId) return null;
  return new Set(state.notes.filter((n) => n.deckId === deckId).map((n) => n.id));
}

export function counts(state, now, deckId = null) {
  const notes = inDecks(state, deckId);
  const end = dayEnd(now);
  let learning = 0, review = 0, fresh = 0;
  for (const c of state.cards) {
    if (c.suspended || (notes && !notes.has(c.noteId))) continue;
    if (c.state === 'new') fresh++;
    else if (c.state === 'review') { if (c.due < end) review++; }
    else if (c.due < end) learning++;
  }
  const newLeft = Math.max(0, state.settings.newPerDay - newIntroducedToday(state, now));
  return { learning, review, fresh, newToday: Math.min(fresh, newLeft) };
}

/**
 * Pick the next card. Priority: learning cards that are due, then reviews (shuffled across
 * decks = interleaving) with a new card mixed in every few reviews, then learn-ahead.
 * `seenNotes` lets us skip sibling cards of a note already shown this session.
 */
export function nextCard(state, now, { deckId = null, seenNotes = new Set(), sinceNew = 0, rand = Math.random } = {}) {
  const notes = inDecks(state, deckId);
  const end = dayEnd(now);
  const usable = state.cards.filter((c) => !c.suspended && (!notes || notes.has(c.noteId)));

  const learningDue = usable.filter((c) => (c.state === 'learning' || c.state === 'relearning') && c.due <= now)
    .sort((a, b) => a.due - b.due);
  if (learningDue.length) return learningDue[0];

  const reviews = usable.filter((c) => c.state === 'review' && c.due < end && !seenNotes.has(c.noteId));
  const newLeft = state.settings.newPerDay - newIntroducedToday(state, now);
  const fresh = newLeft > 0
    ? usable.filter((c) => c.state === 'new' && !seenNotes.has(c.noteId)).sort((a, b) => a.created - b.created)
    : [];

  if (fresh.length && (!reviews.length || sinceNew >= 4)) return fresh[0];
  if (reviews.length) {
    if (state.settings.interleave) return reviews[Math.floor(rand() * reviews.length)];
    const deckOf = new Map(state.notes.map((n) => [n.id, n.deckId]));
    return reviews.sort((a, b) => String(deckOf.get(a.noteId)).localeCompare(String(deckOf.get(b.noteId))) || a.due - b.due)[0];
  }

  const soon = usable.filter((c) => (c.state === 'learning' || c.state === 'relearning') && c.due <= now + LEARN_AHEAD)
    .sort((a, b) => a.due - b.due);
  return soon[0] || null;
}

export function nextLearningDue(state, deckId = null) {
  const notes = inDecks(state, deckId);
  const due = state.cards
    .filter((c) => !c.suspended && (c.state === 'learning' || c.state === 'relearning') && (!notes || notes.has(c.noteId)))
    .map((c) => c.due);
  return due.length ? Math.min(...due) : null;
}

// ---------- stats ----------

export function streak(state, now) {
  const days = new Set(state.logs.map((l) => dayKey(l[0])));
  let n = 0;
  let t = dayStart(now);
  if (!days.has(dayKey(t))) t -= DAY; // today not done yet doesn't break the streak
  while (days.has(dayKey(t))) { n++; t -= DAY; }
  return n;
}

/** Share of real spaced reviews (not same-day learning) you remembered, last `days` days. */
export function trueRetention(state, now, days = 30) {
  const since = now - days * DAY;
  let total = 0, ok = 0;
  for (const l of state.logs) {
    if (l[0] < since || l[3] !== 'r') continue;
    total++;
    if (l[2] > 1) ok++;
  }
  return total ? { rate: ok / total, total } : null;
}

export function forecast(state, now, days = 30) {
  const start = dayStart(now);
  const out = new Array(days).fill(0);
  for (const c of state.cards) {
    if (c.suspended || c.state === 'new') continue;
    const i = Math.max(0, Math.floor((c.due - start) / DAY));
    if (i < days) out[i]++;
  }
  return out;
}

export function reviewsPerDay(state) {
  const map = new Map();
  for (const l of state.logs) map.set(dayKey(l[0]), (map.get(dayKey(l[0])) || 0) + 1);
  return map;
}
