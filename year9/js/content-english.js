// ENGLISH – LORD OF THE FLIES (William Golding, 1954). Built from the class revision notes.

import { pick, shuffle, mcq } from './engine.js';
import { mcqS } from './content-maths.js';

const tf = (q, answer, why) => ({ type: 'tf', q, answer, why });
const text = (q, answer, accept, why) => ({ type: 'text', q, answer, accept, why });
const match = (q, pairs, why) => () => ({ type: 'match', q, pairs: shuffle(pairs).slice(0, 4), why });
const order = (q, items, why) => ({ type: 'order', q, items, why });

export const CHAPTERS = [
  { n: 1, title: 'The Sound of the Shell', mood: 1, summary: 'A plane carrying British schoolboys crashes on a tropical island during a war, and no adults survive. Ralph and Piggy find a conch shell, and Ralph blows it to call the boys together. Jack arrives with his choir. The boys vote, and Ralph becomes chief. Jack’s choir become hunters. Ralph, Jack and Simon explore and confirm it is an island. Jack tries to kill a piglet but hesitates.' },
  { n: 2, title: 'Fire on the Mountain', mood: 1, summary: 'Ralph makes rules: whoever holds the conch may speak. A small boy with a birthmark talks about a “beastie”. Ralph says they need a signal fire to be rescued. The boys light it with Piggy’s glasses, but it gets out of control and burns part of the forest. The boy with the birthmark goes missing and is probably dead.' },
  { n: 3, title: 'Huts on the Beach', mood: 2, summary: 'Jack becomes obsessed with hunting but keeps failing. Ralph and Simon build shelters while most boys play. Ralph and Jack argue about what matters more, shelters or hunting, and their friendship starts to crack. Simon goes alone into the forest to a peaceful clearing.' },
  { n: 4, title: 'Painted Faces and Long Hair', mood: 3, summary: 'Jack paints his face with clay and feels free from shame. A ship passes, but the fire has gone out because the hunters who should have watched it left to hunt. Jack returns with their first kill. Ralph is furious. Jack hits Piggy and breaks one lens of his glasses. The hunters chant and act out the kill.' },
  { n: 5, title: 'Beast from Water', mood: 4, summary: 'Ralph calls a meeting to restore order, but the talk turns to fear of the beast. Piggy says there is no beast. Simon suggests the beast may be “only us”, and the boys laugh at him. Jack rejects the rules and the conch, and the meeting falls apart. Ralph thinks of giving up as chief, but Piggy and Simon persuade him not to.' },
  { n: 6, title: 'Beast from Air', mood: 4, summary: 'At night, a dead parachutist from an air battle lands on the mountain. Sam and Eric see it in the dark and think it is the beast. Ralph, Jack and the older boys search the island and find Castle Rock, which Jack loves.' },
  { n: 7, title: 'Shadows and Tall Trees', mood: 5, summary: 'Ralph joins a hunt, hits a boar with his spear and enjoys it. In a game, the boys pretend Robert is a pig and nearly hurt him badly. Ralph, Jack and Roger climb the mountain at night, see the dead parachutist and run away in terror.' },
  { n: 8, title: 'Gift for the Darkness', mood: 6, summary: 'Jack calls Ralph a coward and asks the boys to vote him out. Nobody votes, so Jack leaves to start his own tribe, and many boys secretly join him. The hunters kill a sow violently and put its head on a stick as a gift for the beast. Simon finds the head, covered in flies: the “Lord of the Flies”. In a kind of vision, it tells him the beast is part of everyone. Simon faints.' },
  { n: 9, title: 'A View to a Death', mood: 8, summary: 'Simon climbs the mountain and discovers the “beast” is just a dead parachutist. Ralph and Piggy go to Jack’s feast. A storm starts, and the boys do a wild hunting dance. Simon crawls out of the forest to tell them the truth, but in the frenzy they think he is the beast and kill him. His body is washed out to sea.' },
  { n: 10, title: 'The Shell and the Glasses', mood: 8, summary: 'Ralph and Piggy feel guilty, but Piggy says it was an accident. Only Ralph, Piggy, Sam and Eric are left in Ralph’s group. Jack rules Castle Rock with fear, and Roger enjoys the violence. At night, Jack’s hunters attack and steal Piggy’s glasses so they can make fire.' },
  { n: 11, title: 'Castle Rock', mood: 9, summary: 'Ralph, Piggy and the twins go to Castle Rock to ask for the glasses back. Piggy holds the conch and asks whether rules and rescue are better than hunting and killing. Roger pushes a huge rock down. It kills Piggy and smashes the conch. Sam and Eric are captured, and Ralph escapes, injured.' },
  { n: 12, title: 'Cry of the Hunters', mood: 10, summary: 'Ralph hides alone. Sam and Eric warn him that the tribe will hunt him the next day. The hunters set the island on fire to smoke him out. Ralph runs to the beach and falls at the feet of a naval officer, who came because he saw the smoke. The officer is surprised that British boys behaved like this. Ralph cries for the loss of innocence, the darkness in people’s hearts, and his wise friend Piggy.' },
];

