# Matilda — English 4 fun! 🎒

Kid-friendly **word ↔ image matching games** to practise English vocabulary.
Built as a static, installable web app (PWA) that deploys to **GitHub Pages**.

Two game types, chosen per exercise:

| Type    | What the child does                                                       |
|---------|---------------------------------------------------------------------------|
| `link`  | Drag a line from each **picture** to its **word** (two columns).           |
| `boxes` | Drag each **word** into the box under the **right picture**.               |
| `tape`  | All cards are scattered; drag a **picture and its word together** to tape them into a pair. |

The home screen lists every exercise; tap one to play. Works with **touch** (tablets/phones) and mouse.

---

## ✨ Add a new exercise (the only thing you need to know)

1. Create a folder under **`exercises/`**, e.g. `exercises/jobs/`.
2. Drop in your images. **The file name is the word to guess.**
   - `doctor.jpg` → *doctor*
   - `bus-driver.png` → *bus driver* (dashes/underscores become spaces)
   - Any of `.jpg .jpeg .png .webp .gif .svg` work.
3. Add a tiny **`game.json`** in that folder:

   ```json
   { "title": "Jobs", "type": "link", "emoji": "👩‍⚕️" }
   ```

   - `type`: `"link"`, `"boxes"` or `"tape"`.
   - `emoji` (optional): shown on the home card.
   - `extraWords` (optional, `boxes` only): distractor words that don't match any
     picture, e.g. `"extraWords": ["nurse", "pilot"]`.

4. Commit & push. **That's it** — GitHub Actions rebuilds the index and redeploys.

> The two default exercises (`animals`, `vegetables`) use simple SVG emoji cards so
> the app works out of the box. Replace those files with real photos whenever you
> like — just keep the filename equal to the word.

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
node scripts/gen-sample-images.mjs   # rewrites the animals/ & vegetables/ SVGs
```

---

## 🗂️ Project layout

```
index.html                 app shell
css/styles.css             theme (Matilda brand) + responsive layout
js/app.js                  hash router + service-worker registration
js/home.js                 exercise picker
js/games/link.js           drag-to-connect game
js/games/boxes.js          fill-in-the-boxes game
js/drag.js                 touch+mouse drag helper
js/ui.js                   confetti, win overlay, helpers
exercises/<name>/          one folder per exercise (images + game.json)
exercises.json             GENERATED index (don't edit by hand)
scripts/build-manifest.mjs scans exercises/ → writes exercises.json
manifest.webmanifest, sw.js, icons/   PWA bits
.github/workflows/deploy.yml           CI build + Pages deploy
```
