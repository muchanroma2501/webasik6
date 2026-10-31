/* =====================================================================
   Task 1 — Form validation            (Assignment #4)
   Owner: Jumabay Saule   (Assignment #5: strict email check, date/count/ticket rules)
   Works on every <form data-validate-form> in the site:
     - contact.html   (#contact-form)
     - register.html  (#register-form)
     - subscribe popup (#subscribe-form) on every page
   Each input carries data-validate="<rule>"; the matching error message
   is written into the .invalid-feedback element that follows it.
   ===================================================================== */
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var NAME_RE = /^[\p{L}][\p{L}\s'.\-]*$/u;


  /* ---- Strict email check -------------------------------------------
     Rejects: missing / double "@", spaces, empty local part, dots at the
     start/end or two dots in a row ("a@gmail..com"), domains without a
     dot ("user@gmail"), empty domain labels ("user@gmail."), one-letter
     or non-letter TLDs ("user@gmail.c", "user@mail.c0m"), and the
     common Gmail mistakes (gmail.co, gmial.com, gmail.con ...).        */
  var LOCAL_RE = /^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*$/;
  var LABEL_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  var TLD_RE = /^[a-z]{2,24}$/;
  var TYPO_DOMAINS = {
    'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmaill.com': 'gmail.com',
    'gnail.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmil.com': 'gmail.com',
    'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.con': 'gmail.com',
    'gmail.comm': 'gmail.com', 'gmail.om': 'gmail.com', 'gmail.ru': 'gmail.com',
    'gmail.kz': 'gmail.com', 'gmail.net': 'gmail.com', 'gmail.org': 'gmail.com',
    'yaho.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com', 'outlook.co': 'outlook.com'
  };

  function emailError(value) {
    var v = value.trim();
    if (v === '') return 'Please enter your email address.';
    if (/\s/.test(v)) return 'Email address must not contain spaces.';
    if (v.length > 254) return 'Email address is too long.';

    var at = v.split('@');
    if (at.length < 2) return 'Email address must contain the @ symbol.';
    if (at.length > 2) return 'Email address must contain only one @ symbol.';

    var local = at[0];
    var domain = at[1].toLowerCase();
    if (local === '') return 'Please enter the part before the @ symbol.';
    if (local.length > 64) return 'The part before the @ symbol is too long.';
    if (!LOCAL_RE.test(local)) return 'The part before @ has invalid characters or misplaced dots.';

    if (domain === '') return 'Please enter the domain after the @ symbol (e.g. gmail.com).';
    if (domain.indexOf('.') === -1) return 'The domain needs a dot, for example gmail.com.';

    var labels = domain.split('.');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i] === '') return 'The domain has an empty part. Check the dots (e.g. gmail.com).';
      if (!LABEL_RE.test(labels[i])) return 'The domain contains invalid characters.';
    }
    if (!TLD_RE.test(labels[labels.length - 1])) return 'The domain ending is invalid (e.g. .com, .kz, .ru).';

    if (TYPO_DOMAINS[domain]) return 'Did you mean @' + TYPO_DOMAINS[domain] + '?';
    if (labels[0] === 'gmail' && domain !== 'gmail.com') return 'Gmail addresses must end with @gmail.com.';
    return '';
  }

  /* Every rule returns '' when valid, or an error message string. */
  var rules = {
    name: function (value) {
      var v = value.trim();
      if (v === '') return 'Please enter your name.';
      if (v.length < 2) return 'Name must be at least 2 characters long.';
      if (!NAME_RE.test(v)) return 'Name may contain letters, spaces, apostrophes and hyphens only.';
      return '';
    },
    email: function (value) {
      return emailError(value);
    },
    message: function (value) {
      var v = value.trim();
      if (v === '') return 'Please write a message.';
      if (v.length < 10) return 'Your message must be at least 10 characters long.';
      return '';
    },
    password: function (value) {
      if (value === '') return 'Please create a password.';
      if (value.length < 8) return 'Password must be at least 8 characters long.';
      if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Password must contain at least one letter and one number.';
      return '';
    },
    confirm: function (value, form) {
      var pass = form.querySelector('[data-validate="password"]');
      if (value === '') return 'Please confirm your password.';
      if (pass && value !== pass.value) return 'Passwords do not match.';
      return '';
    },
    date: function (value) {
      if (value === '') return 'Please choose a visit date.';
      var chosen = new Date(value + 'T00:00:00');
      var today = new Date(); today.setHours(0, 0, 0, 0);
      if (isNaN(chosen.getTime())) return 'Please enter a valid date.';
      if (chosen < today) return 'The visit date cannot be in the past.';
      return '';
    },
    tickets: function (value, form) {
      var total = 0;
      form.querySelectorAll('[data-count]').forEach(function (input) { total += parseInt(input.value, 10) || 0; });
      return total >= 1 ? '' : 'Please select at least one ticket.';
    },
    count: function (value) {
      var n = parseInt(value, 10);
      if (value === '' || isNaN(n) || n < 0) return 'Enter a number from 0 to 20.';
      if (n > 20) return 'You can order up to 20 tickets of one type.';
      return '';
    },
    group: function (value) {
      var n = parseInt(value, 10);
      if (isNaN(n) || n < 1) return 'Group size must be at least 1 person.';
      if (n > 100) return 'Group size cannot be more than 100 people.';
      return '';
    },
    terms: function (value, form, field) {
      return field.checked ? '' : 'You must accept the terms to continue.';
    }
  };

  function feedbackFor(field) {
    var holder = field.closest('.input-group, .form-check') || field.parentElement;
    var box = holder.querySelector('.invalid-feedback');
    if (!box) {
      box = document.createElement('div');
      box.className = 'invalid-feedback';
      holder.appendChild(box);
    }
    return box;
  }

  function validateField(field, form) {
    var rule = rules[field.getAttribute('data-validate')];
    if (!rule) return true;
    var message = rule(field.value, form, field);
    var box = feedbackFor(field);
    if (message) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      field.setAttribute('aria-invalid', 'true');
      box.textContent = message;
      return false;
    }
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    field.setAttribute('aria-invalid', 'false');
    box.textContent = '';
    return true;
  }

  function clearState(form) {
    form.querySelectorAll('[data-validate]').forEach(function (f) {
      f.classList.remove('is-valid', 'is-invalid');
      f.removeAttribute('aria-invalid');
    });
  }

  function setup(form) {
    var fields = form.querySelectorAll('[data-validate]');
    var success = form.querySelector('.form-success');

    /* live feedback: validate when the user leaves a field, then on every keystroke */
    fields.forEach(function (field) {
      var evt = (field.type === 'checkbox' || field.tagName === 'SELECT') ? 'change' : 'input';
      field.addEventListener('blur', function () { if (field.type !== 'checkbox') validateField(field, form); });
      field.addEventListener(evt, function () {
        if (success) success.classList.add('d-none');
        if (field.classList.contains('is-invalid') || field.classList.contains('is-valid') || field.type === 'checkbox') {
          validateField(field, form);
        }
        /* when the password changes, re-check the confirmation field */
        if (field.getAttribute('data-validate') === 'password') {
          var c = form.querySelector('[data-validate="confirm"]');
          if (c && c.value !== '') validateField(c, form);
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstBad = null;
      fields.forEach(function (field) {
        if (!validateField(field, form) && !firstBad) firstBad = field;
      });
      if (firstBad) {
        if (success) success.classList.add('d-none');
        if (window.ZooSound) window.ZooSound.play('error');
        firstBad.focus();
        return;
      }
      /* all fields are valid */
      if (window.ZooSubmitFeedback) window.ZooSubmitFeedback(form);
      form.reset();
      clearState(form);
      if (window.ZooSound) window.ZooSound.play('success');
      if (success) {
        success.classList.remove('d-none');
        success.focus();
      }
    });

    form.addEventListener('reset', function () {
      clearState(form);
      if (success) success.classList.add('d-none');
    });
  }

  /* public API used by js/wizard.js */
  window.ZooValidation = { validateField: validateField, clearState: clearState, emailError: emailError };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[data-validate-form]').forEach(setup);
  });
})();
