/* DIALOGUE game: a scripted conversation between two characters, shown as a
   numbered sequence of empty speech bubbles (alternating sides). The lines are
   shuffled into a bank; the child drags each line into the right bubble to
   rebuild the conversation in order. Wrong lines bounce back (keeping order). */

import { shuffle, el, winOverlay, makeStatus } from '../ui.js';
import { makeDraggable } from '../drag.js';

export function renderDialogue(mount, ex) {
  const lines = ex.lines;
  const total = lines.length;
  const speakers = ex.speakers || { a: '🙂', b: '🙃' };
  let solved = 0;

  const status = makeStatus(total);
  const head = el('div', { class: 'game-head' }, [
    el('h2', { text: `${ex.emoji || ''} ${ex.title}`.trim() }),
    status.el,
    el('p', { class: 'instructions', text: 'Put the conversation in order — drag each line into the right bubble.' }),
  ]);

  // conversation panel: one numbered row per line, bubble on the speaker's side
  const panel = el('div', { class: 'dialogue' });
  lines.forEach((line, i) => {
    const side = line.who === 'b' ? 'right' : 'left';
    const avatar = el('div', { class: 'avatar', text: speakers[line.who] || '🙂' });
    const slot = el('div', { class: 'bubble-slot', attrs: { 'data-text': line.text } });
    const content = el('div', { class: `talk-content ${side}` },
      side === 'left' ? [avatar, slot] : [slot, avatar]);
    panel.append(el('div', { class: 'talk-row' }, [
      el('div', { class: 'step', text: String(i + 1) }),
      content,
    ]));
  });

  const bank = el('div', { class: 'word-bank dialogue-bank' });
  mount.append(head, panel, bank);

  function updateProgress() {
    status.setSolved(solved);
    if (solved === total) {
      setTimeout(() => winOverlay({
        exerciseId: ex.id,
        mistakes: status.errors,
        onReplay: () => { mount.innerHTML = ''; renderDialogue(mount, ex); },
        onHome: () => { location.hash = '#/'; },
      }), 350);
    }
  }

  // The drag helper keeps the chip in place during a drag, so on a wrong/bank
  // drop the chip stays where it was in the bank (no reordering).
  function handleDrop(target, chip) {
    if (!target || target.classList.contains('word-bank') || target.dataset.locked === 'true') return;

    if (target.dataset.text === chip.dataset.text) {
      target.append(chip);
      target.classList.add('correct');
      target.dataset.locked = 'true';
      chip.dataset.locked = 'true';
      chip.classList.add('placed');
      solved++;
      updateProgress();
    } else {
      status.addError();
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

  for (const line of shuffle(lines)) {
    const chip = el('span', { class: 'chip', text: line.text, attrs: { 'data-text': line.text } });
    makeDraggable(chip, { dropSelector: '.bubble-slot, .word-bank', onDrop: handleDrop });
    bank.append(chip);
  }
}
