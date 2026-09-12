/* ============================================================
   Foundation Release 1 preview mount (P5)

   The development/teacher-facing surface for browsing and playing the
   schema-v1 corpus WITHOUT OBS — mounted from preview.html. Uses the
   real catalog/adapter/player/resolver/composer; nothing here is a
   second implementation of any of them.
   ============================================================ */

import { el, clear } from '../utils/dom.js';
import { buildCatalog, getExperience, makeFetchReader, CatalogError } from './catalog.js';
import { adaptExperience } from './adapter.js';
import { createPlayer, UnknownStageError } from './player.js';
import { renderExperience } from './render-experience.js';

export async function mountFoundationPreview(root, { manifestUrl = 'lessons/foundation-release-1/manifest.json' } = {}) {
  const res = await fetch(manifestUrl);
  if (!res.ok) throw new CatalogError(`Could not load manifest at "${manifestUrl}" (HTTP ${res.status}).`);
  const manifest = await res.json();
  const catalog = buildCatalog(manifest);
  const readLesson = makeFetchReader();

  let player = null;

  const unitSelect = el('select', { class: 'fr1-picker__unit' },
    catalog.listUnits().map((u) => el('option', { value: u }, u)));
  const lessonSelect = el('select', { class: 'fr1-picker__lesson' });
  const status = el('div', { class: 'fr1-picker__status' });
  const stageNav = el('div', { class: 'fr1-nav' });
  const mount = el('div', { class: 'fr1-mount' });

  function populateLessons(unitId) {
    clear(lessonSelect);
    catalog.listByUnit(unitId).forEach((e) => lessonSelect.appendChild(el('option', { value: e.id }, `${e.id} — ${e.title} (${e.type})`)));
  }

  async function load(id) {
    status.textContent = '';
    try {
      const lesson = await getExperience(id, { catalog, readLesson });
      const experience = adaptExperience(lesson);
      player = createPlayer(experience);
      renderCurrent();
    } catch (err) {
      player = null;
      status.textContent = `Failed to load "${id}": ${err.message}`;
      clear(mount);
      clear(stageNav);
    }
  }

  function renderCurrent() {
    clear(mount);
    if (!player) return;
    mount.appendChild(renderExperience(player));
    renderNav();
  }

  function renderNav() {
    clear(stageNav);
    if (!player) return;
    if (player.kind === 'teaching') {
      stageNav.appendChild(el('button', { class: 'btn', disabled: player.atStart(), onclick: () => { player.previous(); renderCurrent(); } }, '← Previous stage'));
      stageNav.appendChild(el('button', { class: 'btn btn--primary', disabled: player.atEnd(), onclick: () => { player.next(); renderCurrent(); } }, 'Next stage →'));
      stageNav.appendChild(el('button', { class: 'btn', onclick: () => { player.reset(); renderCurrent(); } }, 'Reset'));
      stageNav.appendChild(el('button', {
        class: `btn${player.isRevealed() ? ' is-on' : ''}`,
        onclick: () => { player.isRevealed() ? player.hideAnswer() : player.revealAnswer(); renderCurrent(); },
      }, player.isRevealed() ? 'Hide result' : 'Reveal result'));
      player.order.forEach((stageId) => {
        stageNav.appendChild(el('button', {
          class: `btn${player.currentIndex() === player.order.indexOf(stageId) ? ' is-on' : ''}`,
          onclick: () => { try { player.goTo(stageId); renderCurrent(); } catch (e) { if (e instanceof UnknownStageError) status.textContent = e.message; } },
        }, stageId));
      });
    } else if (player.kind === 'mastery-check') {
      stageNav.appendChild(el('button', { class: 'btn', disabled: player.atStart(), onclick: () => { player.previous(); renderCurrent(); } }, '← Previous task'));
      stageNav.appendChild(el('button', { class: 'btn btn--primary', disabled: player.atEnd(), onclick: () => { player.next(); renderCurrent(); } }, 'Next task →'));
      stageNav.appendChild(el('button', { class: 'btn', onclick: () => { player.reset(); renderCurrent(); } }, 'Reset'));
    } else if (player.kind === 'review') {
      stageNav.appendChild(el('button', {
        class: `btn${player.isRevealed() ? ' is-on' : ''}`,
        onclick: () => { player.isRevealed() ? player.reset() : player.revealRetrieves(); renderCurrent(); },
      }, player.isRevealed() ? 'Hide retrieves' : 'Show retrieves'));
    }
  }

  unitSelect.addEventListener('change', () => { populateLessons(unitSelect.value); load(lessonSelect.value); });
  lessonSelect.addEventListener('change', () => load(lessonSelect.value));

  populateLessons(unitSelect.value);

  clear(root).appendChild(el('div', { class: 'fr1-panel' },
    el('div', { class: 'fr1-picker' },
      el('label', {}, 'Unit ', unitSelect),
      el('label', {}, 'Experience ', lessonSelect),
    ),
    status,
    mount,
    stageNav,
  ));

  await load(lessonSelect.value);

  return {
    getPlayer: () => player,
    loadExperience: load,
    catalog,
  };
}
