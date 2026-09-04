import './styles.css';
import './mobile-tune.css';
import './scroll-motion.css';
import { initCeramicScene } from './scene.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

function initEditorialScrollMotion() {
  if (reducedMotion || !('requestAnimationFrame' in window)) {
    document.documentElement.dataset.editorialScroll = 'off';
    return;
  }

  document.documentElement.dataset.editorialScroll = 'on';

  const statementCards = [...document.querySelectorAll('.statement-card')];
  const menuRows = [...document.querySelectorAll('.menu-row')];
  const proofItems = [...document.querySelectorAll('.proof-bar > *')];
  const mediaFigures = [
    ...document.querySelectorAll('.place-collage figure'),
    ...document.querySelectorAll('.gallery-grid figure')
  ];
  const reviewBand = document.querySelector('.review-band');
  const finalCta = document.querySelector('.final-cta');

  [...statementCards, ...menuRows].forEach((element) => {
    element.dataset.scrollItem = '';
  });

  const metricsFor = (element) => {
    const rect = element.getBoundingClientRect();
    const viewport = Math.max(window.innerHeight, 1);
    const center = rect.top + rect.height / 2;
    const travel = clamp((viewport / 2 - center) / (viewport / 2 + rect.height / 2), -1, 1);
    const enter = clamp((viewport * 0.92 - rect.top) / Math.max(viewport * 0.42, 1), 0, 1);
    return { rect, travel, enter };
  };

  let raf = 0;

  const update = () => {
    raf = 0;
    if (document.hidden) return;

    statementCards.forEach((element, index) => {
      const { travel, enter } = metricsFor(element);
      const y = (1 - enter) * (28 + index * 7) + travel * 4;
      const rotate = (index - 1) * 0.22 * (1 - enter) + travel * 0.1;
      element.style.setProperty('--scroll-y', `${y.toFixed(2)}px`);
      element.style.setProperty('--scroll-rotate', `${rotate.toFixed(3)}deg`);
      element.style.setProperty('--scroll-scale', (0.985 + enter * 0.015).toFixed(4));
    });

    menuRows.forEach((element, index) => {
      const { travel, enter } = metricsFor(element);
      const x = (1 - enter) * (18 + index * 5);
      const y = travel * 3;
      element.style.setProperty('--scroll-x', `${x.toFixed(2)}px`);
      element.style.setProperty('--scroll-y', `${y.toFixed(2)}px`);
      element.style.setProperty('--scroll-opacity', (0.38 + enter * 0.62).toFixed(3));
    });

    proofItems.forEach((element, index) => {
      const { enter } = metricsFor(element);
      element.style.setProperty('--proof-shift', `${((1 - enter) * (14 + index * 3)).toFixed(2)}px`);
      element.style.setProperty('--proof-opacity', (0.42 + enter * 0.58).toFixed(3));
    });

    mediaFigures.forEach((figure, index) => {
      const { travel } = metricsFor(figure);
      const image = figure.querySelector('img');
      if (!image) return;
      const amount = index < 2 ? 16 + index * 4 : 13 + (index - 2) * 3;
      image.style.setProperty('--media-shift', `${(travel * amount).toFixed(2)}px`);
    });

    const animateBand = (element, strength = 1) => {
      if (!element) return;
      const { travel, enter } = metricsFor(element);
      const headlineShift = (1 - enter) * 20 + travel * 8 * strength;
      const headlineScale = 0.965 + enter * 0.035 - Math.abs(travel) * 0.006 * strength;
      const supportShift = (1 - enter) * 16 + travel * 4 * strength;
      element.style.setProperty('--headline-shift', `${headlineShift.toFixed(2)}px`);
      element.style.setProperty('--headline-scale', headlineScale.toFixed(4));
      element.style.setProperty('--support-shift', `${supportShift.toFixed(2)}px`);
      element.style.setProperty('--support-opacity', (0.46 + enter * 0.54).toFixed(3));
    };

    animateBand(reviewBand, 0.8);
    animateBand(finalCta, 1);
  };

  const requestUpdate = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  document.addEventListener('visibilitychange', requestUpdate);
  update();
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
initEditorialScrollMotion();
initOpeningStatus();
initImageDiagnostics();
initScene();
markReady();
