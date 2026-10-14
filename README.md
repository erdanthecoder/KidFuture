# KidFuture

Two study apps built on methods that research shows actually work (active recall, spaced
repetition, interleaving, worked examples, feedback). No build step, no server.

## 1. Year 9 Revision — `year9/` → **https://year9topics.web.app**

Animated lessons and activities for the class revision notes, in 15–30 minutes a day:

- **Maths (Year 9)** — Unit 1 Standard form, significant figures and powers · Unit 2 2D shapes
  and 3D solids · Unit 3 Expressions · Quadratics (for later)
- **Science (Year 8, Exploring Science)** — 8D Unicellular organisms · 8G Metals and their uses ·
  8L Earth and space
- **English** — *Lord of the Flies*: the novel, all 12 chapters, characters, symbols and quotes
- **Geography** — Rocks (geog.3): rock types, the rock cycle, weathering, limestone landscapes, using rocks and soil
- **History** — 1901 to today: votes for women, WW1, between the wars, WW2, the Holocaust, Britain after 1945, the Cold War

Each topic has animated explanation slides with interactive simulations (powers-of-10 ladder,
significant-figure highlighter, prism/cylinder builders, Pythagoras squares, bacterium and virus,
diffusion, yeast growth curve, metals in acid, rusting experiment, alloy layers, seasons, Moon
phases, magnetic fields, weight on other worlds, chapter timeline…), then practice activities:
multiple choice, true/false, typed answers (exact maths checking: `1/8`, `0.125`, `3,5`,
`5.4 × 10^7` all work), matching and ordering. Maths questions are generated, so there's
endless practice, and every generated answer is re-calculated by the tests.

- **Today's session** (≈20 min): warm-up review → learn a new topic → practise → mixed questions.
- **Flashcards**: 349 cards covering every topic, with a 3D flip and FSRS spaced repetition (20 new a day; cards you forget come back the same day).
- **Spaced review**: topics come back after 1, 2, 4, 7 and 14 days; mistakes reset them.
- **Unit tests**, an **all-topics revision sheet** (printable), XP, streaks and a 20-minute daily goal.
- **Sign in with Google** (school Google Workspace accounts work), via Firebase Authentication like
  the copilot apps; progress is saved per account on the device. Guest mode works anywhere.

### Deploying to year9topics.web.app

`.github/workflows/firebase.yml` tests and deploys `year9/` on every push. It needs **one
repository secret**: `FIREBASE_SERVICE_ACCOUNT` — the same Firebase service-account key the
copilot repo uses (Firebase console → Project settings → Service accounts → Generate new private
key). The workflow creates the `year9topics` site, registers a web app and authorises the domain
for Google sign-in. Google sign-in must be enabled in Firebase → Authentication → Sign-in method.

Run locally: `npm start`, then open http://localhost:8080/year9/

**One-file version:** `./scripts/build-single-file.sh` builds `dist/Year9-Revision.html` — the whole app in a
single file that works offline when opened in a browser, with no website needed.

## 2. Practice app — repo root

A flashcard app for any subject, with FSRS spaced repetition. Works offline on your phone.

### What it does

| Method | How the app uses it |
|---|---|
| **Active recall** | You answer *before* seeing the answer — type it (checked for typos/accents) or say it. |
| **Spaced repetition** | The [FSRS](https://github.com/open-spaced-repetition) algorithm picks the best day to review each card, aiming for the retention you choose (default 90%). |
| **Interleaving** | Reviews mix all your decks; new cards are mixed in between reviews. |
| **Elaboration** | Every card has a *Why / example* field, shown after you answer. |
| **Pretesting** | New cards ask you to guess first. |
| **Free recall (blurting)** | The *Recall* tab: write everything you remember, tick off what you got, and missed cards jump into today's reviews. |
| **Fixing bad cards** | Cards you keep forgetting are flagged as *leeches* with a prompt to rewrite them; the editor warns about long answers and lists. |
| **Honest feedback** | *Progress* shows your real retention vs. your target, a 30-day review forecast, and your practice days. |

Left out on purpose: highlighting, re-reading, "learning styles", points/badges that reward
quantity over memory.

Read the in-app **Guide** for the full "how to practise well" explanation.

### Using it

- **Add cards:** *Question* cards (optionally also asked in reverse) or *Fill the gap* (cloze) —
  select words and press *Make gap*; each gap becomes its own card.
- **Bulk add:** in a deck, paste lines like `question :: answer :: why` or tab-separated rows.
- **Keyboard:** `Space`/`Enter` reveal · `1` Again · `2` Hard · `3` Good · `4` Easy · `U` undo · `E` edit.
- **Backup:** data lives in your browser (localStorage). Export a backup from *Settings*.

### Run locally

```bash
npm start          # serves the folder at http://localhost:8080
npm test           # unit tests (Node 20+)
```

Any static file server works (`python3 -m http.server`). To deploy, publish the repo root as a
static site (Netlify config included; GitHub Pages also works).

### Code

```
index.html, styles.css      app shell and styles (light + dark)
src/scheduler.js            FSRS-4.5 scheduler (pure, tested)
src/cards.js                cloze/basic rendering, answer checking, bulk import
src/store.js                state, persistence, study queue, stats
src/app.js                  UI and routing
src/content.js              guide, tips, starter deck
sw.js, manifest.webmanifest offline / installable PWA
```
