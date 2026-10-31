/* =====================================================================
   Task 4 — Change background colour   (Assignment #4)
   Owner: Saidazimov Mukhammadjan
   The floating "Change Background" button cycles through a list of
   predefined colours and sets document.body.style.backgroundColor.
   The chosen colour is remembered between pages with localStorage.
   ===================================================================== */
(function () {
  'use strict';

  var COLORS = [
    { name: 'Zoo Mist',   value: '#f4f7f5' },
    { name: 'Savannah',   value: '#fff3cd' },
    { name: 'Jungle',     value: '#d8f3dc' },
    { name: 'Ocean',      value: '#d9eefc' },
    { name: 'Flamingo',   value: '#fde2e4' },
    { name: 'Lavender',   value: '#ece6fb' }
  ];
  var KEY = 'cityzoo-bg-index';

  function readIndex() {
    try {
      var n = parseInt(localStorage.getItem(KEY), 10);
      return (n >= 0 && n < COLORS.length) ? n : 0;
    } catch (e) { return 0; }
  }
  function saveIndex(i) { try { localStorage.setItem(KEY, String(i)); } catch (e) { /* ignore */ } }

  function isNight() { return window.ZooTheme && window.ZooTheme.get() === 'night'; }

  /* in Night mode the CSS theme controls the background, so the inline colour is removed */
  function apply(index, label) {
    document.body.style.backgroundColor = isNight() ? '' : COLORS[index].value;
    if (label) label.textContent = COLORS[index].name;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('bgColorBtn');
    if (!button) return;
    var label = button.querySelector('.bg-color-name');
    var index = readIndex();
    apply(index, label);

    /* when the theme changes, re-apply (or clear) the chosen colour */
    document.addEventListener('themechange', function () { apply(index, label); });

    button.addEventListener('click', function () {
      if (isNight()) window.ZooTheme.set('day');   /* using this button returns to Day mode */
      index = (index + 1) % COLORS.length;     /* cycle: 0 → 1 → 2 … → 0 */
      apply(index, label);
      saveIndex(index);
    });
  });
})();
