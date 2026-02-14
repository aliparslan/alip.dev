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
