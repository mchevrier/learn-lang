#!/usr/bin/env node
/**
 * build-manifest.mjs
 * ------------------
 * Scans /exercises and produces /exercises.json — the index the static app
 * reads at runtime (GitHub Pages can't list folders by itself).
 *
 * Two-level layout:
 *   exercises/<atelier>/atelier.json          -> { title, tagline, order? }
 *   exercises/<atelier>/<exercise>/game.json  -> { title, type, emoji?, extraWords? }
 *   exercises/<atelier>/<exercise>/<word>.<img>
 *
 * Each image filename becomes the word to guess ("red-panda.jpg" -> "red panda").
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
const VALID_TYPES = new Set(['link', 'boxes', 'tape', 'dialogue']);

/** Turn a filename into the word to guess: "red-panda.jpg" -> "red panda". */
function wordFromFilename(file) {
  return basename(file, extname(file)).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (err) {
    if (err.code === 'ENOENT') return null;
    throw new Error(`Invalid JSON in ${file}: ${err.message}`);
  }
}

function subDirs(dir) {
  return readdirSync(dir)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => isDir(join(dir, name)))
    .sort((a, b) => a.localeCompare(b));
}

function buildExercise(atelierId, exId, folder) {
  const cfg = readJson(join(folder, 'game.json'));
  if (!cfg) return null; // not an exercise (no game.json)

  const type = (cfg.type || 'link').toLowerCase();
  if (!VALID_TYPES.has(type)) {
    console.warn(`  ⚠  skipping "${atelierId}/${exId}" — unknown type "${cfg.type}" (use "link", "boxes", "tape" or "dialogue")`);
    return null;
  }

  // "dialogue" is script-based (no images): read the conversation from game.json
  if (type === 'dialogue') {
    const lines = Array.isArray(cfg.lines) ? cfg.lines.filter((l) => l && l.text) : [];
    if (lines.length === 0) {
      console.warn(`  ⚠  skipping "${atelierId}/${exId}" — dialogue has no lines`);
      return null;
    }
    const exercise = {
      id: `${atelierId}/${exId}`,
      title: cfg.title || exId,
      type,
      speakers: cfg.speakers && typeof cfg.speakers === 'object' ? cfg.speakers : { a: '🙂', b: '🙃' },
      lines: lines.map((l) => ({ who: l.who === 'b' ? 'b' : 'a', text: String(l.text) })),
    };
    if (cfg.emoji) exercise.emoji = cfg.emoji;
    return exercise;
  }

  const items = readdirSync(folder)
    .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => ({ word: wordFromFilename(f), image: `exercises/${atelierId}/${exId}/${f}` }));

  if (items.length === 0) {
    console.warn(`  ⚠  skipping "${atelierId}/${exId}" — no images found`);
    return null;
  }

  const exercise = { id: `${atelierId}/${exId}`, title: cfg.title || exId, type, items };
  if (cfg.emoji) exercise.emoji = cfg.emoji;
  if (Array.isArray(cfg.extraWords) && cfg.extraWords.length) {
    exercise.extraWords = cfg.extraWords.map((w) => String(w).trim()).filter(Boolean);
  }
  return exercise;
}

function buildAtelier(id, folder) {
  const info = readJson(join(folder, 'atelier.json')) || {};
  const exercises = [];
  for (const exId of subDirs(folder)) {
    const ex = buildExercise(id, exId, join(folder, exId));
    if (ex) {
      exercises.push(ex);
      const n = ex.items ? `${ex.items.length} items` : `${ex.lines.length} lines`;
      console.log(`  ✓ ${id}/${exId} (${ex.type}, ${n})`);
    }
  }
  if (exercises.length === 0) {
    console.warn(`  ⚠  skipping atelier "${id}" — no exercises inside`);
    return null;
  }
  return {
    id,
    title: info.title || id,
    tagline: info.tagline || '',
    order: typeof info.order === 'number' ? info.order : Number.POSITIVE_INFINITY,
    exercises,
  };
}

function main() {
  if (!isDir(EXERCISES_DIR)) {
    console.error(`No "exercises" folder found at ${EXERCISES_DIR}`);
    writeFileSync(OUTPUT, JSON.stringify({ ateliers: [] }, null, 2));
    return;
  }

  console.log('Building exercises.json …');
  const ateliers = [];
  for (const id of subDirs(EXERCISES_DIR)) {
    const a = buildAtelier(id, join(EXERCISES_DIR, id));
    if (a) ateliers.push(a);
  }
  ateliers.sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));

  const manifest = { generatedAt: new Date().toISOString(), ateliers };
  writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2) + '\n');
  const exCount = ateliers.reduce((n, a) => n + a.exercises.length, 0);
  console.log(`Done — ${ateliers.length} atelier(s), ${exCount} exercise(s) written to exercises.json`);
}

main();
