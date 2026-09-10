/* Sorted — survey engine.
   Progressive enhancement: without this file the form is one long page that
   submits natively. With it, the form becomes six validated steps.
   ========================================================================
   SETUP — set ONE of the two values below, then push. Nothing else to change.

   OPTION A (fastest, no account at all)
     Put an email address in SURVEY_INBOX. Responses arrive in that inbox via
     formsubmit.co, which needs no signup — you click a confirmation link in the
     first email and it is live.
       var SURVEY_INBOX = 'you@example.com';
     Trade-off: the address is visible in this file, which is public. Use a
     throwaway or an alias, not your main personal address.

   OPTION B (better for analysis, ~2 min signup)
     Create a form at formspree.io / basin.com / a Google Apps Script web app
     and paste the full URL into SURVEY_ENDPOINT. Responses land in a dashboard
     you can export to CSV. This wins if you expect more than a handful of
     responses — an inbox full of individual emails is painful to analyse.
       var SURVEY_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';

   SURVEY_ENDPOINT takes precedence if both are set. With neither set, the
   survey tells visitors it is not collecting rather than dropping answers.
   ======================================================================== */
var SURVEY_ENDPOINT = '';
var SURVEY_INBOX    = '';

(function () {
  'use strict';

  var form = document.querySelector('[data-survey]');
  if (!form) return;

  var steps       = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
  var back        = form.querySelector('[data-nav="back"]');
  var next        = form.querySelector('[data-nav="next"]');
  var submit      = form.querySelector('[data-nav="submit"]');
  var counter     = form.querySelector('[data-step-count]');
  var progress    = document.querySelector('[data-progress]');
  var fill        = document.querySelector('[data-progress-fill]');
  var pctLabel    = document.querySelector('[data-progress-pct]');
  var stepLabel   = document.querySelector('[data-progress-label]');
  var donePanel   = document.querySelector('[data-done]');
  var scoreSlot   = document.querySelector('[data-score]');
  var notice      = document.querySelector('[data-endpoint-notice]');

  var KNOWLEDGE = { q9_pizza: 'residual', q10_carton: 'pmd', q11_fork: 'residual' };
  var STORE_KEY = 'sorted.responses';
  var at = 0;
  var firstPaint = true;

  /* ---- Endpoint resolution -------------------------------------------
     Whichever backend is configured, the page adapts its POST to suit it:
       · Google Apps Script — form-encoded, no-cors (the response is opaque)
       · everything else    — JSON, with the response status checked
  */
  function resolveTarget() {
    var url = (typeof SURVEY_ENDPOINT === 'string' ? SURVEY_ENDPOINT : '').trim();
    if (!url && typeof SURVEY_INBOX === 'string' && SURVEY_INBOX.trim()) {
      url = 'https://formsubmit.co/ajax/' + encodeURIComponent(SURVEY_INBOX.trim());
    }
    if (!url) return null;
    return { url: url, appsScript: /script\.google\.com/i.test(url) };
  }

  var target = resolveTarget();
  var live = !!target;
  if (!live && notice) {
    notice.innerHTML =
      '<div class="notice"><svg class="notice__icon" width="18" height="18" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/>' +
      '<path d="M12 8v5m0 3.2v.1"/></svg><p><strong>This survey is not collecting responses yet.</strong> ' +
      'The collection endpoint has not been set, so answers cannot be saved. ' +
      'Please come back once it is live.</p></div>';
    // Owner-facing hint, only visible while the survey is unconfigured.
    console.info('[Sorted] Set SURVEY_INBOX (an email, no signup) or SURVEY_ENDPOINT ' +
                 '(a form URL) at the top of assets/js/survey.js, then push.');
    notice.hidden = false;
    submit.disabled = true;
  }

  /* ---- Stepping ------------------------------------------------------- */
  function paint() {
    steps.forEach(function (s, i) { s.hidden = i !== at; });

    back.hidden   = at === 0;
    next.hidden   = at === steps.length - 1;
    submit.hidden = at !== steps.length - 1;
    if (!live) submit.disabled = true;

    counter.hidden = false;
    counter.textContent = 'Section ' + (at + 1) + ' of ' + steps.length;

    progress.hidden = false;
    var pct = Math.round((at / (steps.length - 1)) * 100);
    fill.style.width = pct + '%';
    pctLabel.textContent = pct + '%';
    stepLabel.textContent = 'Section ' + (at + 1) + ' of ' + steps.length;

    // Move focus only when the reader changed step — focusing on first paint
    // puts a focus ring on the page before anyone has interacted with it.
    if (!firstPaint) {
      var heading = steps[at].querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    firstPaint = false;
  }

  /* ---- Validation ----------------------------------------------------- */
  function answered(q) {
    var boxes = q.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    if (boxes.length) {
      return Array.prototype.some.call(boxes, function (b) { return b.checked; });
    }
    var field = q.querySelector('select, input, textarea');
    return !!(field && field.value.trim());
  }

  function validate(stepEl) {
    var bad = null;
    stepEl.querySelectorAll('[data-q][data-required]').forEach(function (q) {
      var ok = answered(q);
      q.classList.toggle('q--invalid', !ok);
      if (!ok && !bad) bad = q;
    });
    if (bad) {
      bad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var first = bad.querySelector('input, select, textarea');
      if (first) first.focus({ preventScroll: true });
    }
    return !bad;
  }

  form.addEventListener('change', function (e) {
    var q = e.target.closest('[data-q]');
    if (q && q.classList.contains('q--invalid') && answered(q)) q.classList.remove('q--invalid');
  });

  next.addEventListener('click', function () {
    if (!validate(steps[at])) return;
    at = Math.min(at + 1, steps.length - 1);
    paint();
  });
  back.addEventListener('click', function () {
    at = Math.max(at - 1, 0);
    paint();
  });

  /* ---- Collect -------------------------------------------------------- */
  function collect() {
    var out = { submitted_at: new Date().toISOString() };
    var fd = new FormData(form);
    fd.forEach(function (value, key) {
      if (out[key] === undefined) { out[key] = value; }
      else if (Array.isArray(out[key])) { out[key].push(value); }
      else { out[key] = [out[key], value]; }
    });
    // Multi-selects always land as an array so the export stays rectangular.
    if (out.q6_barriers && !Array.isArray(out.q6_barriers)) out.q6_barriers = [out.q6_barriers];

    var score = 0;
    Object.keys(KNOWLEDGE).forEach(function (k) { if (out[k] === KNOWLEDGE[k]) score += 1; });
    out.knowledge_score = score;
    return out;
  }

  function keepLocally(payload) {
    try {
      var all = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      all.push(payload);
      localStorage.setItem(STORE_KEY, JSON.stringify(all));
    } catch (e) { /* nothing more we can do */ }
  }

  function showScore(payload) {
    if (!scoreSlot) return;
    var n = payload.knowledge_score;
    var confidence = payload.q8_confidence ? Number(payload.q8_confidence) : null;
    var line = n === 3
      ? 'All three correct — you are in the minority.'
      : n === 0
        ? 'None of the three. You are in very good company, which is rather the point.'
        : n + ' of 3 correct.';
    var calib = '';
    if (confidence !== null) {
      var expected = Math.round((confidence - 1) / 4 * 3);
      if (confidence >= 4 && n <= 1) {
        calib = ' You rated your confidence ' + confidence + '/5 and got ' + n +
                ' of 3 — that gap between believing and knowing is exactly what this study is measuring.';
      } else if (confidence <= 2 && n >= 2) {
        calib = ' You rated yourself ' + confidence + '/5 and got ' + n +
                ' of 3 — you know more than you think you do.';
      } else if (expected === n) {
        calib = ' Your confidence and your score line up, which is rarer than you would expect.';
      }
    }
    scoreSlot.innerHTML =
      '<div class="callout"><p class="callout__kicker">Your knowledge check</p><p>' +
      line + calib + '</p></div>';
  }

  function finish(payload, message) {
    form.hidden = true;
    if (progress) progress.hidden = true;
    if (notice) notice.hidden = true;
    donePanel.hidden = false;
    if (message) {
      var p = document.createElement('p');
      p.className = 'q__hint';
      p.textContent = message;
      donePanel.appendChild(p);
    }
    showScore(payload);
    donePanel.querySelector('h2').setAttribute('tabindex', '-1');
    donePanel.querySelector('h2').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- Submit --------------------------------------------------------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(steps[at])) return;
    if (!live) return;

    var payload = collect();
    submit.disabled = true;
    submit.textContent = 'Sending…';

    var request;
    if (target.appsScript) {
      // Apps Script web apps don't send CORS headers; no-cors makes the response
      // opaque, so a resolved promise is the only success signal available.
      var body = new URLSearchParams();
      Object.keys(payload).forEach(function (k) {
        body.append(k, Array.isArray(payload[k]) ? payload[k].join('; ') : payload[k]);
      });
      request = fetch(target.url, { method: 'POST', mode: 'no-cors', body: body })
        .then(function () { finish(payload); });
    } else {
      request = fetch(target.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        finish(payload);
      });
    }

    request
      .catch(function () {
        keepLocally(payload);
        finish(payload, 'Your answers could not reach the server, so they are saved on this device instead. Nothing is lost.');
      });
  });

  /* ---- Local export (owner utility): survey.html?export=1 ------------- */
  if (/[?&]export=1/.test(location.search)) {
    var rows = [];
    try { rows = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { rows = []; }
    var box = document.createElement('div');
    box.className = 'notice';
    box.style.marginBottom = 'var(--s-5)';
    if (!rows.length) {
      box.innerHTML = '<p>No responses stored on this device.</p>';
    } else {
      var keys = Object.keys(rows.reduce(function (acc, r) {
        Object.keys(r).forEach(function (k) { acc[k] = 1; }); return acc;
      }, {}));
      var csv = [keys.join(',')].concat(rows.map(function (r) {
        return keys.map(function (k) {
          var v = r[k] === undefined ? '' : Array.isArray(r[k]) ? r[k].join('; ') : String(r[k]);
          return '"' + v.replace(/"/g, '""') + '"';
        }).join(',');
      })).join('\n');
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      box.innerHTML = '<p><strong>' + rows.length + ' response(s) stored on this device.</strong> ' +
        '<a href="' + url + '" download="sorted-responses.csv">Download CSV</a></p>';
    }
    document.querySelector('main .stack-6').prepend(box);
  }

  paint();
})();
