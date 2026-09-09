/* Sorted — shared site behaviour.
   Theme choice, table views for every chart. Small, dependency-free. */
(function () {
  'use strict';

  /* ---- Theme ---------------------------------------------------------- */
  var KEY = 'sorted.theme';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function remember(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: fine */ }
  }

  var saved = stored();
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved);
  }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var isDark = current ? current === 'dark' : systemPrefersDark();
      var next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      remember(next);
      btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  });

  /* ---- Chart table views ---------------------------------------------
     Every chart on the site has an equivalent table. This is the relief
     required for marks that sit below 3:1 against the surface, and the
     accessible route to the same numbers. */
  document.querySelectorAll('[data-toggle-table]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('data-toggle-table'));
    if (!target) return;
    btn.addEventListener('click', function () {
      var open = target.hidden;
      target.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide table' : 'Show table';
    });
  });
})();
