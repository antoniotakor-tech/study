/* Sorted — QR generation and link sharing.
   The code is generated from the page's own location at runtime, so it is
   always correct for wherever the site is published. */
(function () {
  'use strict';

  var TARGETS = {
    survey: { file: 'survey.html', caption: 'Scan for the survey' },
    study:  { file: 'index.html',  caption: 'Scan for the study' }
  };

  var slots     = document.querySelectorAll('[data-qr-canvas], [data-qr-canvas-poster]');
  var caption   = document.querySelector('[data-qr-caption]');
  var urlOut    = document.querySelector('[data-share-url]');
  var urlPoster = document.querySelector('[data-share-url-poster]');
  var current   = 'survey';

  function urlFor(key) {
    return new URL(TARGETS[key].file, window.location.href).href;
  }

  function prettify(href) {
    return href.replace(/^https?:\/\//, '');
  }

  function render(key) {
    var href = urlFor(key);
    if (urlOut) urlOut.textContent = prettify(href);
    if (urlPoster) urlPoster.textContent = prettify(href);
    if (caption) caption.textContent = TARGETS[key].caption;

    slots.forEach(function (slot) {
      slot.innerHTML = '';
      if (typeof window.QRious !== 'function') {
        // Library blocked or offline — show the link so the page is still useful.
        var p = document.createElement('p');
        p.className = 'qrcard__fallback';
        p.textContent = prettify(href);
        slot.appendChild(p);
        return;
      }
      var canvas = document.createElement('canvas');
      slot.appendChild(canvas);
      new window.QRious({
        element: canvas,
        value: href,
        size: 640,           // generous, so print and PNG export stay crisp
        level: 'H',          // high error correction: survives a scuffed poster
        padding: 16,
        background: '#ffffff',
        foreground: '#15180f'
      });
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'QR code linking to ' + prettify(href));
    });
  }

  document.querySelectorAll('[data-qr-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      current = btn.getAttribute('data-qr-target');
      document.querySelectorAll('[data-qr-target]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      render(current);
    });
  });

  var dl = document.querySelector('[data-qr-download]');
  if (dl) {
    dl.addEventListener('click', function () {
      var canvas = document.querySelector('[data-qr-canvas] canvas');
      if (!canvas) { dl.textContent = 'Unavailable'; return; }
      var a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'sorted-qr-' + current + '.png';
      a.click();
    });
  }

  var copy = document.querySelector('[data-copy-url]');
  if (copy) {
    copy.addEventListener('click', function () {
      var href = urlFor(current);
      var done = function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy'; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(href).then(done, function () { copy.textContent = 'Press ⌘C'; });
      } else {
        copy.textContent = href;
      }
    });
  }

  var printBtn = document.querySelector('[data-print]');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  render(current);
})();
