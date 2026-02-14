// ===== INTERSECTION OBSERVER =====
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

// ===== THEME TOGGLE =====
const toggle = document.getElementById('theme-toggle');
const html = document.documentElement;

const saved = localStorage.getItem('theme');
if (saved) html.setAttribute('data-theme', saved);

toggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ===== SHELF TABS =====
document.querySelectorAll('.shelf-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.shelf-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.shelf-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`${target}-panel`).classList.add('active');
  });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== NAV SCROLLSPY =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const spyObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-20% 0px -60% 0px' });

sections.forEach(s => spyObs.observe(s));

// ===== PAGE TRANSITIONS =====
document.querySelectorAll('a.page-link').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('#') || link.target === '_blank') return;
    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => { window.location.href = href; }, 250);
  });
});

// ===== BFCACHE FIX =====
// Handle back/forward cache restoration
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    // Page was restored from bfcache, reset state
    document.body.classList.remove('page-exit');
    document.body.style.animation = 'none';
    void document.body.offsetHeight; // Trigger reflow
    document.body.style.animation = '';
  }
});
