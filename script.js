// ===== PROJECTS SHEET =====
const sheet = document.getElementById('projects');

document.getElementById('open-projects').addEventListener('click', () => sheet.showModal());
document.getElementById('close-projects').addEventListener('click', () => sheet.close());

// click the backdrop to dismiss
sheet.addEventListener('click', (e) => {
  if (e.target === sheet) sheet.close();
});


/* ============================================================
   DEBUG PANEL — delete this block, the matching markup in
   index.html, and the .debug rules in styles.css before shipping.
   ============================================================ */
(() => {
  const root = document.documentElement;
  const btn = document.getElementById('theme-btn');
  const modes = ['system', 'light', 'dark'];
  let mode = localStorage.getItem('theme') || 'system';

  function apply() {
    if (mode === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    btn.textContent = `theme: ${mode}`;
  }

  btn.addEventListener('click', () => {
    mode = modes[(modes.indexOf(mode) + 1) % modes.length];
    apply();
  });

  apply();
})();
