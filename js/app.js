/* App entry: loads the exercise index, runs a tiny hash router, registers SW. */

import { renderHome } from './home.js';
import { renderLink } from './games/link.js';
import { renderBoxes } from './games/boxes.js';
import { el } from './ui.js';

const appEl = document.getElementById('app');
const backBtn = document.getElementById('back-btn');

let manifest = null;

async function loadManifest() {
  if (manifest) return manifest;
  const res = await fetch('exercises.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`exercises.json: ${res.status}`);
  manifest = await res.json();
  return manifest;
}

function showMessage(html) {
  appEl.innerHTML = '';
  appEl.append(el('div', { class: 'message', html }));
}

async function route() {
  const hash = location.hash.replace(/^#\/?/, ''); // "", "exercise/animals"
  const [section, id] = hash.split('/');

  let data;
  try {
    data = await loadManifest();
  } catch (err) {
    showMessage(`Couldn't load <code>exercises.json</code>.<br>Run <code>npm run build</code> first, then serve over http (not file://).`);
    return;
  }

  window.scrollTo(0, 0);

  if (section === 'exercise' && id) {
    const ex = data.exercises.find((e) => e.id === id);
    if (!ex) { location.hash = '#/'; return; }
    backBtn.hidden = false;
    appEl.innerHTML = '';
    const mount = el('div');
    appEl.append(mount);
    if (ex.type === 'boxes') renderBoxes(mount, ex);
    else renderLink(mount, ex);
    return;
  }

  // Home
  backBtn.hidden = true;
  appEl.innerHTML = '';
  renderHome(appEl, data.exercises);
}

backBtn.addEventListener('click', () => { location.hash = '#/'; });
window.addEventListener('hashchange', route);
route();

/* PWA service worker (relative scope so it works under a GitHub Pages subpath). */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support optional */ });
  });
}
