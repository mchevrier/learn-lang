/* TAPE game (the "scattered" style from the first screenshot): every card —
   pictures AND words — is shuffled and dropped randomly on the board. Drag a
   word onto its matching picture (or a picture onto its word) and they snap
   together into a taped pair: picture on top, word underneath. */

import { shuffle, el, winOverlay, makeStatus } from '../ui.js';

export function renderTape(mount, ex) {
  const total = ex.items.length;
  let solved = 0;
  let topZ = 10;

  const status = makeStatus(total);
  const head = el('div', { class: 'game-head' }, [
    el('h2', { text: `${ex.emoji || ''} ${ex.title}`.trim() }),
    status.el,
    el('p', { class: 'instructions', text: 'Drag each picture and its word onto each other to tape them together.' }),
  ]);

  const board = el('div', { class: 'tape-board' });
  mount.append(head, board);

  const wordToImg = new Map(ex.items.map((i) => [i.word, i.image]));

  function updateProgress() {
    status.setSolved(solved);
    if (solved === total) {
      setTimeout(() => winOverlay({
        exerciseId: ex.id,
        mistakes: status.errors,
        onReplay: () => { mount.innerHTML = ''; renderTape(mount, ex); },
        onHome: () => { location.hash = '#/'; },
      }), 400);
    }
  }

  // ----- build tiles (one picture tile + one word tile per item) -----
  const tiles = [];
  for (const it of ex.items) {
    tiles.push(el('div', {
      class: 'tile img-tile taped',
      attrs: { 'data-kind': 'img', 'data-word': it.word },
    }, [el('img', { attrs: { src: it.image, alt: '', draggable: 'false' } })]));
    tiles.push(el('div', {
      class: 'tile word-tile',
      attrs: { 'data-kind': 'word', 'data-word': it.word },
      text: it.word,
    }));
  }

  // ----- scatter them on a loose, jittered grid (messy but reachable) -----
  const scattered = shuffle(tiles);
  scattered.forEach((t) => board.append(t));

  function layout() {
    const bw = board.clientWidth || 320;
    const cellW = Math.min(170, Math.max(120, bw / 4));
    const cols = Math.max(2, Math.floor(bw / cellW));
    const colW = bw / cols;
    const cellH = 138;
    const rows = Math.ceil(scattered.length / cols);
    board.style.height = `${rows * cellH + 30}px`;

    scattered.forEach((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tw = t.offsetWidth;
      const th = t.offsetHeight;
      const jx = (Math.random() - 0.5) * colW * 0.35;
      const jy = (Math.random() - 0.5) * cellH * 0.35;
      let x = col * colW + (colW - tw) / 2 + jx;
      let y = row * cellH + (cellH - th) / 2 + jy;
      x = Math.max(2, Math.min(x, bw - tw - 2));
      y = Math.max(2, y);
      t.style.left = `${x}px`;
      t.style.top = `${y}px`;
      t.style.setProperty('--rot', `${(Math.random() - 0.5) * 14}deg`);
      t.style.zIndex = String(++topZ);
    });
  }
  layout();

  // ----- free-drag with snap-to-match -----
  function attachDrag(t) {
    t.addEventListener('pointerdown', (e) => {
      if (t.dataset.locked === 'true') return;
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const origLeft = parseFloat(t.style.left) || 0;
      const origTop = parseFloat(t.style.top) || 0;
      t.classList.add('dragging');
      t.style.zIndex = String(++topZ);

      const move = (ev) => {
        t.style.left = `${origLeft + (ev.clientX - startX)}px`;
        t.style.top = `${origTop + (ev.clientY - startY)}px`;
      };
      const up = (ev) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        t.classList.remove('dragging');

        t.style.pointerEvents = 'none';
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        t.style.pointerEvents = '';
        const target = under && under.closest('.tile');

        if (target && target !== t &&
            target.dataset.locked !== 'true' &&
            target.dataset.kind !== t.dataset.kind &&
            target.dataset.word === t.dataset.word) {
          formPair(t, target);
        } else if (target && target !== t && target.dataset.kind !== t.dataset.kind) {
          // touched the wrong partner: little shake, stays where dropped
          status.addError();
          t.classList.remove('shake');
          void t.offsetWidth;
          t.classList.add('shake');
        }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
  }
  scattered.forEach(attachDrag);

  function formPair(a, b) {
    const imgTile = a.dataset.kind === 'img' ? a : b;
    const word = imgTile.dataset.word;
    const left = parseFloat(imgTile.style.left) || 0;
    const top = parseFloat(imgTile.style.top) || 0;

    const pair = el('div', {
      class: 'tile pair taped solved pop-in',
      attrs: { 'data-locked': 'true' },
    }, [
      el('img', { attrs: { src: wordToImg.get(word), alt: '', draggable: 'false' } }),
      el('div', { class: 'pair-word', text: word }),
    ]);
    pair.style.left = `${left}px`;
    pair.style.top = `${top}px`;
    pair.style.setProperty('--rot', '0deg');
    pair.style.zIndex = String(++topZ);

    a.remove();
    b.remove();
    board.append(pair);

    solved++;
    updateProgress();
  }
}
