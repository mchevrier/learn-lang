# Matilda — English 4 fun! 🎒

Kid-friendly **word ↔ image matching games** to practise English vocabulary.
Built as a static, installable web app (PWA) that deploys to **GitHub Pages**.

Two game types, chosen per exercise:

| Type    | What the child does                                                       |
|---------|---------------------------------------------------------------------------|
| `link`  | Drag a line from each **picture** to its **word** (two columns).           |
| `boxes` | Drag each **word** into the box under the **right picture**.               |
| `tape`  | All cards are scattered; drag a **picture and its word together** to tape them into a pair. |
| `dialogue` | Rebuild a **conversation in order**: drag each line into the right speech bubble (no images — a script in `game.json`). |

The home screen is organised into **workshops** ("ateliers"); each workshop holds
one or more exercises. Tap a card to play. Works with **touch** (tablets/phones)
and mouse.

---

## 🗂️ How content is organised

```
exercises/
  atelier-1/
    atelier.json          ← workshop title + tagline
    family/               ← an exercise
      game.json
      mother.svg  father.svg  ...
  atelier-2/
    atelier.json
    fruits/      game.json + images
    vegetables/  game.json + images
```

**A workshop** is a folder under `exercises/` containing an `atelier.json`:

```json
{ "title": "Atelier 1", "tagline": "Meet the family!", "order": 1 }
```
- `tagline`: short catchy sentence (simple English) shown under the title.
- `order` (optional): controls the order of workshops on the home screen.

## ✨ Add a new exercise

1. Inside a workshop folder, create an exercise folder, e.g. `exercises/atelier-1/jobs/`.
2. Drop in your images. **The file name is the word to guess.**
   - `doctor.jpg` → *doctor*
   - `bus-driver.png` → *bus driver* (dashes/underscores become spaces)
   - Any of `.jpg .jpeg .png .webp .gif .svg` work.
3. Add a tiny **`game.json`** in that exercise folder:

   ```json
   { "title": "Jobs", "type": "link", "emoji": "👩‍⚕️" }
   ```

   - `type`: `"link"`, `"boxes"` or `"tape"`.
   - `emoji` (optional): shown on the home card.
   - `extraWords` (optional, `boxes` only): distractor words that don't match any
     picture, e.g. `"extraWords": ["nurse", "pilot"]`.

4. To add a **new workshop**, just create `exercises/atelier-N/` with an
   `atelier.json` and one or more exercise sub-folders.
5. Commit & push. **That's it** — GitHub Actions rebuilds the index and redeploys.

### Dialogue exercises (no images)

A `dialogue` exercise needs only a `game.json` (no image files) describing the
conversation:

```json
{
  "title": "Saying hello",
  "type": "dialogue",
  "emoji": "💬",
  "speakers": { "a": "🧒", "b": "🧑" },
  "lines": [
    { "who": "a", "text": "Hello!" },
    { "who": "b", "text": "Hi! How are you?" },
    { "who": "a", "text": "I am fine, thank you. How about you?" }
  ]
}
```
`speakers.a` / `speakers.b` are the two characters' avatars (emoji); each line's
`who` says which one speaks it.

> The sample workshops use simple SVG emoji cards so the app works out of the box.
> Replace any file with a real photo whenever you like — just keep the filename
> equal to the word.

---

## 🚀 Deploy to GitHub Pages (one-time setup)

1. Push this project to a GitHub repo (branch **`main`**).
2. Repo **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds
   `exercises.json` and publishes the site.

Your app will be live at `https://<user>.github.io/<repo>/`.

---

## 📱 Install as an app (PWA)

Open the site on a phone/tablet and use **"Add to Home Screen"** (Share menu on
iPad/iPhone, browser menu on Android). It installs an icon and runs full-screen;
exercises you've opened keep working offline.

---

## 💻 Run locally

ES modules + `fetch` need a real web server (not `file://`):

```bash
npm run build      # regenerate exercises.json after adding/removing images
npm start          # build + serve on http://localhost:8080  (uses python3)
```

No build step is needed for the app itself — it's plain HTML/CSS/JS.

### Regenerate the sample emoji images
```bash
node scripts/gen-sample-images.mjs   # rewrites the sample workshops' SVGs
```

---

## 🗂️ Project layout

```
index.html                 app shell
css/styles.css             theme (Matilda brand) + responsive layout
js/app.js                  hash router + service-worker registration
js/home.js                 workshop / exercise picker
js/games/link.js           drag-to-connect game
js/games/boxes.js          fill-in-the-boxes game
js/games/tape.js           scattered cards, tape into pairs
js/drag.js                 touch+mouse drag helper
js/ui.js                   status bar, confetti, win overlay, score storage
exercises/<atelier>/       a workshop: atelier.json + exercise sub-folders
exercises/<atelier>/<exercise>/   game.json + images (filename = word)
exercises.json             GENERATED index (don't edit by hand)
scripts/build-manifest.mjs scans exercises/ → writes exercises.json
manifest.webmanifest, sw.js, icons/   PWA bits
.github/workflows/deploy.yml           CI build + Pages deploy
```
