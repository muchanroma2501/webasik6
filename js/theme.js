/* =====================================================================
   Owner: Nurdaulet Rashken
   Assignment #5 — Day / Night theme switch (dynamic style changes)
   Sets data-bs-theme="dark|light" on <html>. Bootstrap re-colours its
   components automatically and css/style.css re-colours the zoo theme.
   The choice is remembered with localStorage.
   Public API: window.ZooTheme.set('day' | 'night'), .get()
   ===================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'cityzoo-theme';
  var root = document.documentElement;

  function get() { return root.getAttribute('data-bs-theme') === 'dark' ? 'night' : 'day'; }

  function renderButton(button) {
    if (!button) return;
    var night = get() === 'night';
    button.textContent = night ? '☀️ Day mode' : '🌙 Night mode';
    button.setAttribute('aria-pressed', String(night));
    button.setAttribute('aria-label', night ? 'Switch to day theme' : 'Switch to night theme');
  }

  function set(theme) {
    root.setAttribute('data-bs-theme', theme === 'night' ? 'dark' : 'light');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }
    renderButton(document.getElementById('themeToggle'));
    /* let other scripts (background colour button) react */
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  window.ZooTheme = { set: set, get: get };

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('themeToggle');
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    if (saved === 'night') { set('night'); } else { root.setAttribute('data-bs-theme', 'light'); }
    renderButton(button);

    if (button) {
      button.addEventListener('click', function () {
        set(get() === 'night' ? 'day' : 'night');
        if (window.ZooSound) window.ZooSound.play('toggle');
      });
    }
  });
})();