// [event, chapter] — every event is taken from the chapter summaries above.
const EVENTS = [
  ['Ralph blows the conch to call the boys together', 1], ['The boys vote and Ralph becomes chief', 1], ['Jack tries to kill a piglet but hesitates', 1],
  ['The rule: whoever holds the conch may speak', 2], ['The boy with the birthmark talks about a “beastie”', 2], ['The first signal fire burns part of the forest', 2],
  ['Ralph and Simon build shelters while most boys play', 3], ['Simon goes alone to a peaceful clearing', 3],
  ['Jack paints his face with clay', 4], ['A ship passes but the fire has gone out', 4], ['Jack breaks one lens of Piggy’s glasses', 4],
  ['Simon suggests the beast may be “only us”', 5], ['Jack rejects the rules and the conch at a meeting', 5],
  ['A dead parachutist lands on the mountain', 6], ['The boys find Castle Rock', 6],
  ['Ralph hits a boar with his spear and enjoys it', 7], ['The boys pretend Robert is a pig and nearly hurt him', 7],
  ['Jack leaves to start his own tribe', 8], ['The sow’s head is put on a stick as a gift for the beast', 8], ['Simon faints after his “vision” of the Lord of the Flies', 8],
  ['Simon discovers the beast is a dead parachutist', 9], ['Simon is killed in the frenzied dance', 9],
  ['Jack’s hunters steal Piggy’s glasses', 10], ['Piggy says Simon’s death was an accident', 10],
  ['Roger’s rock kills Piggy and smashes the conch', 11], ['Sam and Eric are captured', 11],
  ['The hunters set the island on fire to smoke Ralph out', 12], ['Ralph falls at the feet of a naval officer', 12],
];

function genWhichChapter() {
  const [ev, ch] = pick(EVENTS);
  const opts = new Set([ch]);
  while (opts.size < 4) {
    const c = Math.max(1, Math.min(12, ch + pick([-3, -2, -1, 1, 2, 3])));
    opts.add(c);
  }
  const label = (n) => `Chapter ${n}: ${CHAPTERS[n - 1].title}`;
  return mcq(`In which chapter does this happen?<br><b>${ev}</b>`, label(ch), [...opts].filter((c) => c !== ch).map(label),
    { why: `Chapter ${ch}, “${CHAPTERS[ch - 1].title}”: ${CHAPTERS[ch - 1].summary}` });
}

function genOrderEvents() {
  const chosen = [];
  const used = new Set();
  for (const [ev, ch] of shuffle(EVENTS)) {
    if (used.has(ch)) continue;
    used.add(ch);
    chosen.push([ev, ch]);
    if (chosen.length === 4) break;
  }
  chosen.sort((a, b) => a[1] - b[1]);
  return { type: 'order', q: 'Put these events in the order they happen in the novel.', items: chosen.map((c) => c[0]),
    why: chosen.map(([ev, ch]) => `Ch ${ch}: ${ev}`).join(' → ') };
}

const QUOTES = [
  ['“We’ve got to have rules and obey them. After all, we’re not savages. We’re English…”', 'Jack', 2, 'Ironic — Jack later rejects the rules completely.'],
  ['“Kill the pig. Cut her throat. Spill her blood.”', 'The hunters (chant)', 4, 'The chant shows the boys enjoying violence.'],
  ['“Maybe it’s only us.”', 'Simon', 5, 'Simon understands the beast is inside the boys themselves. They laugh at him.'],
  ['“Fancy thinking the Beast was something you could hunt and kill!”', 'The Lord of the Flies (to Simon)', 8, 'The beast is part of everyone — the novel’s key idea.'],
  ['“Which is better — to have rules and agree, or to hunt and kill?”', 'Piggy', 11, 'Piggy’s last stand for order, just before he is killed.'],
  ['“Ralph wept for the end of innocence, the darkness of man’s heart, and the fall through the air of the true, wise friend called Piggy.”', 'The narrator (about Ralph)', 12, 'The ending sums up the novel’s themes.'],
];

