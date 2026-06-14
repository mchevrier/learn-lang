/* Small shared UI helpers. */

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Create an element with optional class, attrs, text, children. */
export function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text != null) node.textContent = opts.text;
  if (opts.html != null) node.innerHTML = opts.html;
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  if (opts.on) for (const [k, v] of Object.entries(opts.on)) node.addEventListener(k, v);
  for (const c of [].concat(children)) if (c) node.append(c);
  return node;
}

/** Burst of falling confetti. */
export function confetti(count = 90) {
  const colors = ['#bd393b', '#264a8c', '#ffcf33', '#9c2e30', '#3a64b0'];
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    const size = 8 + Math.random() * 10;
    c.style.left = Math.random() * 100 + 'vw';
    c.style.width = size + 'px';
    c.style.height = size * (0.5 + Math.random()) + 'px';
    c.style.background = colors[i % colors.length];
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.opacity = '0';
    const dur = 2.2 + Math.random() * 1.8;
    c.style.animation = `fall ${dur}s ${Math.random() * 0.5}s linear forwards`;
    document.body.append(c);
    setTimeout(() => c.remove(), (dur + 1) * 1000);
  }
}

/* ---- per-exercise best score (fewest mistakes), persisted locally ---- */
const BEST_KEY = (id) => `matilda:best:${id}`;

/** Best (lowest) mistake count ever achieved for an exercise, or null. */
export function getBestMistakes(id) {
  try {
    const v = localStorage.getItem(BEST_KEY(id));
    return v == null ? null : Number(v);
  } catch { return null; }
}

/** Record a finished run; keeps only the best (lowest) mistake count. */
export function saveResult(id, mistakes) {
  try {
    const prev = getBestMistakes(id);
    if (prev == null || mistakes < prev) localStorage.setItem(BEST_KEY(id), String(mistakes));
  } catch { /* storage unavailable (private mode) — ignore */ }
}

/** Live status row for a game: progress bar + solved count + mistake counter. */
export function makeStatus(total) {
  const fill = el('span');
  const countEl = el('span', { class: 'count', text: `0/${total}` });
  const errEl = el('span', { text: '0' });
  const errPill = el('span', { class: 'errors-pill', attrs: { title: 'Erreurs' } }, [
    document.createTextNode('❌ '), errEl,
  ]);
  const row = el('div', { class: 'progress' }, [
    el('span', { class: 'bar' }, [fill]),
    countEl,
    errPill,
  ]);
  let errors = 0;
  return {
    el: row,
    setSolved(n) { fill.style.width = `${(n / total) * 100}%`; countEl.textContent = `${n}/${total}`; },
    addError() {
      errors++;
      errEl.textContent = String(errors);
      errPill.classList.remove('bump');
      void errPill.offsetWidth;
      errPill.classList.add('bump');
    },
    get errors() { return errors; },
  };
}

/** Celebration overlay shown when an exercise is finished. */
export function winOverlay({ exerciseId, mistakes = 0, onReplay, onHome }) {
  if (exerciseId != null) saveResult(exerciseId, mistakes);
  const flawless = mistakes === 0;
  const cheers = flawless
    ? ['Sans faute !', 'Parfait !', 'Perfect!']
    : ['Bravo !', 'Super !', 'Bien joué !'];
  const overlay = el('div', { class: 'win-overlay' });
  const card = el('div', { class: 'win-card' }, [
    el('div', { class: 'big', text: flawless ? '🌟' : '🎉' }),
    el('h2', { text: cheers[Math.floor(Math.random() * cheers.length)] }),
    el('p', {
      text: flawless
        ? 'Aucune erreur — bravo !'
        : `Terminé avec ${mistakes} erreur${mistakes > 1 ? 's' : ''}.`,
    }),
    el('div', { class: 'actions' }, [
      el('button', { class: 'btn', text: '↻ Rejouer', on: { click: () => { overlay.remove(); onReplay(); } } }),
      el('button', { class: 'btn secondary', text: '🏠 Exercices', on: { click: () => { overlay.remove(); onHome(); } } }),
    ]),
  ]);
  overlay.append(card);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.append(overlay);
  confetti();
}
