#!/usr/bin/env node
/* Writes lessons/<id>.json from lessons/lessons.bundle.js.
   Run after editing the bundle:   node tools/build-lessons.js   */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const bundlePath = path.join(root, 'lessons', 'lessons.bundle.js');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(bundlePath, 'utf8'), sandbox);

const lessons = sandbox.window.MTD_LESSONS || {};
let n = 0;
for (const [id, lesson] of Object.entries(lessons)) {
  fs.writeFileSync(path.join(root, 'lessons', `${id}.json`), JSON.stringify(lesson, null, 2) + '\n');
  n++;
}
console.log(`Wrote ${n} lesson files to lessons/`);
