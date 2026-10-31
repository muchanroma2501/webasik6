/* =====================================================================
   Owner: Nurdaulet Rashken
   Assignment #5 — Animal explorer (animals.html)
   Category buttons + live search. Uses querySelectorAll, Array.from,
   filter / forEach (higher-order functions), switch and event listeners.
   (Replaces the old inline <script> in animals.html.)
   ===================================================================== */
(function () {
  'use strict';

  /* does a card belong to the selected category? (switch statement) */
  function matchesCategory(card, category) {
    switch (category) {
      case 'all':
        return true;
      case 'Mammal':
      case 'Bird':
      case 'Aquatic':
        return card.dataset.category === category;
      default:
        return false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var radios = document.querySelectorAll('input[name="animal-filter"]');
    var search = document.getElementById('animal-search');
    var counter = document.getElementById('animal-count');
    var emptyMessage = document.getElementById('animal-empty');
    var cards = Array.from(document.querySelectorAll('.animal-col'));
    if (!radios.length || !cards.length) return;

    function currentCategory() {
      var checked = document.querySelector('input[name="animal-filter"]:checked');
      return checked ? checked.value : 'all';
    }

    function applyFilters() {
      var category = currentCategory();
      var query = search ? search.value.trim().toLowerCase() : '';

      var visibleCards = cards.filter(function (card) {
        var name = card.querySelector('.card-title').textContent.toLowerCase();
        return matchesCategory(card, category) && name.indexOf(query) !== -1;
      });

      cards.forEach(function (card) {
        var visible = visibleCards.indexOf(card) !== -1;
        card.classList.toggle('d-none', !visible);
        if (visible) {                                   /* re-play the pop-in animation */
          card.classList.remove('card-pop');
          void card.offsetWidth;
          card.classList.add('card-pop');
        }
      });

      if (counter) counter.textContent = 'Showing ' + visibleCards.length + ' of ' + cards.length + ' animals';
      if (emptyMessage) emptyMessage.classList.toggle('d-none', visibleCards.length !== 0);
    }

    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        applyFilters();
        if (window.ZooSound) window.ZooSound.play('click');
      });
    });
    if (search) search.addEventListener('input', applyFilters);
    applyFilters();
  });
})();
