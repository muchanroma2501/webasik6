/* =====================================================================
   Owner: Ramazan Mukhan
   Assignment #5 — Star rating (querySelectorAll + click events)
   Clicking a star selects the rating, colours the stars, plays a sound,
   animates the star with style.transform and updates the message.
   Keyboard: ArrowLeft / ArrowRight change the rating of the focused star.
   ===================================================================== */
(function () {
  'use strict';

  /* object with data + methods that manage the rating */
  var ratingState = {
    value: 0,
    max: 5,
    labels: ['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing'],

    set: function (value) {
      this.value = Math.max(1, Math.min(this.max, value));
    },
    describe: function () {
      return this.labels[this.value];
    }
  };

  /* message depends on how many stars were chosen (switch statement) */
  function buildMessage(value) {
    switch (value) {
      case 1:
      case 2:
        return 'We are sorry! 🙁 Tell us how we can improve in the contact form.';
      case 3:
        return 'Thanks! 🙂 We will try to make your next visit even better.';
      case 4:
        return 'Wonderful! 😊 We are happy you enjoyed your day.';
      case 5:
        return 'Fantastic! 🦁 You made our keepers smile today!';
      default:
        return 'Tap a star to rate us!';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var stars = document.querySelectorAll('.star');
    var message = document.getElementById('rating-message');
    var summary = document.getElementById('rating-summary');
    if (!stars.length || !message) return;

    /* colour stars up to "count" (used for the real rating and for hover preview) */
    function paint(count, className) {
      stars.forEach(function (star, index) {
        star.classList.toggle(className, index < count);
      });
    }

    /* bounce animation driven by JavaScript (style.transform + CSS transition) */
    function animate(star) {
      star.style.transform = 'scale(1.5) rotate(20deg)';
      setTimeout(function () { star.style.transform = ''; }, 220);
    }

    function choose(value) {
      ratingState.set(value);
      paint(ratingState.value, 'selected');
      paint(0, 'preview');

      stars.forEach(function (star, index) {
        var isChosen = index + 1 === ratingState.value;
        star.setAttribute('aria-checked', String(isChosen));
        star.setAttribute('tabindex', isChosen ? '0' : '-1');
      });

      animate(stars[ratingState.value - 1]);
      message.textContent = buildMessage(ratingState.value);                       /* textContent */
      if (summary) {
        summary.innerHTML = 'Your rating: <strong>' + ratingState.value + ' / ' +
          ratingState.max + '</strong> (' + ratingState.describe() + ')';           /* innerHTML */
      }
      if (window.ZooSound) window.ZooSound.play('star');
    }

    stars.forEach(function (star, index) {
      star.addEventListener('click', function () { choose(index + 1); });
      star.addEventListener('mouseenter', function () { paint(index + 1, 'preview'); });
      star.addEventListener('mouseleave', function () { paint(0, 'preview'); });

      star.addEventListener('keydown', function (event) {
        var next;
        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            next = Math.min(stars.length, index + 2);
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            next = Math.max(1, index);
            break;
          default:
            return;
        }
        event.preventDefault();
        stars[next - 1].focus();
        choose(next);
      });
    });
  });
})();
