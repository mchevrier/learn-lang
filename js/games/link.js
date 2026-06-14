/* LINK game ("messy" → tidied): connect each picture to its word by dragging
   a line between the coloured dots. Images on the left, words on the right,
   each column shuffled independently. */

import { shuffle, el, winOverlay } from '../ui.js';

const SVGNS = 'http://www.w3.org/2000/svg';

export function renderLink(mount, ex) {
  const total = ex.items.length;
  let solved = 0;

  // --- header ---
  const fill = el('span');
  const progress = el('div', { class: 'progress' }, [
    el('span', { class: 'bar' }, [fill]),
    el('span', { class: 'count', text: `0/${total}` }),
  ]);
  const head = el('div', { class: 'game-head' }, [
    el('h2', { text: `${ex.emoji || ''} ${ex.title}`.trim() }),
    progress,
    el('p', { class: 'instructions', text: 'Drag a line from each picture to the matching word.' }),
  ]);

  // --- board ---
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.classList.add('link-svg');
  const imgCol = el('div', { class: 'link-col images' });
  const wordCol = el('div', { class: 'link-col words' });
  const board = el('div', { class: 'link-board' }, [svg, imgCol, wordCol]);

  const images = shuffle(ex.items);
  const words = shuffle(ex.items);

  // build image cards (dot on the right)
  for (const item of images) {
    const dot = el('span', { class: 'dot', attrs: { 'data-side': 'img', 'data-word': item.word } });
    const card = el('div', { class: 'img-card' }, [
      el('img', { attrs: { src: item.image, alt: item.word, draggable: 'false' } }),
      dot,
    ]);
    dot._card = card;
    imgCol.append(card);
  }
  // build word cards (dot on the left)
  for (const item of words) {
    const dot = el('span', { class: 'dot', attrs: { 'data-side': 'word', 'data-word': item.word } });
    const card = el('div', { class: 'word-card' }, [
      dot,
      el('span', { class: 'label', text: item.word }),
    ]);
    dot._card = card;
    wordCol.append(card);
  }

  mount.append(head, board);

  // --- line drawing ---
  const links = []; // { a: dot, b: dot, lineEl }

  function dotCenter(dot) {
    const b = board.getBoundingClientRect();
    const r = dot.getBoundingClientRect();
    return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
  }
  function makeLine(cls) {
    const ln = document.createElementNS(SVGNS, 'line');
    ln.setAttribute('stroke-width', '6');
    ln.setAttribute('stroke-linecap', 'round');
    ln.setAttribute('class', cls);
    svg.append(ln);
    return ln;
  }
  function setLine(ln, x1, y1, x2, y2) {
    ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
    ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
  }
  function redrawAll() {
    for (const l of links) {
      const a = dotCenter(l.a), b = dotCenter(l.b);
      setLine(l.lineEl, a.x, a.y, b.x, b.y);
    }
  }
  window.addEventListener('resize', redrawAll);

  function updateProgress() {
    fill.style.width = `${(solved / total) * 100}%`;
    progress.querySelector('.count').textContent = `${solved}/${total}`;
    if (solved === total) {
      setTimeout(() => winOverlay({
        onReplay: () => { mount.innerHTML = ''; renderLink(mount, ex); },
        onHome: () => { location.hash = '#/'; },
      }), 350);
    }
  }

  // --- drag-to-connect interaction ---
  function startDrag(sourceDot, e) {
    if (sourceDot.dataset.locked === 'true') return;
    e.preventDefault();
    sourceDot.classList.add('armed');
    const temp = makeLine('temp-line');
    temp.setAttribute('stroke', '#2e9be6');
    temp.setAttribute('stroke-dasharray', '2 10');
    const start = dotCenter(sourceDot);

    let hoverDot = null;
    const findDot = (x, y) => {
      const under = document.elementFromPoint(x, y);
      const d = under && under.closest('.dot');
      // only the opposite side, not locked, not the source
      if (d && d !== sourceDot && d.dataset.side !== sourceDot.dataset.side && d.dataset.locked !== 'true') return d;
      return null;
    };
    const localFromEvent = (ev) => {
      const b = board.getBoundingClientRect();
      return { x: ev.clientX - b.left, y: ev.clientY - b.top };
    };

    const move = (ev) => {
      const p = localFromEvent(ev);
      setLine(temp, start.x, start.y, p.x, p.y);
      const d = findDot(ev.clientX, ev.clientY);
      if (d !== hoverDot) {
        hoverDot?.classList.remove('armed');
        d?.classList.add('armed');
        hoverDot = d;
      }
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      temp.remove();
      sourceDot.classList.remove('armed');
      hoverDot?.classList.remove('armed');
      const target = findDot(ev.clientX, ev.clientY);
      if (target) attemptConnect(sourceDot, target);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function attemptConnect(a, b) {
    const correct = a.dataset.word === b.dataset.word;
    if (correct) {
      for (const dot of [a, b]) {
        dot.dataset.locked = 'true';
        dot.classList.add('connected');
        dot._card.classList.add('solved');
      }
      const ln = makeLine('solved-line');
      ln.setAttribute('stroke', '#2bb673');
      const ca = dotCenter(a), cb = dotCenter(b);
      setLine(ln, ca.x, ca.y, cb.x, cb.y);
      links.push({ a, b, lineEl: ln });
      solved++;
      updateProgress();
    } else {
      for (const dot of [a, b]) {
        dot._card.classList.remove('shake');
        void dot._card.offsetWidth; // restart animation
        dot._card.classList.add('shake');
      }
    }
  }

  board.querySelectorAll('.dot').forEach((dot) => {
    dot.addEventListener('pointerdown', (e) => startDrag(dot, e));
  });
}
