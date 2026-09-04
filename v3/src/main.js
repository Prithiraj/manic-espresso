import './styles.css';
import './menu-slice.css';
import './cafe-slice.css';
import { initHeroScene } from './hero-scene.js';
import { initMenuScene } from './menu-scene.js';
import { initCafeScene } from './cafe-scene.js';

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
initMenu();
initCafe();
markReady();