function genQuote() {
  const [q, who, ch, why] = pick(QUOTES);
  const speakers = ['Jack', 'Simon', 'Piggy', 'Ralph', 'Roger', 'The hunters (chant)', 'The Lord of the Flies (to Simon)', 'The narrator (about Ralph)', 'The naval officer'];
  return mcq(`Who says this, or whose words are these?<br><span class="quote">${q}</span>`, who, shuffle(speakers.filter((s) => s !== who)),
    { why: `${who}, Chapter ${ch}. ${why}` });
}

export const ENGLISH = {
  id: 'english', name: 'English', sub: 'Lord of the Flies', icon: '📖', color: 'var(--english)',
  units: [
    {
      n: 1, code: 'Novel', title: 'Lord of the Flies (William Golding, 1954)',
      lessons: [
        {
          id: 'e1', title: 'About the novel and the characters',
          keys: [
            'Author: <b>William Golding</b>, who served in the Royal Navy in World War II. Published <b>1954</b>.',
            'Setting: an <b>uninhabited tropical island</b>, during a war.',
            'Genre: <b>allegory</b> (characters and objects stand for bigger ideas).',
            'In one sentence: British schoolboys stranded on an island with no adults slowly turn from <b>order to savagery</b>.',
          ],
          learn: [
            { title: 'The novel at a glance', html: '<div class="book-card"><div class="book-cover"><span>LORD<br>OF THE<br>FLIES</span><small>William Golding · 1954</small></div><ul class="facts"><li><b>Author:</b> William Golding, who served in the Royal Navy in World War II</li><li><b>Setting:</b> an uninhabited tropical island, during a war</li><li><b>Genre:</b> allegory — characters and objects stand for bigger ideas</li></ul></div><p class="big-formula small">British schoolboys stranded on an island with no adults slowly turn from <b>order</b> to <b>savagery</b>.</p>' },
            { title: 'The characters', sim: 'characters', html: '<p>Tap each character.</p>' },
          ],
          practice: [
            mcqS('Who wrote <i>Lord of the Flies</i>?', 'William Golding', ['William Shakespeare', 'George Orwell', 'Charles Dickens'], 'William Golding, published in 1954.'),
            mcqS('What is an allegory?', 'A story where characters and objects stand for bigger ideas', ['A true story', 'A poem about animals', 'A story told in letters'], 'Lord of the Flies is an allegory.'),
            mcqS('Where is the novel set?', 'An uninhabited tropical island, during a war', ['A boarding school in England', 'A ship at sea', 'A city after a war'], 'The boys’ plane crashes on the island.'),
            mcqS('In which war did Golding serve in the Royal Navy?', 'World War II', ['World War I', 'The Cold War', 'The Falklands War'], 'He served in the Royal Navy in World War II.'),
            mcqS('Which sentence best sums up the novel?', 'British schoolboys stranded on an island with no adults slowly turn from order to savagery', ['Schoolboys build a perfect society and are rescued', 'Adults and children fight over an island', 'A boy searches for treasure on an island'], 'From order to savagery.'),
            match('Match the character to what they do.', [['Ralph', 'Elected chief; wants rules and a signal fire'], ['Piggy', 'Wears glasses; stands for reason'], ['Jack', 'Leads the choir, who become hunters'], ['Simon', 'Realises the beast is “only us”'], ['Roger', 'Pushes the rock that kills Piggy']], 'Key characters.'),
            text('In what year was <i>Lord of the Flies</i> published?', '1954', [], '1954.'),
          ],
        },
        {
          id: 'e2', title: 'Chapters 1–4: Order begins',
          keys: CHAPTERS.slice(0, 4).map((c) => `<b>Ch ${c.n} – ${c.title}</b>: ${c.summary}`),
          learn: [
            { title: 'The story so far', sim: 'timeline', range: [1, 4], html: '<p>Scrub through the chapters. Watch the island slide from order towards savagery.</p>' },
            { title: 'Chapter 4: the turning point', html: '<ul class="facts"><li>Jack <b>paints his face</b> with clay and feels <b>free from shame</b> — a mask lets him act savagely.</li><li>A <b>ship passes</b> but the <b>fire has gone out</b>: the hunters left it to hunt. Rescue vs hunting.</li><li>Jack <b>hits Piggy</b> and breaks <b>one lens</b> of his glasses — reason is damaged.</li></ul>' },
          ],
          practice: [genWhichChapter, genWhichChapter,
            mcqS('How does Ralph call the boys together in Chapter 1?', 'He blows the conch', ['He lights a fire', 'He shouts from the mountain', 'Jack’s choir sings'], 'Ralph and Piggy find the conch and Ralph blows it.'),
            mcqS('What is used to light the first signal fire?', 'Piggy’s glasses', ['Matches', 'Two sticks', 'Lightning'], 'They light it with Piggy’s glasses (Chapter 2).'),
            mcqS('Why does the ship pass without seeing them in Chapter 4?', 'The fire went out because the hunters left it to hunt', ['It was raining', 'Ralph forgot to light it', 'The ship was too far away'], 'The hunters who should have watched the fire went hunting.'),
            tf('Jack kills a piglet in Chapter 1.', false, 'Jack tries to kill a piglet but hesitates.'),
            mcqS('What happens to the boy with the birthmark?', 'He goes missing and is probably dead after the fire', ['He becomes chief', 'He joins Jack’s tribe', 'He is rescued first'], 'Chapter 2: the fire gets out of control and he goes missing.'),
            genOrderEvents, genWhichChapter],
        },
        {
          id: 'e3', title: 'Chapters 5–8: Fear and the split',
          keys: CHAPTERS.slice(4, 8).map((c) => `<b>Ch ${c.n} – ${c.title}</b>: ${c.summary}`),
          learn: [
            { title: 'Things fall apart', sim: 'timeline', range: [5, 8], html: '<p>Fear of the beast grows, and the group splits.</p>' },
            { title: 'Chapter 8: the Lord of the Flies', html: '<p>The hunters kill a sow and put its head on a stick as a <b>gift for the beast</b>. Simon finds it, covered in flies — the <b>“Lord of the Flies”</b>.</p><p class="quote">“Fancy thinking the Beast was something you could hunt and kill!”</p><p>In his vision it tells him the beast is <b>part of everyone</b>. Simon faints.</p>' },
          ],
          practice: [genWhichChapter, genWhichChapter,
            mcqS('What does Simon suggest the beast might be in Chapter 5?', '“Only us”', ['A ghost from the sea', 'A wild pig', 'A dead parachutist'], 'Simon says the beast may be “only us”, and the boys laugh.'),
            mcqS('What do Sam and Eric see on the mountain in Chapter 6?', 'A dead parachutist, which they think is the beast', ['A real monster', 'A ship', 'Jack hiding'], 'A dead parachutist from an air battle lands on the mountain.'),
            mcqS('What happens when Jack asks the boys to vote Ralph out?', 'Nobody votes, so Jack leaves to start his own tribe', ['Everyone votes for Jack', 'Ralph resigns', 'Piggy becomes chief'], 'Chapter 8. Many boys later secretly join Jack.'),
            mcqS('What is the “Lord of the Flies”?', 'The sow’s head on a stick, covered in flies', ['Jack’s new name', 'The dead parachutist', 'The conch'], 'It’s the pig’s head left as a gift for the beast.'),
            tf('In Chapter 7, Ralph enjoys hitting a boar with his spear.', true, 'Even Ralph is drawn towards savagery.'),
            genOrderEvents, genQuote],
        },
        {
          id: 'e4', title: 'Chapters 9–12: Savagery and rescue',
          keys: CHAPTERS.slice(8, 12).map((c) => `<b>Ch ${c.n} – ${c.title}</b>: ${c.summary}`),
          learn: [
            { title: 'The descent', sim: 'timeline', range: [9, 12], html: '<p>The deaths of Simon and Piggy, and the final rescue.</p>' },
            { title: 'The ending', html: '<p>A <b>naval officer</b> arrives because he saw the smoke from the fire the hunters lit to kill Ralph. The fire meant to destroy Ralph is what saves him.</p><p class="quote">“Ralph wept for the end of innocence, the darkness of man’s heart, and the fall through the air of the true, wise friend called Piggy.”</p>' },
          ],
          practice: [genWhichChapter, genWhichChapter,
            mcqS('Why do the boys kill Simon?', 'In the frenzy of the dance they think he is the beast', ['He stole the glasses', 'He broke the conch', 'Jack orders it as punishment'], 'Simon crawls out to tell the truth, but they think he is the beast.'),
            mcqS('Why do Jack’s hunters steal Piggy’s glasses?', 'So they can make fire', ['To read with them', 'To break them', 'To trade them'], 'Chapter 10: they need the glasses to make fire.'),
            mcqS('Who pushes the rock that kills Piggy?', 'Roger', ['Jack', 'Ralph', 'Sam'], 'Roger, who enjoys the violence.'),
            mcqS('What else is destroyed when Piggy dies?', 'The conch', ['The glasses', 'Castle Rock', 'The shelters'], 'The rock smashes the conch — order ends.'),
            mcqS('Why does the naval officer come to the island?', 'He saw the smoke from the fire', ['He heard the conch', 'Piggy sent a signal', 'He was looking for the parachutist'], 'The hunters set the island on fire to smoke Ralph out.'),
            mcqS('Who is left in Ralph’s group in Chapter 10?', 'Ralph, Piggy, Sam and Eric', ['Ralph, Simon and Piggy', 'Ralph and Jack', 'Only Ralph'], 'Everyone else has joined Jack.'),
            genOrderEvents, genWhichChapter],
        },
        {
          id: 'e5', title: 'Symbols, themes and quotes',
          keys: [
            '<b>The conch</b>: order, rules and democracy. When it is smashed, order ends.',
            '<b>Piggy’s glasses</b>: science, reason and intelligence, and the power to make fire.',
            '<b>The signal fire</b>: hope of rescue and the link to civilisation.',
            '<b>The beast / Lord of the Flies</b>: the evil inside every person.',
          ],
          learn: [
            { title: 'The four key symbols', sim: 'symbols', html: '<p>Tap each card to flip it.</p>' },
            { title: 'Following a symbol through the book', html: '<table class="mini"><tr><th>Symbol</th><th>What happens to it</th></tr><tr><td>Conch</td><td>Ch 1 found → Ch 2 speaking rule → Ch 5 Jack rejects it → <b>Ch 11 smashed</b> with Piggy</td></tr><tr><td>Glasses</td><td>Ch 2 light the fire → <b>Ch 4 one lens broken</b> → <b>Ch 10 stolen</b> by Jack</td></tr><tr><td>Signal fire</td><td>Ch 2 out of control → <b>Ch 4 goes out</b> as a ship passes → Ch 12 a fire to kill brings rescue</td></tr><tr><td>Beast</td><td>Ch 2 “beastie” → Ch 6 parachutist → <b>Ch 8 “part of everyone”</b></td></tr></table>' },
            { title: 'Key quotes', html: QUOTES.map(([q, who, ch]) => `<p class="quote">${q}<small>— ${who}, Ch ${ch}</small></p>`).join('') },
          ],
          practice: [
            match('Match each symbol to what it stands for.', [['The conch', 'Order, rules and democracy'], ['Piggy’s glasses', 'Science, reason and intelligence'], ['The signal fire', 'Hope of rescue'], ['The Lord of the Flies', 'The evil inside every person']], 'The four key symbols.'),
            mcqS('What does the smashing of the conch show?', 'Order has ended', ['Rescue is coming', 'Piggy has won', 'The beast is dead'], 'When the conch is smashed, order ends.'),
            mcqS('What do Piggy’s glasses stand for?', 'Science, reason and intelligence', ['Hope of rescue', 'Evil', 'Democracy'], 'And the power to make fire.'),
            mcqS('What does the signal fire represent?', 'Hope of rescue and the link to civilisation', ['The beast', 'Jack’s power', 'Fear'], 'Keeping it lit = wanting to be rescued.'),
            mcqS('What does the beast really stand for?', 'The evil inside every person', ['A real animal', 'The adults', 'The naval officer'], 'Simon’s “only us” and the Lord of the Flies show this.'),
            genQuote, genQuote,
            tf('Jack’s face paint lets him feel free from shame.', true, 'Chapter 4: the mask helps him act savagely.'),
            genQuote],
        },
      ],
    },
  ],
};

export const _test = { genWhichChapter, genOrderEvents, genQuote };
