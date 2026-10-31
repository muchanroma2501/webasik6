/* =====================================================================
   Owner: Saidazimov Mukhammadjan
   Arrow navigation through the requested site route:
   Home -> Animals -> Visit (Tickets) -> About -> Contact -> Sign Up.
   From Sign Up, the right arrow opens Subscribe; Escape closes it.
   ===================================================================== */
(function () {
  'use strict';

  var ROUTE = ['index.html', 'animals.html', 'tickets.html', 'about.html', 'contact.html', 'register.html'];

  function pageName(pathname) {
    var name = pathname.split('/').pop();
    return name || 'index.html';
  }

  function isVisitPage(name) {
    return name === 'tickets.html' || name === 'schedule.html' || name === 'map.html' || name === 'rules.html';
  }

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    var target = event.target;
    if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return;
    /* widgets that use the arrow keys themselves (star rating, photo carousel) keep them */
    if (target && target.closest && target.closest('[role="radiogroup"], [role="radio"], [role="slider"], .carousel')) return;

    var popup = document.getElementById('subscribePopup');
    var popupOpen = popup && popup.classList.contains('is-open');
    if (popupOpen) {
      if (event.key !== 'ArrowLeft') return;
      var caretAtStart = false;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) {
        try { caretAtStart = target.selectionStart === 0 && target.selectionEnd === 0; }
        catch (error) { caretAtStart = false; }
      }
      var isTextField = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (isTextField && !caretAtStart) return;
      var closeButton = popup.querySelector('[data-popup-close]');
      if (closeButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeButton.click();
      }
      return;
    }

    var subscribeButton = document.querySelector('[data-popup-open="subscribePopup"]');
    var current = pageName(window.location.pathname);
    var index = ROUTE.indexOf(current);
    if (index < 0 && isVisitPage(current)) index = ROUTE.indexOf('tickets.html');
    if (index < 0) return;

    var nextIndex = index + (event.key === 'ArrowRight' ? 1 : -1);
    if (nextIndex < 0) {
      // The route loops: Left from Home opens Subscribe, then Escape returns to Home.
      if (subscribeButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        subscribeButton.click();
      }
      return;
    }
    if (nextIndex >= ROUTE.length) {
      // Right from Sign Up opens the Subscribe popup.
      if (subscribeButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        subscribeButton.click();
      }
      return;
    }

    var destination = ROUTE[nextIndex];
    var link = Array.prototype.find.call(document.querySelectorAll('.navbar-nav a[href]'), function (item) {
      return pageName(new URL(item.href, window.location.href).pathname) === destination;
    });
    if (!link) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = link.href;
  }, true);
})();
