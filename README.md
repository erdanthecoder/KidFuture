# KidFuture — practise smarter

A study app built only on methods that research shows actually work. No accounts, no server,
no build step: open it in a browser, and it works offline on your phone too.

## What it does

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

## Using it

- **Add cards:** *Question* cards (optionally also asked in reverse) or *Fill the gap* (cloze) —
  select words and press *Make gap*; each gap becomes its own card.
- **Bulk add:** in a deck, paste lines like `question :: answer :: why` or tab-separated rows.
- **Keyboard:** `Space`/`Enter` reveal · `1` Again · `2` Hard · `3` Good · `4` Easy · `U` undo · `E` edit.
- **Backup:** data lives in your browser (localStorage). Export a backup from *Settings*.

## Run locally

```bash
npm start          # serves the folder at http://localhost:8080
npm test           # unit tests (Node 20+)
```

Any static file server works (`python3 -m http.server`). To deploy, publish the repo root as a
static site (Netlify config included; GitHub Pages also works).

## Code

```
index.html, styles.css      app shell and styles (light + dark)
src/scheduler.js            FSRS-4.5 scheduler (pure, tested)
src/cards.js                cloze/basic rendering, answer checking, bulk import
src/store.js                state, persistence, study queue, stats
src/app.js                  UI and routing
src/content.js              guide, tips, starter deck
sw.js, manifest.webmanifest offline / installable PWA
```
