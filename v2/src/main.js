import './styles.css';
import { initCeramicScene } from './scene.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHeader() {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');

  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initReveals() {
  const elements = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });

  elements.forEach((element) => observer.observe(element));
}

function initOpeningStatus() {
  const status = document.getElementById('open-status');
  if (!status) return;

  try {
    const parts = new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Perth',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date()).reduce((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});

    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const now = Number(parts.hour) * 60 + Number(parts.minute);
    const opens = weekday === 0 ? 8 * 60 : 7 * 60;
    const closes = 14 * 60;

    if (now >= opens && now < closes) {
      status.textContent = 'Open now · until 2pm';
    } else if (now < opens) {
      status.textContent = `Opens today · ${weekday === 0 ? '8am' : '7am'}`;
    } else {
      status.textContent = `Closed now · ${weekday === 6 ? 'Sun 8am' : 'tomorrow 7am'}`;
    }
  } catch {
    status.textContent = 'Open 7 days';
  }
}

function initImageDiagnostics() {
  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.closest('figure')?.classList.add('image-missing');
      console.warn('Image failed to load:', image.currentSrc || image.src);
    }, { once: true });
  });
}

function initScene() {
  const canvas = document.getElementById('scene-canvas');
  const host = document.querySelector('[data-hero-art]');
  if (!canvas || !host) {
    document.documentElement.dataset.sceneReady = 'fallback';
    return;
  }

  const dispose = initCeramicScene(canvas, host);
  if (!dispose) document.documentElement.dataset.sceneReady = 'fallback';
}

async function markReady() {
  const images = [...document.querySelectorAll('.hero img')];
  await Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));
  document.documentElement.dataset.siteReady = 'true';
}

initHeader();
initReveals();
initOpeningStatus();
initImageDiagnostics();
initScene();
markReady();
