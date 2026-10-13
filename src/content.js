// Static content: the practice guide, daily tips, and the starter deck.

export const GUIDE_HTML = `
<p class="lead">Most popular study habits feel productive but barely work. A few methods, backed by
decades of experiments, work far better. This app is built around those few.</p>

<h2>What works</h2>

<div class="method">
  <h3>1. Active recall — test yourself, don't re-read</h3>
  <p>Pulling an answer <em>out</em> of your memory strengthens it far more than putting it in again.
  Close the book and ask: <strong>what do I remember?</strong> Struggling is the point — effortful recall
  is what builds memory. In this app: you see the question, you answer <em>before</em> you look (type it,
  or say it out loud).</p>
</div>

<div class="method">
  <h3>2. Spaced repetition — review just before you forget</h3>
  <p>Ten minutes a day for six days beats one hour the night before. Each successful recall makes the
  memory last longer, so reviews can get further apart: 1 day, 4 days, 2 weeks, 2 months… This app uses
  <strong>FSRS</strong>, a modern scheduling algorithm trained on hundreds of millions of reviews, to work
  out the best day for each card. Your job: <strong>do your reviews every day</strong>, and grade yourself honestly.</p>
</div>

<div class="method">
  <h3>3. Interleaving — mix topics</h3>
  <p>Practising A A A B B B C C C feels smoother, but A C B B A C B… teaches you to <em>choose</em> the right
  method, which is what tests and real life need. Reviews here mix all your decks by default. With maths or
  physics problems, mix problem types instead of doing 20 of the same kind.</p>
</div>

<div class="method">
  <h3>4. Elaboration — ask "why?" and "how?"</h3>
  <p>Linking a fact to things you already know makes it stick. Ask yourself <em>why is this true? how is
  it related to…? what's an example?</em> Use the <strong>Why / example</strong> field on cards for this.</p>
</div>

<div class="method">
  <h3>5. Free recall ("blurting")</h3>
  <p>After a lesson or chapter, write down <em>everything</em> you remember on a blank page — then check
  what you missed. The gaps show you exactly what to study. Use the <strong>Recall</strong> tab.</p>
</div>

<div class="method">
  <h3>6. Guess first (pretesting)</h3>
  <p>Trying to answer before you've learned something — even getting it wrong — makes the real answer
  stick better. So when a new card appears, have a go before you reveal it.</p>
</div>

<div class="method">
  <h3>7. For skills: deliberate practice</h3>
  <p>For music, sport, drawing, writing or maths problems: practise the <em>part you are bad at</em>, at the
  edge of your ability, with fast feedback, in short focused blocks. Repeating what you can already do
  is comfortable and almost useless.</p>
</div>

<div class="method">
  <h3>8. Sleep</h3>
  <p>Your brain stores what you learned while you sleep. Pulling an all-nighter throws away the studying
  you did. Study in the evening, sleep, quick review in the morning.</p>
</div>

<h2>What wastes time</h2>
<ul class="bad">
  <li><strong>Re-reading</strong> — feels familiar, but recognising is not remembering.</li>
  <li><strong>Highlighting</strong> — colouring is not thinking.</li>
  <li><strong>Copying notes neatly</strong> — slow, and you can do it without thinking.</li>
  <li><strong>Cramming</strong> — works for tomorrow, gone in a week.</li>
  <li><strong>"Learning styles"</strong> (visual / auditory learner) — tested many times; no effect.</li>
  <li><strong>Studying with your phone nearby</strong> — even switched off, it costs attention. Put it in another room.</li>
  <li><strong>Marking "Good" when you weren't sure</strong> — you only cheat the schedule, and the card comes back too late.</li>
</ul>

<h2>Making good cards</h2>
<ul>
  <li><strong>One idea per card.</strong> "What are the 3 states of matter?" is worse than three small cards, or one cloze per state.</li>
  <li><strong>Understand first, then memorise.</strong> Don't make cards for things you don't understand yet.</li>
  <li><strong>Use your own words.</strong> Copy-pasted textbook sentences are hard to recall.</li>
  <li><strong>Ask a real question.</strong> "Why does ice float?" beats "Ice — density".</li>
  <li><strong>Add an example or the why.</strong> Put it in the Why / example field.</li>
  <li><strong>Fix cards you keep failing.</strong> If a card is marked as a <em>leech</em>, it's badly made — split it or add a memory hook. Don't just grind it.</li>
</ul>

<h2>A daily routine (20–40 min)</h2>
<ol>
  <li><strong>Reviews first.</strong> Clear today's due cards. Never skip days — reviews pile up.</li>
  <li><strong>Learn something new</strong> from class or a book. Read once, carefully, trying to understand.</li>
  <li><strong>Close it and blurt</strong> everything you remember. Check. Fill gaps.</li>
  <li><strong>Make a few cards</strong> for what matters (5–15 a day is plenty).</li>
  <li><strong>Do mixed practice problems</strong> if the subject has them.</li>
  <li><strong>Sleep.</strong></li>
</ol>

<h2>How to grade yourself</h2>
<dl class="grades">
  <dt class="g1">Again</dt><dd>Forgot, or got it wrong. No shame — it comes back in a few minutes.</dd>
  <dt class="g2">Hard</dt><dd>Got it, but it took real effort or you were unsure.</dd>
  <dt class="g3">Good</dt><dd>Got it after a moment's thought. Use this most of the time.</dd>
  <dt class="g4">Easy</dt><dd>Instantly, no effort. Use rarely.</dd>
</dl>
<p class="muted small">Sources: Dunlosky et al. (2013) "Improving Students' Learning With Effective Learning Techniques";
Roediger &amp; Karpicke (2006) on the testing effect; Cepeda et al. (2006) on spacing; Rohrer &amp; Taylor (2007) on interleaving;
Pashler et al. (2008) on learning styles; Ericsson on deliberate practice; FSRS by Jarrett Ye / open-spaced-repetition.</p>
`;

