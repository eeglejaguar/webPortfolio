import { projects, categories } from '../data/projects.js';
import { mountArt } from './art.js';
import { bindTilt, initMagnetic } from './cursor.js';
import { unlock } from './achievements.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const arrow = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;

let reduced = false;
let current = -1;
let unmountModalArt = () => {};
const viewed = new Set();

export function initProjects(isReduced) {
  reduced = isReduced;
  const grid = document.getElementById('projects');
  const filters = document.getElementById('filters');

  filters.innerHTML = categories
    .map((c) => {
      const n = c.id === 'all' ? projects.length : projects.filter((p) => p.category === c.id).length;
      if (!n) return '';
      return `<button class="chip-btn${c.id === 'all' ? ' is-active' : ''}" role="tab" data-filter="${c.id}" data-magnetic>${esc(c.label)} <sup>${n}</sup></button>`;
    })
    .join('');

  grid.innerHTML = projects
    .map(
      (p, i) => `
    <button class="card${p.featured ? ' is-featured' : ''} reveal" data-index="${i}" data-cat="${p.category}" style="--acc:${p.accent}" aria-label="Open ${esc(p.title)} case study">
      <div class="card__art">
        <canvas></canvas>
        <div class="card__window">
          <div class="card__window-title">${esc(p.title)}</div>
          <div class="card__window-sub">${esc(p.stack.slice(0, 4).join(' · '))}</div>
        </div>
      </div>
      <span class="card__arrow">${arrow}</span>
      <div class="card__glare"></div>
      <div class="card__body">
        <div class="card__meta"><span>${String(i + 1).padStart(2, '0')} / ${esc(p.category)}</span><span>${esc(p.year)}</span></div>
        <h3 class="card__title">${esc(p.title)}</h3>
        <p class="card__sub">${esc(p.subtitle)}</p>
        <div class="card__tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      </div>
    </button>`,
    )
    .join('');

  grid.querySelectorAll('.card').forEach((card) => {
    const p = projects[card.dataset.index];
    mountArt(card.querySelector('canvas'), p.art, p.accent, reduced);
    bindTilt(card, 8);
    card.addEventListener('click', () => openModal(+card.dataset.index));
  });

  filters.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filters.querySelectorAll('.chip-btn').forEach((x) => x.classList.toggle('is-active', x === b));
    applyFilter(b.dataset.filter);
  });

  // modal wiring
  const modal = document.getElementById('modal');
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
    const nav = e.target.closest('[data-step]');
    if (nav) openModal((current + +nav.dataset.step + projects.length) % projects.length);
  });
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') openModal((current + 1) % projects.length);
    if (e.key === 'ArrowLeft') openModal((current - 1 + projects.length) % projects.length);
  });
}

export function applyFilter(cat) {
  document.querySelectorAll('#projects .card').forEach((card, i) => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.classList.toggle('is-hidden', !show);
    card.classList.remove('is-entering');
    if (show) {
      void card.offsetWidth;
      card.style.animationDelay = `${i * 40}ms`;
      card.classList.add('is-entering');
    }
  });
}

export function openModal(i) {
  const p = projects[i];
  if (!p) return;
  current = i;
  const modal = document.getElementById('modal');
  const panel = document.getElementById('modalPanel');
  panel.style.setProperty('--acc', p.accent);
  unmountModalArt();
  panel.innerHTML = `
    <div class="modal__hero">
      <canvas></canvas>
      <h3 id="modalTitle">${esc(p.title)}</h3>
    </div>
    <button class="chip-btn modal__close" data-close aria-label="Close">✕ esc</button>
    <div class="modal__content">
      <div>
        <h4>${esc(p.subtitle)} · ${esc(p.year)}</h4>
        <p>${esc(p.summary)}</p>
      </div>
      <div>
        <h4>Highlights</h4>
        <ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      </div>
      <div>
        <h4>Stack</h4>
        <div class="modal__stack">${p.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div>
      </div>
      <div class="modal__actions">
        ${p.live ? `<a class="btn btn--primary" href="${esc(p.live)}" target="_blank" rel="noopener" data-magnetic data-cursor="visit">Live site ${arrow}</a>` : ''}
        ${p.repo ? `<a class="btn" href="${esc(p.repo)}" target="_blank" rel="noopener" data-magnetic data-cursor="code">Source code ${arrow}</a>` : ''}
      </div>
      <div class="modal__nav mono">
        <button class="chip-btn" data-step="-1">← prev</button>
        <span class="dim">${i + 1} / ${projects.length}</span>
        <button class="chip-btn" data-step="1">next →</button>
      </div>
    </div>`;
  unmountModalArt = mountArt(panel.querySelector('canvas'), p.art, p.accent, reduced);
  initMagnetic(panel);
  panel.scrollTop = 0;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  panel.querySelector('.modal__close').focus({ preventScroll: true });

  viewed.add(p.id);
  unlock('case');
  if (viewed.size >= 3) unlock('binge');
}

export function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  unmountModalArt();
  unmountModalArt = () => {};
  const card = document.querySelector(`#projects .card[data-index="${current}"]`);
  card?.focus({ preventScroll: true });
}
