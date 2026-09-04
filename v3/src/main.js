import './styles.css';
import { initHeroScene } from './hero-scene.js';

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
markReady();
