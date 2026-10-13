import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, addDeck, saveNote, answer, undo, nextCard, counts, streak } from '../src/store.js';
import { AGAIN, GOOD, DAY } from '../src/scheduler.js';

const T0 = new Date(2026, 0, 10, 12).getTime();

function setup() {
  const s = emptyState();
  const d = addDeck(s, 'D');
  return { s, d };
}

test('saveNote keeps cards in sync with cloze gaps and keeps history', () => {
  const { s, d } = setup();
  const n = saveNote(s, { deckId: d.id, kind: 'cloze', front: '{{c1::a}} {{c2::b}}', back: '', extra: '' });
  assert.equal(s.cards.length, 2);
  const c1 = s.cards.find((c) => c.variant === 'c1');
  answer(s, c1.id, GOOD, T0);
  saveNote(s, { front: '{{c1::a}} {{c3::c}}' }, n.id);
  assert.deepEqual(s.cards.map((c) => c.variant).sort(), ['c1', 'c3']);
  assert.equal(s.cards.find((c) => c.variant === 'c1').reps, 1);
});

test('new-card daily limit and sibling burying', () => {
  const { s, d } = setup();
  s.settings.newPerDay = 2;
  saveNote(s, { deckId: d.id, kind: 'basic', front: 'q1', back: 'a1', reverse: true });
  saveNote(s, { deckId: d.id, kind: 'basic', front: 'q2', back: 'a2' });
  saveNote(s, { deckId: d.id, kind: 'basic', front: 'q3', back: 'a3' });
  const seenNotes = new Set();
  const first = nextCard(s, T0, { seenNotes });
  answer(s, first.id, GOOD, T0);
  seenNotes.add(first.noteId);
  const second = nextCard(s, T0, { seenNotes });
  assert.notEqual(second.noteId, first.noteId, 'reverse sibling is buried');
  answer(s, second.id, GOOD, T0);
  seenNotes.add(second.noteId);
  assert.equal(counts(s, T0).newToday, 0);
  // Only learning cards remain, due in 10 min: learn-ahead shows them.
  assert.equal(nextCard(s, T0, { seenNotes }).state, 'learning');
});

test('undo restores card and log', () => {
  const { s, d } = setup();
  saveNote(s, { deckId: d.id, kind: 'basic', front: 'q', back: 'a' });
  const { before } = answer(s, s.cards[0].id, AGAIN, T0);
  undo(s, before);
  assert.equal(s.cards[0].state, 'new');
  assert.equal(s.logs.length, 0);
});

test('streak counts consecutive days', () => {
  const { s } = setup();
  s.logs = [[T0 - 2 * DAY, 'x', 3, 'r', 0], [T0 - DAY, 'x', 3, 'r', 0], [T0, 'x', 3, 'r', 0]];
  assert.equal(streak(s, T0), 3);
  assert.equal(streak(s, T0 + DAY), 3, 'today not done yet keeps the streak');
  assert.equal(streak(s, T0 + 2 * DAY), 0);
});
