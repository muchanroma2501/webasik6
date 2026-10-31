/* =====================================================================
   Owner: Saidazimov Mukhammadjan
   Assignment #5 — Greeting by time of day (switch statement)
   Fills #hero-greeting on the home page.
   ===================================================================== */
(function () {
  'use strict';

  /* convert an hour (0-23) into a named part of the day */
  function getPartOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /* a different message for each part of the day */
  function buildGreeting(part) {
    switch (part) {
      case 'morning':
        return '🌅 Good morning! The animals are waking up and breakfast is served.';
      case 'afternoon':
        return '☀️ Good afternoon! Perfect time for the daily feeding shows.';
      case 'evening':
        return '🌇 Good evening! The zoo is calm and the sunset is beautiful.';
      default:
        return '🌙 Good night! Our night-owls are awake, see you tomorrow.';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var box = document.getElementById('hero-greeting');
    if (!box) return;
    box.textContent = buildGreeting(getPartOfDay(new Date().getHours()));
  });
})();