export const TIPS = [
  'Answer before you reveal. Recognising the answer is not the same as remembering it.',
  'Do your reviews every day. Ten minutes daily beats an hour once a week.',
  'Be honest: if you hesitated a lot, press Hard. If you got it wrong, press Again.',
  'One idea per card. Small cards are fast to review and easy to remember.',
  'Ask "why?" — a fact linked to a reason sticks much better than a fact alone.',
  'Phone in another room while studying. Even a silent phone steals attention.',
  'After class, close your notes and write down everything you remember.',
  'Sleep is when your brain saves what you learned. Don\'t trade it for cramming.',
  'Failing the same card again and again? Rewrite it — split it or add an example.',
  'Mix topics when you practise. It feels harder, and that\'s why it works.',
];

export const STARTER_DECK = {
  name: 'How to learn',
  notes: [
    { kind: 'basic', front: 'What is **active recall**?', back: 'Testing yourself: pulling the answer out of memory instead of re-reading it.', extra: 'Effortful retrieval strengthens memory much more than reviewing does (the testing effect).' },
    { kind: 'basic', front: 'Why does re-reading feel effective even though it isn\'t?', back: 'The text feels familiar, so you mistake recognising it for knowing it.', extra: 'This is called the "illusion of fluency". Test yourself to find out what you really know.' },
    { kind: 'basic', front: 'What is **spaced repetition**?', back: 'Reviewing at growing intervals, just before you would forget.', extra: 'Example: 1 day, then 4 days, then 2 weeks, then 2 months.' },
    { kind: 'cloze', front: 'Studying in short sessions over several days instead of all at once is called {{c1::spacing}}; doing it all the night before is called {{c2::cramming}}.', back: '', extra: 'Cramming can work for tomorrow\'s test but is mostly forgotten within a week.' },
    { kind: 'basic', front: 'What is **interleaving**?', back: 'Mixing different topics or problem types in one practice session.', extra: 'It teaches you to pick the right method, not just repeat one.' },
    { kind: 'basic', front: 'Why should you guess before revealing a new card\'s answer?', back: 'Trying first (even wrongly) makes the real answer stick better.', extra: 'This is the pretesting effect.' },
    { kind: 'basic', front: 'What is **blurting** (free recall)?', back: 'Writing down everything you remember about a topic from memory, then checking what you missed.' },
    { kind: 'basic', front: 'When should you press **Again**?', back: 'When you forgot or got it wrong.', extra: 'It comes back in a few minutes. Honest grading keeps the schedule right.' },
    { kind: 'basic', front: 'When should you press **Hard**?', back: 'When you got it right, but only with real effort or doubt.' },
    { kind: 'basic', front: 'What does "one idea per card" mean?', back: 'Each card asks about a single small fact, so it is quick to answer and easy to remember.', extra: 'Big cards with lists are the most common reason cards keep failing.' },
    { kind: 'basic', front: 'What is a **leech** card?', back: 'A card you keep forgetting. It usually needs rewriting, not more repetition.' },
    { kind: 'basic', front: 'What is **deliberate practice**?', back: 'Focused practice on your weak spots, at the edge of your ability, with quick feedback.', extra: 'Repeating what you can already do feels nice but teaches little.' },
    { kind: 'basic', front: 'Why is sleep important for learning?', back: 'Your brain consolidates (saves) memories while you sleep.' },
    { kind: 'cloze', front: 'Research has found {{c1::no}} benefit from teaching to "learning styles" like visual or auditory.', back: '', extra: 'Everyone learns better from good methods; the format should fit the content, not the person.' },
    { kind: 'basic', front: 'Name two popular study habits that work poorly.', back: 'Re-reading and highlighting (also: copying notes, cramming).' },
  ],
};
