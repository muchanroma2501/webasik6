/* =====================================================================
   Task 3 — Popup subscription form    (Assignment #4)
   Owner: Nurdaulet Rashken
   The popup (#subscribePopup) is hidden by default. Any element with
   data-popup-open="subscribePopup" opens it. It closes with:
     - the × button (data-popup-close)
     - a click on the dark area outside the box
     - the Escape key
   ===================================================================== */
(function () {
  'use strict';

  var lastTrigger = null;

  function openPopup(popup, trigger) {
    lastTrigger = trigger || null;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    document.body.classList.add('popup-lock');
    var first = popup.querySelector('input:not([type="hidden"])');
    if (first) { setTimeout(function () { first.focus(); }, 50); }
  }

  function closePopup(popup) {
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('popup-lock');
    if (lastTrigger) { lastTrigger.focus(); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var popup = document.getElementById('subscribePopup');
    if (!popup) return;

    document.querySelectorAll('[data-popup-open="subscribePopup"]').forEach(function (btn) {
      btn.addEventListener('click', function () { openPopup(popup, btn); });
    });

    popup.querySelectorAll('[data-popup-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { closePopup(popup); });
    });

    /* click outside the white box (on the overlay itself) closes the popup */
    popup.addEventListener('click', function (event) {
      if (event.target === popup) closePopup(popup);
    });

    document.addEventListener('keydown', function (event) {
      if (!popup.classList.contains('is-open')) return;
      if (event.key === 'Escape') { closePopup(popup); return; }
      if (event.key === 'Tab') {                 /* keep keyboard focus inside the popup */
        var items = popup.querySelectorAll('button, input, select, textarea, a[href]');
        var list = Array.prototype.filter.call(items, function (el) { return !el.disabled && el.offsetParent !== null; });
        if (!list.length) return;
        var first = list[0], last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  });
})();
