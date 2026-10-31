/* =====================================================================
   Owner: Ramazan Mukhan
   Assignment #5 — Random animal fact
   Objects, arrays, loops, higher-order functions (map / filter / forEach),
   a button with addEventListener, content update and a fade animation.
   ===================================================================== */
(function () {
  'use strict';

  /* array of fact objects */
  var FACTS = [
    { animal: 'African Lion',     emoji: '🦁', type: 'Mammal',  text: 'A lion’s roar can be heard from up to 8 kilometres away.' },
    { animal: 'Savannah Giraffe', emoji: '🦒', type: 'Mammal',  text: 'Giraffes sleep for only about 30 minutes a day, often standing up.' },
    { animal: 'African Elephant', emoji: '🐘', type: 'Mammal',  text: 'Elephants can recognise themselves in a mirror and mourn their friends.' },
    { animal: 'Capuchin Monkey',  emoji: '🐒', type: 'Mammal',  text: 'Capuchins use stones as tools to crack open hard nuts.' },
    { animal: 'Greater Flamingo', emoji: '🦩', type: 'Bird',    text: 'Flamingos are born grey and turn pink because of the food they eat.' },
    { animal: 'Scarlet Macaw',    emoji: '🦜', type: 'Bird',    text: 'Scarlet macaws can live for more than 50 years.' },
    { animal: 'Emperor Penguin',  emoji: '🐧', type: 'Bird',    text: 'Emperor penguin dads keep the egg warm on their feet for two months.' },
    { animal: 'Sea Turtle',       emoji: '🐢', type: 'Aquatic', text: 'Sea turtles return to the beach where they were born to lay their eggs.' },
    { animal: 'Bottlenose Dolphin', emoji: '🐬', type: 'Aquatic', text: 'Every dolphin has its own whistle that works like a name.' },
    { animal: 'Polar Bear',       emoji: '🐻‍❄️', type: 'Mammal', text: 'A polar bear’s skin is black, and its fur is actually transparent.' }
  ];

  /* object with data and methods that manage the facts */
  var factLibrary = {
    facts: FACTS,
    lastIndex: -1,
    seen: [],

    /* pick a random fact that is different from the previous one */
    next: function () {
      var index;
      do {
        index = Math.floor(Math.random() * this.facts.length);
      } while (index === this.lastIndex && this.facts.length > 1);
      this.lastIndex = index;
      if (this.seen.indexOf(index) === -1) this.seen.push(index);
      return this.facts[index];
    },

    /* how many different facts the visitor has already read */
    progressText: function () {
      return this.seen.length + ' of ' + this.facts.length + ' facts discovered';
    },

    /* higher-order functions: filter + map + join */
    namesByType: function (type) {
      return this.facts
        .filter(function (fact) { return fact.type === type; })
        .map(function (fact) { return fact.animal; })
        .join(', ');
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('fact-button');
    var card = document.getElementById('fact-card');
    var emoji = document.getElementById('fact-emoji');
    var text = document.getElementById('fact-text');
    var animal = document.getElementById('fact-animal');
    var progress = document.getElementById('fact-progress');
    var chips = document.getElementById('fact-chips');
    if (!button || !card) return;

    function showFact() {
      var fact = factLibrary.next();
      emoji.textContent = fact.emoji;
      text.textContent = fact.text;
      animal.textContent = fact.animal + ' · ' + fact.type;
      progress.textContent = factLibrary.progressText();

      /* restart the CSS fade-in animation */
      card.classList.remove('fact-animate');
      void card.offsetWidth;
      card.classList.add('fact-animate');
    }

    button.addEventListener('click', showFact);

    /* build the "type" chips with a for loop + higher-order forEach */
    if (chips) {
      ['Mammal', 'Bird', 'Aquatic'].forEach(function (type) {
        var item = document.createElement('li');
        item.className = 'list-inline-item small';
        item.innerHTML = '<strong>' + type + 's:</strong> ' + factLibrary.namesByType(type);
        chips.appendChild(item);
      });
    }
  });
})();
