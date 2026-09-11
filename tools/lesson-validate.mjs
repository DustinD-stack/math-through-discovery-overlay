#!/usr/bin/env node
/* ============================================================
   Lesson schema V1 validator — CLI

   Walks every lessons/foundation-release-1/ subdirectory for .json
   files (skipping _template and any generated manifest), loads each
   file, and reports every
   validation problem across every file in one pass.

     node tools/lesson-validate.mjs
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCorpus } from '../src/curriculum/loader.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = path.join(root, 'lessons', 'foundation-release-1');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue; // _template, any future _drafts, etc.
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'manifest.json') out.push(full);
  }
  return out;
}

const files = walk(releaseDir).sort();
const entries = files.map((file) => {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  try {
    return { file: rel, raw: JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch (e) {
    return { file: rel, raw: { __parseError: e.message } };
  }
});

// Surface JSON parse errors as validation errors too, rather than crashing.
const parseErrors = entries
  .filter((e) => e.raw && e.raw.__parseError)
  .map((e) => ({ file: e.file, path: '$', reason: `JSON parse error: ${e.raw.__parseError}` }));

const { lessons, errors } = loadCorpus(entries.filter((e) => !(e.raw && e.raw.__parseError)));
const allErrors = [...parseErrors, ...errors];

console.log(`Checked ${entries.length} lesson file(s) under lessons/foundation-release-1/.`);

const hardErrors = allErrors.filter((e) => e.severity !== 'warning');
const warnings = allErrors.filter((e) => e.severity === 'warning');

if (warnings.length) {
  console.warn(`\n${warnings.length} warning(s):\n`);
  for (const e of warnings) console.warn(`  ${e.file}\n    ${e.path}\n    ${e.reason}\n`);
}

if (hardErrors.length) {
  console.error(`\n${hardErrors.length} problem(s):\n`);
  for (const e of hardErrors) {
    console.error(`  ${e.file}\n    ${e.path}\n    ${e.reason}\n`);
  }
  process.exit(1);
}

console.log(`All ${lessons.length} lesson(s) valid under schema version 1.`);
