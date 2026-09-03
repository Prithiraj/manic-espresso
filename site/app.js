(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && nav) {
    const closeNav = () => {
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

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeNav();
    });
  }

  const reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  const status = document.getElementById('open-status');
  if (status) {
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Perth', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(now).reduce((acc, part) => ((acc[part.type] = part.value), acc), {});
      const dayIndex = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(parts.weekday);
      const minutes = Number(parts.hour) * 60 + Number(parts.minute);
      const opens = dayIndex === 0 ? 8 * 60 : 7 * 60;
      const closes = 14 * 60;
      if (minutes >= opens && minutes < closes) {
        status.textContent = 'Open now · until 2pm';
      } else if (minutes < opens) {
        status.textContent = `Opens today · ${dayIndex === 0 ? '8am' : '7am'}`;
      } else {
        status.textContent = `Closed now · ${dayIndex === 6 ? 'Sun 8am' : 'tomorrow 7am'}`;
      }
    } catch (_) {
      status.textContent = 'Open 7 days';
    }
  }

  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.alt = `${img.alt} Image temporarily unavailable.`;
      img.style.objectFit = 'contain';
      img.style.padding = '1.25rem';
    }, { once: true });
  });
})();
