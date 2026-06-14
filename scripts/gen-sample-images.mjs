#!/usr/bin/env node
/**
 * gen-sample-images.mjs
 * ---------------------
 * Generates the lightweight SVG "photo" cards used by the two DEFAULT exercises
 * (animals, vegetables). Each card is a soft gradient rounded square with a big
 * emoji — crisp at any size, tiny, no copyright. Replace these files with real
 * photos whenever you like (keep the filename = the word to guess).
 *
 * Run:  node scripts/gen-sample-images.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// A handful of friendly gradient pairs (top, bottom) to vary the cards.
const PALETTES = [
  ['#e9f7ef', '#bfe9d0'],
  ['#eaf4ff', '#c5e1ff'],
  ['#fff3e0', '#ffe0b2'],
  ['#fdeef4', '#fbcfe0'],
  ['#f3effc', '#ddccf5'],
  ['#fffbe6', '#ffeeaa'],
  ['#e6fbfa', '#bdeeeb'],
  ['#fdeaea', '#f8c9c9'],
];

function card(emoji, idx) {
  const [a, b] = PALETTES[idx % PALETTES.length];
  const gid = `g${idx}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="400" height="400" rx="40" fill="url(#${gid})"/>
  <text x="200" y="215" font-size="220" text-anchor="middle" dominant-baseline="central">${emoji}</text>
</svg>
`;
}

const EXERCISES = {
  animals: {
    game: { title: 'Animals', type: 'link', emoji: '🦍' },
    items: {
      gorilla: '🦍',
      fox: '🦊',
      frog: '🐸',
      wolf: '🐺',
      owl: '🦉',
      snake: '🐍',
    },
  },
  vegetables: {
    game: {
      title: 'Vegetables',
      type: 'boxes',
      emoji: '🥕',
    },
    items: {
      carrot: '🥕',
      tomato: '🍅',
      broccoli: '🥦',
      potato: '🥔',
      corn: '🌽',
      onion: '🧅',
    },
  },
  fruits: {
    game: { title: 'Fruits', type: 'tape', emoji: '🍓' },
    items: {
      apple: '🍎',
      banana: '🍌',
      strawberry: '🍓',
      grapes: '🍇',
      orange: '🍊',
      watermelon: '🍉',
    },
  },
};

let n = 0;
for (const [id, def] of Object.entries(EXERCISES)) {
  const dir = join(ROOT, 'exercises', id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'game.json'), JSON.stringify(def.game, null, 2) + '\n');
  for (const [word, emoji] of Object.entries(def.items)) {
    writeFileSync(join(dir, `${word}.svg`), card(emoji, n++));
  }
  console.log(`✓ ${id}: ${Object.keys(def.items).length} images + game.json`);
}
console.log('Sample images generated.');
