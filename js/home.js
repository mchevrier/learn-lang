/* Home screen: workshops ("ateliers"), each with its own grid of exercises. */

import { el, getBestMistakes } from './ui.js';

const TYPE_LABEL = { link: 'Match', boxes: 'Fill in', tape: 'Pairs', dialogue: 'Talk' };

function exerciseCard(ex) {
  const card = el('button', {
    class: 'exercise-card',
    attrs: { type: 'button' },
    on: { click: () => { location.hash = `#/exercise/${ex.id}`; } },
  }, [
    el('div', { class: 'emoji', text: ex.emoji || '📚' }),
    el('div', { class: 'title', text: ex.title }),
    el('div', { class: `badge ${ex.type}`, text: TYPE_LABEL[ex.type] || ex.type }),
    el('div', { class: 'count', text: ex.lines ? `${ex.lines.length} lines` : `${ex.items.length} words` }),
  ]);

  // status pictogram: not done yet / done with N mistakes / flawless medal
  const best = getBestMistakes(ex.id);
  let statusEl;
  if (best == null) {
    statusEl = el('span', { class: 'status todo', text: '📝 À faire' });
  } else if (best === 0) {
    statusEl = el('span', { class: 'status perfect', text: '🥇 Sans faute' });
  } else {
    statusEl = el('span', { class: 'status done', text: `✓ ${best} faute${best > 1 ? 's' : ''}` });
  }
  card.append(statusEl);
  return card;
}

export function renderHome(mount, ateliers) {
  mount.append(
    el('div', { class: 'home-intro' }, [
      el('h1', { text: 'Matilda — English 4 fun!' }),
      el('p', { text: 'Choose a workshop and start playing!' }),
    ])
  );

  if (!ateliers.length) {
    mount.append(
      el('div', {
        class: 'message',
        html: 'No workshops yet. Create <code>exercises/atelier-1/</code> with an <code>atelier.json</code>, add an exercise sub-folder (<code>game.json</code> + images), then run <code>npm run build</code>.',
      })
    );
    return;
  }

  for (const atelier of ateliers) {
    const section = el('section', { class: 'atelier' }, [
      el('div', { class: 'atelier-head' }, [
        el('h2', { class: 'atelier-title', text: atelier.title }),
        atelier.tagline ? el('p', { class: 'atelier-tagline', text: atelier.tagline }) : null,
      ]),
    ]);
    const grid = el('div', { class: 'cards-grid' });
    for (const ex of atelier.exercises) grid.append(exerciseCard(ex));
    section.append(grid);
    mount.append(section);
  }
}
