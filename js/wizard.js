/* =====================================================================
   Owner: Jumabay Saule
   Assignment #5 — Multi-step "Plan Your Visit" form (tickets.html)
   Steps: 1) date & tickets  2) extras  3) your details + summary.
   "Next" / "Back" call changeStep(), which passes the new step number to
   a CALLBACK function (showStep) that displays the right step.
   Input values are kept because hidden steps stay in the DOM.
   ===================================================================== */
(function () {
  'use strict';

  /* ---- data: objects and arrays ----------------------------------- */
  var PRICES = {
    adult: { label: 'Adult pass',        weekday: 2000, weekend: 2500 },
    child: { label: 'Child pass',        weekday: 1000, weekend: 1200 },
    free:  { label: 'Free entry (under 7 / seniors)', weekday: 0, weekend: 0 }
  };
  var STEP_TITLES = ['Date & tickets', 'Extras', 'Your details'];

  /* object with methods that do the price logic */
  var booking = {
    isWeekend: function (isoDate) {
      var day = new Date(isoDate + 'T00:00:00').getDay();      /* 0 = Sunday, 6 = Saturday */
      return day === 0 || day === 6;
    },
    formatMoney: function (amount) {
      return amount.toLocaleString('en-US') + ' ₸';
    },
    formatDate: function (isoDate) {
      return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    },
    /* build the list of lines for the summary: [{ text, amount }] */
    buildLines: function (form) {
      var date = form.elements['visit-date'].value;
      var priceKey = this.isWeekend(date) ? 'weekend' : 'weekday';
      var lines = [];

      Object.keys(PRICES).forEach(function (type) {
        var qty = parseInt(form.elements['count-' + type].value, 10) || 0;
        if (qty > 0) {
          lines.push({ text: qty + ' × ' + PRICES[type].label, amount: qty * PRICES[type][priceKey] });
        }
      });

      var people = (parseInt(form.elements['count-adult'].value, 10) || 0) +
                   (parseInt(form.elements['count-child'].value, 10) || 0) +
                   (parseInt(form.elements['count-free'].value, 10) || 0);

      Array.from(form.querySelectorAll('input[name="extra"]:checked')).forEach(function (box) {
        lines.push({ text: box.dataset.label + ' (' + people + ' people)', amount: people * Number(box.dataset.price) });
      });
      return lines;
    },
    total: function (lines) {
      return lines.reduce(function (sum, line) { return sum + line.amount; }, 0);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('visit-wizard');
    if (!form) return;

    var steps = Array.from(form.querySelectorAll('.wizard-step'));
    var backButton = document.getElementById('wizard-back');
    var nextButton = document.getElementById('wizard-next');
    var submitButton = document.getElementById('wizard-submit');
    var progress = document.getElementById('wizard-progress');
    var progressBar = document.getElementById('wizard-progressbar');
    var stepLabel = document.getElementById('wizard-step-label');
    var summary = document.getElementById('wizard-summary');
    var successBox = document.getElementById('wizard-success');
    var successText = document.getElementById('wizard-success-text');
    var againButton = document.getElementById('wizard-again');
    var dateInput = document.getElementById('visit-date');
    var currentStep = 1;

    /* attribute manipulation: visitors cannot choose a past date */
    var today = new Date();
    dateInput.setAttribute('min', today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'));

    /* ---- CALLBACK: displays the correct step ----------------------- */
    function showStep(stepNumber) {
      currentStep = stepNumber;
      steps.forEach(function (step, index) {
        step.classList.toggle('is-active', index + 1 === stepNumber);
      });
      var percent = Math.round((stepNumber / steps.length) * 100);
      progress.style.width = percent + '%';                       /* dynamic style */
      progressBar.setAttribute('aria-valuenow', String(percent));
      stepLabel.textContent = 'Step ' + stepNumber + ' of ' + steps.length + ': ' + STEP_TITLES[stepNumber - 1];

      backButton.classList.toggle('invisible', stepNumber === 1);
      nextButton.classList.toggle('d-none', stepNumber === steps.length);
      submitButton.classList.toggle('d-none', stepNumber !== steps.length);
      if (stepNumber === steps.length) renderSummary();
    }

    /* moves forward / back and hands the new number to the callback */
    function changeStep(direction, callback) {
      var target = currentStep + direction;
      if (target < 1 || target > steps.length) return;
      callback(target);
    }

    /* validates all fields of the visible step */
    function currentStepIsValid() {
      var fields = steps[currentStep - 1].querySelectorAll('[data-validate]');
      var firstBad = null;
      fields.forEach(function (field) {
        if (!window.ZooValidation.validateField(field, form) && !firstBad) firstBad = field;
      });
      if (firstBad) {
        firstBad.focus();
        if (window.ZooSound) window.ZooSound.play('error');
        return false;
      }
      return true;
    }

    function renderSummary() {
      var lines = booking.buildLines(form);
      var rows = lines.map(function (line) {
        return '<li class="d-flex justify-content-between"><span>' + line.text + '</span><strong>' +
               booking.formatMoney(line.amount) + '</strong></li>';
      }).join('');
      summary.innerHTML =
        '<h3 class="h6 mb-2">Your booking</h3>' +
        '<p class="small mb-2">📅 ' + booking.formatDate(form.elements['visit-date'].value) + '</p>' +
        '<ul class="list-unstyled small mb-2">' + rows + '</ul>' +
        '<p class="d-flex justify-content-between border-top pt-2 mb-0"><span>Total</span><strong>' +
        booking.formatMoney(booking.total(lines)) + '</strong></p>';
    }

    /* ---- buttons --------------------------------------------------- */
    nextButton.addEventListener('click', function () {
      if (currentStepIsValid()) {
        changeStep(+1, showStep);
        if (window.ZooSound) window.ZooSound.play('click');
      }
    });
    backButton.addEventListener('click', function () {
      changeStep(-1, showStep);
      if (window.ZooSound) window.ZooSound.play('click');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!currentStepIsValid()) return;

      function finishBooking() {
        var lines = booking.buildLines(form);
        var reference = 'ZOO-' + Math.floor(1000 + Math.random() * 9000);
        successText.innerHTML = 'Thank you, <strong>' + form.elements['visitor-name'].value.trim() + '</strong>! ' +
          'Booking <strong>' + reference + '</strong> for ' + booking.formatDate(form.elements['visit-date'].value) +
          ' is confirmed. Total: <strong>' + booking.formatMoney(booking.total(lines)) + '</strong>.';
        form.classList.add('d-none');
        successBox.classList.remove('d-none');
        if (window.ZooSound) window.ZooSound.play('success');
      }
      if (window.ZooSubmitFeedback) window.ZooSubmitFeedback(form, finishBooking);
      else finishBooking();
    });

    againButton.addEventListener('click', function () {
      form.reset();
      window.ZooValidation.clearState(form);
      successBox.classList.add('d-none');
      form.classList.remove('d-none');
      showStep(1);
    });

    /* ---- live validation while typing ------------------------------ */
    form.querySelectorAll('[data-validate]').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.classList.contains('is-invalid') || field.classList.contains('is-valid')) {
          window.ZooValidation.validateField(field, form);
        }
      });
      field.addEventListener('blur', function () { window.ZooValidation.validateField(field, form); });
    });
    /* when any ticket number changes, re-check the "at least one ticket" rule */
    form.querySelectorAll('[data-count]').forEach(function (input) {
      input.addEventListener('input', function () {
        var main = form.querySelector('[data-validate="tickets"]');
        if (main.classList.contains('is-invalid')) window.ZooValidation.validateField(main, form);
      });
    });

    showStep(1);
  });
})();
