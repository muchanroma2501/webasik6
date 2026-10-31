/* =====================================================================
   Task 5 — Current date and time      (Assignment #4)
   Owner: Saidazimov Mukhammadjan
   Uses the Date object, formats it like
   "October 14, 2026, 10:45:12 AM" and refreshes every second.
   ===================================================================== */
(function () {
  'use strict';

  function format(date) {
    var day = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    return day + ', ' + time.replace(/[\u202f\u00a0]/g, ' ');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var out = document.getElementById('current-datetime');
    if (!out) return;
    function tick() {
      var now = new Date();
      out.textContent = format(now);
      out.setAttribute('datetime', now.toISOString());
    }
    tick();
    setInterval(tick, 1000);
  });
})();
