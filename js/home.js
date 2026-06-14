/* Home screen: a grid of exercise cards built from the manifest. */

import { el, getBestMistakes } from './ui.js';

const TYPE_LABEL = { link: 'Match', boxes: 'Fill in', tape: 'Pairs' };

export function renderHome(mount, exercises) {
  mount.append(
    el('div', { class: 'home-intro' }, [
      el('h1', { text: 'Choose an exercise' }),
      el('p', { text: 'Tap a card and match the words with the pictures!' }),
    ])
  );

  if (!exercises.length) {
    mount.append(
      el('div', {
        class: 'message',
        html: 'No exercises yet. Add a folder under <code>exercises/</code> with a <code>game.json</code> and some images, then run <code>npm run build</code>.',
      })
    );
    return;
  }

  const grid = el('div', { class: 'cards-grid' });
  for (const ex of exercises) {
    const card = el('button', {
      class: 'exercise-card',
      attrs: { type: 'button' },
      on: { click: () => { location.hash = `#/exercise/${ex.id}`; } },
    }, [
      el('div', { class: 'emoji', text: ex.emoji || '📚' }),
      el('div', { class: 'title', text: ex.title }),
      el('div', { class: `badge ${ex.type}`, text: TYPE_LABEL[ex.type] || ex.type }),
      el('div', { class: 'count', text: `${ex.items.length} words` }),
    ]);
    // "Sans faute" star when the exercise was once completed with zero mistakes
    if (getBestMistakes(ex.id) === 0) {
      card.append(el('span', { class: 'perfect', text: '⭐ Sans faute' }));
    }
    grid.append(card);
  }
  mount.append(grid);
}
