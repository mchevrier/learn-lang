#!/usr/bin/env node
/**
 * gen-sample-images.mjs
 * ---------------------
 * Generates the sample workshops ("ateliers") used out of the box. Each item
 * image is a lightweight SVG card (soft gradient + a big emoji) named by its
 * word — crisp at any size, tiny, no copyright. Replace any file with a real
 * photo whenever you like (keep the filename equal to the word).
 *
 * Folder layout it writes:
 *   exercises/<atelier>/atelier.json          (title + tagline)
 *   exercises/<atelier>/<exercise>/game.json  (title + type + emoji)
 *   exercises/<atelier>/<exercise>/<word>.svg
 *
 * Run:  node scripts/gen-sample-images.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const PALETTES = [
  ['#e9f7ef', '#bfe9d0'], ['#eaf4ff', '#c5e1ff'], ['#fff3e0', '#ffe0b2'],
  ['#fdeef4', '#fbcfe0'], ['#f3effc', '#ddccf5'], ['#fffbe6', '#ffeeaa'],
  ['#e6fbfa', '#bdeeeb'], ['#fdeaea', '#f8c9c9'],
];

function card(emoji, idx) {
  const [a, b] = PALETTES[idx % PALETTES.length];
  const gid = `g${idx}`;
  // shrink the glyph when the "emoji" is actually several emojis (e.g. 👵👴)
  const glyphs = [...emoji].filter((c) => c.codePointAt(0) > 0x2000).length || 1;
  const fontSize = glyphs > 1 ? 150 : 220;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="400" height="400" rx="40" fill="url(#${gid})"/>
  <text x="200" y="215" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">${emoji}</text>
</svg>
`;
}

const ATELIERS = [
  {
    id: 'atelier-1',
    info: { title: 'Atelier 1', tagline: 'At home: meet the family and learn your first polite words!', order: 1 },
    exercises: {
      family: {
        game: { title: 'Family', type: 'tape', emoji: '👪' },
        items: { mother: '👩', father: '👨', sister: '👧', brother: '👦', grandmother: '👵', grandfather: '👴', baby: '👶', grandparents: '👵👴' },
      },
      greetings: {
        // a "dialogue" exercise has no images — just a scripted conversation
        game: {
          title: 'Saying hello',
          type: 'dialogue',
          emoji: '💬',
          speakers: { a: '🧒', b: '🧑' },
          lines: [
            { who: 'a', text: 'Hello!' },
            { who: 'b', text: 'Hi! How are you?' },
            { who: 'a', text: 'I am fine, thank you. How about you?' },
            { who: 'b', text: 'Very well, thank you!' },
            { who: 'a', text: 'Goodbye!' },
            { who: 'b', text: 'Bye! Have a nice day!' },
          ],
        },
      },
    },
  },
  {
    id: 'atelier-2',
    info: { title: 'Atelier 2', tagline: 'Tasty food — match the fruits and the vegetables!', order: 2 },
    exercises: {
      fruits: {
        game: { title: 'Fruits', type: 'tape', emoji: '🍓' },
        items: { apple: '🍎', banana: '🍌', strawberry: '🍓', grapes: '🍇', orange: '🍊', watermelon: '🍉' },
      },
      vegetables: {
        game: { title: 'Vegetables', type: 'boxes', emoji: '🥕' },
        items: { carrot: '🥕', tomato: '🍅', broccoli: '🥦', potato: '🥔', corn: '🌽', onion: '🧅' },
      },
    },
  },
  {
    id: 'atelier-3',
    info: { title: 'Atelier 3', tagline: 'Animals everywhere — pets at home and animals in the wild!', order: 3 },
    exercises: {
      pets: {
        game: { title: 'Pets', type: 'boxes', emoji: '🐶' },
        items: { dog: '🐶', cat: '🐱', rabbit: '🐰', hamster: '🐹', fish: '🐠', bird: '🐦' },
      },
      'wild-animals': {
        game: { title: 'Wild animals', type: 'link', emoji: '🦁' },
        items: { gorilla: '🦍', fox: '🦊', frog: '🐸', wolf: '🐺', owl: '🦉', snake: '🐍' },
      },
    },
  },
];

let n = 0;
for (const atelier of ATELIERS) {
  const adir = join(ROOT, 'exercises', atelier.id);
  mkdirSync(adir, { recursive: true });
  writeFileSync(join(adir, 'atelier.json'), JSON.stringify(atelier.info, null, 2) + '\n');
  for (const [exId, def] of Object.entries(atelier.exercises)) {
    const dir = join(adir, exId);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'game.json'), JSON.stringify(def.game, null, 2) + '\n');
    if (def.items) {
      for (const [word, emoji] of Object.entries(def.items)) {
        writeFileSync(join(dir, `${word}.svg`), card(emoji, n++));
      }
      console.log(`✓ ${atelier.id}/${exId}: ${Object.keys(def.items).length} images`);
    } else {
      console.log(`✓ ${atelier.id}/${exId}: game.json only (no images)`);
    }
  }
}
console.log('Sample workshops generated.');
