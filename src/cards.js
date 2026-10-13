// Notes, card variants, cloze deletions and answer checking. Pure functions.

const CLOZE_RE = /\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}/g;

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

/** Safe tiny formatting: **bold**, `code`, and line breaks. Input is escaped first. */
export function format(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

export function clozeNumbers(text) {
  const nums = new Set();
  for (const m of String(text).matchAll(CLOZE_RE)) nums.add(Number(m[1]));
  return [...nums].sort((a, b) => a - b);
}

export function nextClozeNumber(text) {
  const nums = clozeNumbers(text);
  return nums.length ? nums[nums.length - 1] + 1 : 1;
}

/** Which cards a note should have, e.g. ['f'], ['f','r'], ['c1','c2']. */
export function variantsFor(note) {
  if (note.kind === 'cloze') return clozeNumbers(note.front).map((n) => `c${n}`);
  return note.reverse ? ['f', 'r'] : ['f'];
}

function renderCloze(text, n, reveal) {
  // Escape around the cloze markers so user text can never inject HTML.
  let out = '';
  let last = 0;
  for (const m of String(text).matchAll(CLOZE_RE)) {
    out += format(text.slice(last, m.index));
    const [, num, answer, hint] = m;
    if (Number(num) !== n) out += format(answer);
    else if (reveal) out += `<span class="cloze">${format(answer)}</span>`;
    else out += `<span class="cloze blank">[${hint ? format(hint) : '…'}]</span>`;
    last = m.index + m[0].length;
  }
  return out + format(text.slice(last));
}

/** { question, answer (HTML), expected (plain text to type) } for one card. */
export function renderCard(note, variant) {
  if (variant.startsWith('c')) {
    const n = Number(variant.slice(1));
    const expected = [...String(note.front).matchAll(CLOZE_RE)]
      .filter((m) => Number(m[1]) === n).map((m) => m[2]).join(', ');
    return { question: renderCloze(note.front, n, false), answer: renderCloze(note.front, n, true), expected };
  }
  if (variant === 'r') return { question: format(note.back), answer: format(note.front), expected: note.back ? note.front : '' };
  return { question: format(note.front), answer: format(note.back), expected: note.back };
}

export function normalize(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** 'exact' | 'close' | 'wrong' | 'blank' — a hint for self-grading, never a verdict. */
export function checkAnswer(typed, expected) {
  const t = normalize(typed);
  if (!t) return 'blank';
  const e = normalize(expected);
  if (t === e) return 'exact';
  const dist = levenshtein(t, e);
  const ratio = 1 - dist / Math.max(t.length, e.length);
  if (ratio >= 0.8 || (e.length > 3 && dist <= 1)) return 'close';
  return 'wrong';
}

/**
 * Parse pasted text into notes. One note per line:
 *   question :: answer :: optional why/example
 *   question<TAB>answer
 *   Text with {{c1::cloze}} deletions :: optional extra
 */
export function parseBulk(text) {
  const notes = [];
  const errors = [];
  String(text).split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    if (clozeNumbers(line).length) {
      const [front, extra = ''] = splitOutsideCloze(line);
      notes.push({ kind: 'cloze', front: front.trim(), back: '', extra: extra.trim(), reverse: false });
      return;
    }
    const cols = line.includes('\t') ? line.split('\t') : line.split('::');
    if (cols.length < 2 || !cols[0].trim() || !cols[1].trim()) {
      errors.push(`Line ${i + 1}: needs "question :: answer"`);
      return;
    }
    notes.push({ kind: 'basic', front: cols[0].trim(), back: cols[1].trim(), extra: (cols[2] || '').trim(), reverse: false });
  });
  return { notes, errors };
}

// Split "cloze text :: extra" without breaking the "::" inside {{c1::...}}.
function splitOutsideCloze(line) {
  let depth = 0;
  for (let i = 0; i < line.length - 1; i++) {
    if (line[i] === '{' && line[i + 1] === '{') depth++;
    if (line[i] === '}' && line[i + 1] === '}') depth--;
    if (depth === 0 && line[i] === ':' && line[i + 1] === ':') return [line.slice(0, i), line.slice(i + 2)];
  }
  return [line, ''];
}
