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
  const colors = ['#2bb673', '#2e9be6', '#ffc233', '#ff6b5e', '#9b6bd6'];
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

/** Celebration overlay shown when an exercise is finished. */
export function winOverlay({ onReplay, onHome }) {
  const cheers = ['Bravo !', 'Super !', 'Génial !', 'Well done!', 'Amazing!'];
  const overlay = el('div', { class: 'win-overlay' });
  const card = el('div', { class: 'win-card' }, [
    el('div', { class: 'big', text: '🎉' }),
    el('h2', { text: cheers[Math.floor(Math.random() * cheers.length)] }),
    el('p', { text: 'You matched them all!' }),
    el('div', { class: 'actions' }, [
      el('button', { class: 'btn', text: '↻ Play again', on: { click: () => { overlay.remove(); onReplay(); } } }),
      el('button', { class: 'btn secondary', text: '🏠 Exercises', on: { click: () => { overlay.remove(); onHome(); } } }),
    ]),
  ]);
  overlay.append(card);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.append(overlay);
  confetti();
}
