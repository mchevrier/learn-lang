/* BOXES game ("fill in the boxes"): a grid of pictures, each with an empty box
   underneath, and a shuffled word bank at the bottom. Drag the right word into
   each box. Wrong words gently bounce back; correct ones lock in green. */

import { shuffle, el, winOverlay } from '../ui.js';
import { makeDraggable } from '../drag.js';

export function renderBoxes(mount, ex) {
  const total = ex.items.length;
  let solved = 0;

  const fill = el('span');
  const progress = el('div', { class: 'progress' }, [
    el('span', { class: 'bar' }, [fill]),
    el('span', { class: 'count', text: `0/${total}` }),
  ]);
  const head = el('div', { class: 'game-head' }, [
    el('h2', { text: `${ex.emoji || ''} ${ex.title}`.trim() }),
    progress,
    el('p', { class: 'instructions', text: 'Drag each word into the box under the right picture.' }),
  ]);

  // image grid with a drop-box under each picture
  const grid = el('div', { class: 'boxes-grid' });
  for (const item of ex.items) {
    const box = el('div', { class: 'drop-box', attrs: { 'data-word': item.word } });
    const cell = el('div', { class: 'box-cell' }, [
      el('img', { attrs: { src: item.image, alt: '', draggable: 'false' } }),
      box,
    ]);
    grid.append(cell);
  }

  const bank = el('div', { class: 'word-bank' });

  mount.append(head, grid, bank);

  function updateProgress() {
    fill.style.width = `${(solved / total) * 100}%`;
    progress.querySelector('.count').textContent = `${solved}/${total}`;
    if (solved === total) {
      setTimeout(() => winOverlay({
        onReplay: () => { mount.innerHTML = ''; renderBoxes(mount, ex); },
        onHome: () => { location.hash = '#/'; },
      }), 350);
    }
  }

  // The drag helper hides the chip in place during a drag and restores it
  // before this runs, so on a wrong/cancelled/bank drop the chip is still in
  // its original slot — we simply leave it there (no reordering of the bank).
  function handleDrop(target, chip) {
    // dropped on the bank, outside any box, or on an already-filled box
    if (!target || target.classList.contains('word-bank') || target.dataset.locked === 'true') {
      return;
    }

    const correct = target.dataset.word === chip.dataset.word;
    if (correct) {
      target.append(chip);
      target.classList.add('correct');
      target.dataset.locked = 'true';
      chip.dataset.locked = 'true';
      chip.classList.add('placed');
      solved++;
      updateProgress();
    } else {
      // wrong: flash the box red and shake the chip in place, then settle —
      // the chip stays exactly where it was in the bank.
      target.classList.add('wrong');
      chip.classList.remove('shake');
      void chip.offsetWidth;
      chip.classList.add('shake');
      setTimeout(() => {
        target.classList.remove('wrong');
        chip.classList.remove('shake');
      }, 500);
    }
  }

  // build the chips (words + optional distractors), shuffled
  const words = ex.items.map((i) => i.word).concat(ex.extraWords || []);
  for (const word of shuffle(words)) {
    const chip = el('span', { class: 'chip', text: word, attrs: { 'data-word': word } });
    makeDraggable(chip, { dropSelector: '.drop-box, .word-bank', onDrop: handleDrop });
    bank.append(chip);
  }
}
