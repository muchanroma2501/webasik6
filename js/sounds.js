/* =====================================================================
   Owner: Saidazimov Mukhammadjan
   Assignment #5 — Play sounds
   A sound manager with a custom notification chime.
   Audio starts only after a user gesture to satisfy browser playback rules.
   Public API: window.ZooSound.play(name)
   ===================================================================== */
(function () {
  'use strict';

  /* Original audio assets created for this project. */
  var CHIME = 'sounds/iphone-notification.wav';
  var FILES = {
    click: CHIME,
    pop: CHIME,
    toggle: CHIME,
    success: CHIME,
    error: CHIME,
    star: CHIME
  };
  var STORAGE_KEY = 'cityzoo-sound-muted-v2';

  var cache = {};        /* name -> Audio object, created lazily            */
  var current = null;    /* the Audio object that is playing right now      */
  var muted = readMuted();

  function readMuted() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return saved === null ? true : saved === '1';
    } catch (e) { return true; }
  }
  function saveMuted() {
    try { localStorage.setItem(STORAGE_KEY, muted ? '1' : '0'); } catch (e) { /* ignore */ }
  }

  /* Play a named sound; stops the previous one first so nothing overlaps. */
  function play(name) {
    if (muted) return;
    if (!FILES[name]) return;
    if (current) { current.pause(); current.currentTime = 0; }
    var audio = cache[name] || (cache[name] = new Audio(FILES[name]));
    audio.currentTime = 0;
    current = audio;
    var attempt = audio.play();
    if (attempt && typeof attempt.catch === 'function') { attempt.catch(function () { /* autoplay blocked */ }); }
  }

  function renderToggle(button) {
    if (!button) return;
    button.setAttribute('aria-pressed', String(!muted));
    button.setAttribute('aria-label', muted ? 'Turn sounds on' : 'Mute sounds');
    button.textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
  }

  window.ZooSound = {
    play: play,
    isMuted: function () { return muted; }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('soundToggle');
    renderToggle(toggle);

    if (toggle) {
      toggle.addEventListener('click', function () {
        muted = !muted;
        saveMuted();
        renderToggle(toggle);
        if (muted) {
          if (current) { current.pause(); current.currentTime = 0; }
        } else {
          play('toggle');
        }
      });
    }

    /* one listener for every button that carries data-sound="..." */
    document.addEventListener('click', function (event) {
      var source = event.target.closest('[data-sound]');
      if (source) play(source.getAttribute('data-sound'));
    });
  });
})();
