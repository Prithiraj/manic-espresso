import './styles.css';
import './why-slice.css';
import './menu-slice.css';
import './cafe-slice.css';
import './review-slice.css';
import './gallery-slice.css';
import './visit-slice.css';
import './final-slice.css';
import { initHeroScene } from './hero-scene.js';
import { initWhyScene } from './why-scene.js';
import { initMenuScene } from './menu-scene.js';
import { initCafeScene } from './cafe-scene.js';
import { initReviewScene } from './review-scene.js';
import { initGalleryScene } from './gallery-scene.js';
import { initVisitScene } from './visit-scene.js';
import { initFinalScene } from './final-scene.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const sync = () => header.classList.toggle('is-scrolled', window.scrollY > 18);
  sync();
  window.addEventListener('scroll', sync, { passive: true });
}

function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const host = document.querySelector('[data-hero-stage]');
  const dispose = initHeroScene(canvas, host);
  if (!dispose && !document.documentElement.dataset.v3Model) {
    document.documentElement.dataset.v3Model = 'fallback';
  }
}

function initWhy() {
  const grid = document.querySelector('.why-grid');
  if (!grid || !grid.parentElement) {
    document.documentElement.dataset.v3WhyModel = 'fallback';
    return;
  }

  const stage = document.createElement('div');
  stage.className = 'why-stage';
  stage.dataset.whyStage = '';
  grid.parentElement.insertBefore(stage, grid);
  stage.append(grid);

  const keys = ['plate', 'welcome', 'find'];
  [...grid.querySelectorAll('article')].forEach((card, index) => {
    card.dataset.whyCard = keys[index] || `card-${index}`;
  });

  const canvas = document.createElement('canvas');
  canvas.id = 'why-canvas';
  canvas.className = 'why-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  stage.prepend(canvas);

  const fallback = document.createElement('p');
  fallback.className = 'why-fallback-note';
  fallback.textContent = '3D still lifes unavailable — the evidence-backed Why Manic copy remains fully usable.';
  stage.append(fallback);

  const dispose = initWhyScene(canvas, stage);
  if (!dispose && !document.documentElement.dataset.v3WhyModel) {
    stage.classList.add('why-model-failed');
    document.documentElement.dataset.v3WhyModel = 'fallback';
  }
}

function initMenu() {
  const canvas = document.getElementById('menu-canvas');
  const host = document.querySelector('[data-menu-stage]');
  const dispose = initMenuScene(canvas, host);
  if (!dispose && !document.documentElement.dataset.v3MenuModel) {
    document.documentElement.dataset.v3MenuModel = 'fallback';
  }
}

function initCafe() {
  const host = document.querySelector('.place-photos');
  if (!host) {
    document.documentElement.dataset.v3CafeModel = 'fallback';
    return;
  }

  host.classList.add('cafe-stage');
  host.dataset.cafeStage = '';

  const canvas = document.createElement('canvas');
  canvas.id = 'cafe-canvas';
  canvas.className = 'cafe-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);

  const label = document.createElement('div');
  label.className = 'cafe-label';
  label.setAttribute('aria-hidden', 'true');
  label.innerHTML = '<span>BLENDER</span><span>SLICE 03</span>';
  host.append(label);

  const fallback = document.createElement('p');
  fallback.className = 'cafe-fallback-note';
  fallback.textContent = '3D miniature unavailable — real Manic exterior and interior photography remains visible.';
  host.append(fallback);

  const dispose = initCafeScene(canvas, host);
  if (!dispose && !document.documentElement.dataset.v3CafeModel) {
    host.classList.add('cafe-model-failed');
    document.documentElement.dataset.v3CafeModel = 'fallback';
  }
}

function initReview() {
  const canvas = document.getElementById('review-canvas');
  const host = document.querySelector('[data-review-stage]');
  const dispose = initReviewScene(canvas, host);
  if (!dispose && !document.documentElement.dataset.v3ReviewModel) {
    host?.classList.add('review-model-failed');
    document.documentElement.dataset.v3ReviewModel = 'fallback';
  }
}

function initGallery() {
  const canvas = document.getElementById('gallery-canvas');
  const host = document.querySelector('[data-gallery-stage]');
  const dispose = initGalleryScene(canvas, host);
  if (!dispose && !document.documentElement.dataset.v3GalleryModel) {
    host?.classList.add('gallery-model-failed');
    document.documentElement.dataset.v3GalleryModel = 'fallback';
  }
}

function initVisit() {
  const canvas = document.getElementById('visit-canvas');
  const host = document.querySelector('[data-visit-stage]');
  const dispose = initVisitScene(canvas, host);
  if (!dispose && !document.documentElement.dataset.v3VisitModel) {
    host?.classList.add('visit-model-failed');
    document.documentElement.dataset.v3VisitModel = 'fallback';
  }
}

function initFinal() {
  const canvas = document.getElementById('final-canvas');
  const host = document.querySelector('[data-final-stage]');
  const dispose = initFinalScene(canvas, host);
  if (!dispose && !document.documentElement.dataset.v3FinalModel) {
    host?.classList.add('final-model-failed');
    document.documentElement.dataset.v3FinalModel = 'fallback';
  }
}

async function markReady() {
  const heroImages = [...document.querySelectorAll('.hero img')];
  await Promise.all(heroImages.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));

  const start = performance.now();
  while (!document.documentElement.dataset.v3Model && performance.now() - start < 12000) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  document.documentElement.dataset.v3Ready = 'true';
  document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'normal';
}

initHeader();
initHero();
initWhy();
initMenu();
initCafe();
initReview();
initGallery();
initVisit();
initFinal();
markReady();
