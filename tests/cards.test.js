import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderCard, variantsFor, checkAnswer, parseBulk, nextClozeNumber, format } from '../src/cards.js';

test('cloze variants and rendering', () => {
  const note = { kind: 'cloze', front: 'The {{c1::Sun}} is a {{c2::star::type}}.' };
  assert.deepEqual(variantsFor(note), ['c1', 'c2']);
  const c1 = renderCard(note, 'c1');
  assert.match(c1.question, /\[…\]/);
  assert.match(c1.question, /star/);
  assert.equal(c1.expected, 'Sun');
  assert.match(renderCard(note, 'c2').question, /\[type\]/);
  assert.equal(nextClozeNumber(note.front), 3);
});

test('basic + reverse', () => {
  const note = { kind: 'basic', front: 'Q', back: 'A', reverse: true };
  assert.deepEqual(variantsFor(note), ['f', 'r']);
  assert.equal(renderCard(note, 'r').expected, 'Q');
});

test('HTML is escaped, including inside cloze', () => {
  assert.equal(format('<b>x</b>'), '&lt;b&gt;x&lt;/b&gt;');
  const r = renderCard({ kind: 'cloze', front: '<img src=x> {{c1::<script>}}' }, 'c1');
  assert.ok(!r.answer.includes('<script>') && !r.answer.includes('<img'));
});

test('answer checking is forgiving about case, accents, punctuation, typos', () => {
  assert.equal(checkAnswer('  paris. ', 'Paris'), 'exact');
  assert.equal(checkAnswer('Mexico', 'México'), 'exact');
  assert.equal(checkAnswer('photosynthsis', 'photosynthesis'), 'close');
  assert.equal(checkAnswer('London', 'Paris'), 'wrong');
  assert.equal(checkAnswer('', 'Paris'), 'blank');
});

test('bulk import', () => {
  const { notes, errors } = parseBulk('Q1 :: A1\nQ2\tA2\n# comment\nWater boils at {{c1::100}} °C :: at sea level\nbad line');
  assert.equal(notes.length, 3);
  assert.deepEqual([notes[0].front, notes[0].back], ['Q1', 'A1']);
  assert.equal(notes[1].back, 'A2');
  assert.equal(notes[2].kind, 'cloze');
  assert.equal(notes[2].front, 'Water boils at {{c1::100}} °C');
  assert.equal(notes[2].extra, 'at sea level');
  assert.equal(errors.length, 1);
});
