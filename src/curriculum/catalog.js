/* ============================================================
   Production corpus catalog (P5)

   Discovers the accepted Foundation Release 1 corpus from
   lessons/foundation-release-1/manifest.json — a GENERATED index,
   never a second source of truth (see tools/lesson-index.mjs and
   docs/lesson-authoring/README.md). This module never hand-lists
   lesson ids or units; it only reads what the manifest already says.

   Environment-agnostic: the caller supplies `readLesson(sourceFile)`
   so this same code works from a browser (fetch) or Node (fs) without
   this module knowing which.
   ============================================================ */

import { loadLesson } from './loader.js';

export class CatalogError extends Error {}

/**
 * Build a catalog view over an already-loaded manifest object
 * (the parsed contents of manifest.json). Pure/synchronous — no I/O.
 */
export function buildCatalog(manifest) {
  if (!manifest || !Array.isArray(manifest.lessons)) {
    throw new CatalogError('Malformed manifest: expected a "lessons" array.');
  }
  const byId = new Map(manifest.lessons.map((e) => [e.id, e]));
  if (byId.size !== manifest.lessons.length) {
    throw new CatalogError('Manifest contains duplicate ids — regenerate it with `npm run lessons:index`.');
  }

  const units = [...new Set(manifest.lessons.map((e) => e.unitId))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return {
    generatedAt: manifest.generatedAt,
    schemaVersion: manifest.schemaVersion,
    count: manifest.lessons.length,

    /** All catalog entries (manifest rows), in manifest order. */
    list: () => manifest.lessons.slice(),

    /** Catalog entries for one unit, in accepted sequence order. */
    listByUnit: (unitId) => manifest.lessons
      .filter((e) => e.unitId === unitId)
      .sort((a, b) => (a.sequence ?? Infinity) - (b.sequence ?? Infinity)),

    /** All unit ids present in the corpus, in numeric order. */
    listUnits: () => units.slice(),

    /** The manifest row for one id, or null — never a fuzzy match. */
    getEntry: (id) => byId.get(id) || null,

    has: (id) => byId.has(id),
  };
}

/**
 * Resolve one full, validated, normalized experience by id.
 * Unknown id: throws CatalogError — never silently substitutes another
 * lesson (per P5 Step 3/Catalog Behavior).
 */
export async function getExperience(id, { catalog, readLesson }) {
  const entry = catalog.getEntry(id);
  if (!entry) {
    throw new CatalogError(`Unknown experience id "${id}". No such lesson exists in the Foundation Release 1 catalog.`);
  }
  const raw = await readLesson(entry.sourceFile);
  return loadLesson(raw, entry.sourceFile); // throws LessonValidationError on malformed data
}

/** Node-friendly reader: reads lesson JSON files from disk, relative to `root`. */
export function makeFsReader(root, fs, path) {
  return async (sourceFile) => JSON.parse(fs.readFileSync(path.join(root, sourceFile), 'utf8'));
}

/** Browser-friendly reader: fetches lesson JSON over http(s), same convention
 *  as the legacy loader's over-the-wire fetch (src/utils/lesson-loader.js). */
export function makeFetchReader(base = '') {
  return async (sourceFile) => {
    const res = await fetch(new URL(sourceFile, base || window.location.href));
    if (!res.ok) throw new CatalogError(`Could not fetch "${sourceFile}" (HTTP ${res.status}).`);
    return res.json();
  };
}
