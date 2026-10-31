/* =====================================================================
   Task 2 — Accordion for FAQs         (Assignment #4)
   Owner: Ramazan Mukhan
   Answers are hidden by default (max-height: 0). Clicking a question
   toggles its answer open/closed; CSS animates max-height for a smooth
   transition. Works for any markup with .faq-question / .faq-answer.
   ===================================================================== */
(function () {
  'use strict';

  function closePanel(button, panel) {
    button.setAttribute('aria-expanded', 'false');
    panel.style.maxHeight = '0px';
    panel.setAttribute('aria-hidden', 'true');
  }

  function openPanel(button, panel) {
    button.setAttribute('aria-expanded', 'true');
    panel.style.maxHeight = panel.scrollHeight + 'px';
    panel.setAttribute('aria-hidden', 'false');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var questions = document.querySelectorAll('.faq-question');

    questions.forEach(function (button) {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      if (!panel) return;

      closePanel(button, panel);                 /* hidden by default */

      button.addEventListener('click', function () {
        var isOpen = button.getAttribute('aria-expanded') === 'true';
        if (isOpen) { closePanel(button, panel); } else { openPanel(button, panel); }
      });
    });

    /* keep open panels the right height when the window is resized */
    window.addEventListener('resize', function () {
      questions.forEach(function (button) {
        var panel = document.getElementById(button.getAttribute('aria-controls'));
        if (panel && button.getAttribute('aria-expanded') === 'true') {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  });
})();
