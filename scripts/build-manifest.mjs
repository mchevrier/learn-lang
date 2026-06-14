#!/usr/bin/env node
/**
 * build-manifest.mjs
 * ------------------
 * Scans the /exercises folder and produces /exercises.json — the index the
 * static app reads at runtime (GitHub Pages can't list folders by itself).
 *
 * For each subfolder of /exercises:
 *   - reads game.json   -> { title, type, emoji?, extraWords? }
 *   - lists image files -> each becomes an item whose `word` is derived
 *                          from the filename.
 *
 * No npm dependencies — just Node's built-in fs/path.
 *
 * Run with:  npm run build   (or  node scripts/build-manifest.mjs)
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EXERCISES_DIR = join(ROOT, 'exercises');
const OUTPUT = join(ROOT, 'exercises.json');

const IMAGE_EXT = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const VALID_TYPES = new Set(['link', 'boxes', 'tape']);

/** Turn a filename into the word to guess: "red-panda.jpg" -> "red panda". */
function wordFromFilename(file) {
  return basename(file, extname(file))
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

function readGameConfig(folder) {
  const cfgPath = join(folder, 'game.json');
  try {
    return JSON.parse(readFileSync(cfgPath, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw new Error(`Invalid game.json in ${folder}: ${err.message}`);
  }
}

function buildExercise(id, folder) {
  const cfg = readGameConfig(folder);
  if (!cfg) {
    console.warn(`  ⚠  skipping "${id}" — no game.json found`);
    return null;
  }

  const type = (cfg.type || 'link').toLowerCase();
  if (!VALID_TYPES.has(type)) {
    console.warn(`  ⚠  skipping "${id}" — unknown type "${cfg.type}" (use "link", "boxes" or "tape")`);
    return null;
  }

  const items = readdirSync(folder)
    .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => ({
      word: wordFromFilename(f),
      image: `exercises/${id}/${f}`,
    }));

  if (items.length === 0) {
    console.warn(`  ⚠  skipping "${id}" — no images found`);
    return null;
  }

  const exercise = {
    id,
    title: cfg.title || id,
    type,
    items,
  };
  if (cfg.emoji) exercise.emoji = cfg.emoji;
  if (Array.isArray(cfg.extraWords) && cfg.extraWords.length) {
    exercise.extraWords = cfg.extraWords.map((w) => String(w).trim()).filter(Boolean);
  }
  return exercise;
}

function main() {
  if (!isDir(EXERCISES_DIR)) {
    console.error(`No "exercises" folder found at ${EXERCISES_DIR}`);
    writeFileSync(OUTPUT, JSON.stringify({ exercises: [] }, null, 2));
    return;
  }

  console.log('Building exercises.json …');
  const folders = readdirSync(EXERCISES_DIR)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => isDir(join(EXERCISES_DIR, name)))
    .sort((a, b) => a.localeCompare(b));

  const exercises = [];
  for (const id of folders) {
    const ex = buildExercise(id, join(EXERCISES_DIR, id));
    if (ex) {
      exercises.push(ex);
      console.log(`  ✓ ${id} (${ex.type}, ${ex.items.length} items)`);
    }
  }

  const manifest = { generatedAt: new Date().toISOString(), exercises };
  writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Done — ${exercises.length} exercise(s) written to exercises.json`);
}

main();
