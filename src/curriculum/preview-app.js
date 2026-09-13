/* ============================================================
   Foundation Release 1 preview mount (P5, extended P6)

   The development/teacher-facing surface for browsing and playing the
   schema-v1 corpus WITHOUT OBS — mounted from preview.html. Uses the
   real catalog/adapter/player/resolver/composer; nothing here is a
   second implementation of any of them.

   P6 adds: an aspect selector (16:9 / 9:16 / 1:1) and a presenter
   on/off toggle, both driven through the same `wrapWithPresenter()`
   the live overlay uses, plus a small representation-status readout
   (component / concrete / gap) — so all three new visual capabilities
   and the presenter composition can be inspected without OBS.
   ============================================================ */

import { el, clear } from '../utils/dom.js';
import { buildCatalog, getExperience, makeFetchReader, CatalogError } from './catalog.js';
import { adaptExperience } from './adapter.js';
import { createPlayer, UnknownStageError } from './player.js';
import { renderExperience, wrapWithPresenter } from './render-experience.js';
import { resolveRepresentation } from './representations.js';

const SIZES = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] };
const PREVIEW_SCALE = { '16x9': 0.34, '9x16': 0.26, '1x1': 0.34 };

export async function mountFoundationPreview(root, { manifestUrl = 'lessons/foundation-release-1/manifest.json' } = {}) {
  const res = await fetch(manifestUrl);
  if (!res.ok) throw new CatalogError(`Could not load manifest at "${manifestUrl}" (HTTP ${res.status}).`);
  const manifest = await res.json();
  const catalog = buildCatalog(manifest);
  const readLesson = makeFetchReader();

  let player = null;
  let aspect = '16x9';
  let showPresenter = false;

  const unitSelect = el('select', { class: 'fr1-picker__unit' },
    catalog.listUnits().map((u) => el('option', { value: u }, u)));
  const lessonSelect = el('select', { class: 'fr1-picker__lesson' });
  const aspectSelect = el('select', { class: 'fr1-picker__aspect' },
    Object.keys(SIZES).map((a) => el('option', { value: a, selected: a === aspect }, a)));
  const presenterToggle = el('button', { class: 'btn' }, 'Presenter: off');
  const status = el('div', { class: 'fr1-picker__status' });
  const reprStatus = el('div', { class: 'fr1-repr-status' });
  const stageNav = el('div', { class: 'fr1-nav' });
  const frame = el('div', { class: 'fr1-frame' });
  const mount = el('div', { class: 'stage fr1-preview-stage' });
  frame.appendChild(mount);

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
      clear(reprStatus);
    }
  }

  function sizeFrame() {
    const [w, h] = SIZES[aspect];
    const scale = PREVIEW_SCALE[aspect];
    frame.style.width = `${w * scale}px`;
    frame.style.height = `${h * scale}px`;
    mount.style.width = `${w}px`;
    mount.style.height = `${h}px`;
    mount.style.transform = `scale(${scale})`;
    mount.style.transformOrigin = 'top left';
    mount.className = `stage fr1-preview-stage a${aspect} bg-studio ${showPresenter && aspect !== '1x1' ? 'has-presenter' : 'no-presenter'}`;
  }

  function renderCurrent() {
    clear(mount);
    if (!player) return;
    sizeFrame();
    mount.appendChild(wrapWithPresenter(renderExperience(player), { aspect, showPresenter }));
    renderReprStatus();
    renderNav();
  }

  function renderReprStatus() {
    clear(reprStatus);
    if (!player || player.kind !== 'teaching') return;
    (player.experience.representations || []).forEach((rep) => {
      let resolved;
      try { resolved = resolveRepresentation(rep, { stageId: player.current().id }); } catch (e) { resolved = { status: 'error' }; }
      const active = player.activeRepresentation() === rep;
      reprStatus.appendChild(el('span', { class: `fr1-repr-status__chip is-${resolved.status}${active ? ' is-active' : ''}` },
        `${rep.type} · ${resolved.status}`));
    });
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
      if (player.experience.representations.length > 1) {
        player.experience.representations.forEach((rep) => {
          stageNav.appendChild(el('button', {
            class: `btn${player.activeRepresentation() === rep ? ' is-on' : ''}`,
            onclick: () => { player.selectRepresentation(rep.type); renderCurrent(); },
          }, `Show: ${rep.type}`));
        });
      }
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
  aspectSelect.addEventListener('change', () => { aspect = aspectSelect.value; renderCurrent(); });
  presenterToggle.addEventListener('click', () => {
    showPresenter = !showPresenter;
    presenterToggle.textContent = `Presenter: ${showPresenter ? 'on' : 'off'}`;
    renderCurrent();
  });

  populateLessons(unitSelect.value);

  clear(root).appendChild(el('div', { class: 'fr1-panel' },
    el('div', { class: 'fr1-picker' },
      el('label', {}, 'Unit ', unitSelect),
      el('label', {}, 'Experience ', lessonSelect),
      el('label', {}, 'Aspect ', aspectSelect),
      presenterToggle,
    ),
    status,
    reprStatus,
    frame,
    stageNav,
  ));

  await load(lessonSelect.value);

  return {
    getPlayer: () => player,
    loadExperience: load,
    catalog,
  };
}
