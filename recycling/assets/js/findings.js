/* Sorted — renders section 04 results from data/results.json.
   Nothing here invents a number. A null or missing value leaves the block in
   its empty state, so the page can never claim a result that wasn't measured. */
(function () {
  'use strict';

  var slots = document.querySelectorAll('[data-result]');
  if (!slots.length) return;

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function has(v) { return v !== null && v !== undefined && v !== ''; }

  function verdict(held) {
    return '<span class="pred__verdict pred__verdict--' + (held ? 'held' : 'failed') + '">' +
      (held ? 'Prediction held' : 'Prediction failed') + '</span>';
  }

  /* Counts object → single-hue bar chart, largest first, top bar emphasised. */
  function bars(counts, total) {
    var rows = Object.keys(counts)
      .filter(function (k) { return k.charAt(0) !== '_'; })
      .map(function (k) { return [k, Number(counts[k]) || 0]; })
      .sort(function (a, b) { return b[1] - a[1]; });
    if (!rows.length) return '';
    var max = rows[0][1] || 1;
    return '<div class="barchart">' + rows.map(function (r, i) {
      var pct = Math.round((r[1] / max) * 1000) / 10;
      var share = total ? ' (' + Math.round((r[1] / total) * 100) + '%)' : '';
      return '<div class="bar' + (i === 0 ? ' bar--lead' : '') + '">' +
        '<span class="bar__name">' + esc(r[0]) + '</span>' +
        '<span class="bar__track"><span class="bar__fill" style="width:' + pct + '%"></span>' +
        '<span class="bar__val">' + r[1] + share + '</span></span></div>';
    }).join('') + '</div>';
  }

  function outcome(inner) { return '<div class="pred__outcome">' + inner + '</div>'; }
  function figures(html) { return '<p class="pred__figures">' + html + '</p>'; }

  var RENDER = {
    gap: function (d) {
      if (!has(d.reported_separated_pct) || !has(d.observed_correct_pct)) return '';
      var gap = Math.round((d.reported_separated_pct - d.observed_correct_pct) * 10) / 10;
      return outcome(verdict(Math.abs(gap) > 10)) +
        figures('<strong>' + d.reported_separated_pct + '%</strong> reported separating against ' +
          '<strong>' + d.observed_correct_pct + '%</strong> measured correct in the bins — ' +
          'a gap of <strong>' + gap + '</strong> percentage points.');
    },
    calibration: function (d) {
      if (!has(d.mean_confidence_of_5) || !has(d.mean_score_of_3)) return '';
      var held = has(d.correlation_r) ? Math.abs(d.correlation_r) < 0.5 : null;
      var html = (held === null ? '' : outcome(verdict(held))) +
        figures('Mean confidence <strong>' + d.mean_confidence_of_5 + '/5</strong> against a mean ' +
          'knowledge score of <strong>' + d.mean_score_of_3 + '/3</strong>' +
          (has(d.correlation_r) ? ', correlating at <strong>r = ' + d.correlation_r + '</strong>' : '') + '.');
      var errs = d.item_error_pct || {};
      var live = {};
      Object.keys(errs).forEach(function (k) { if (has(errs[k])) live[k] = errs[k]; });
      if (Object.keys(live).length) {
        html += '<p class="figure__note" style="margin-top:var(--s-3)">Error rate by item (%)</p>' + bars(live, null);
      }
      return html;
    },
    barriers: function (d) {
      var c = d.counts || {};
      var keys = Object.keys(c).filter(function (k) { return k.charAt(0) !== '_'; });
      if (!keys.length) return '';
      var total = keys.reduce(function (a, k) { return a + (Number(c[k]) || 0); }, 0);
      var top = keys.sort(function (a, b) { return c[b] - c[a]; })[0];
      var attitudinal = /care|pointless/i.test(top);
      return outcome(verdict(!attitudinal)) +
        figures('Most-cited single barrier: <strong>' + esc(top) + '</strong>' +
          (total ? ' (' + Math.round((c[top] / total) * 100) + '% of ' + total + ' responses)' : '') + '.') +
        bars(c, total);
    },
    tradeoff: function (d) {
      var q12 = d.q12_counts || {}, q13 = d.q13_counts || {};
      var k12 = Object.keys(q12).filter(function (k) { return k.charAt(0) !== '_'; });
      var k13 = Object.keys(q13).filter(function (k) { return k.charAt(0) !== '_'; });
      if (!k12.length && !k13.length) return '';
      var html = '';
      if (k13.length) {
        var top13 = k13.sort(function (a, b) { return q13[b] - q13[a]; })[0];
        html += outcome(verdict(!/10\s*m|proximity|bin within/i.test(top13)));
      }
      if (k12.length) {
        html += '<p class="figure__note" style="margin-top:var(--s-3)">Q12 — what they would actually do</p>' +
          bars(q12, k12.reduce(function (a, k) { return a + (Number(q12[k]) || 0); }, 0));
      }
      if (k13.length) {
        html += '<p class="figure__note" style="margin-top:var(--s-4)">Q13 — the change they ask for</p>' +
          bars(q13, k13.reduce(function (a, k) { return a + (Number(q13[k]) || 0); }, 0));
      }
      return html;
    }
  };

  fetch('./data/results.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('no data file'); return r.json(); })
    .then(function (data) {
      var counts = data.counts || {};
      document.querySelectorAll('[data-n]').forEach(function (el) {
        var k = el.getAttribute('data-n');
        var v = k === 'audit' ? counts.audit_items : counts[k];
        if (has(v)) el.textContent = v;
      });

      slots.forEach(function (slot) {
        var key = slot.getAttribute('data-result');
        var fn = RENDER[key];
        var html = '';
        try { html = fn && data[key] ? fn(data[key]) : ''; } catch (e) { html = ''; }
        if (html) slot.innerHTML = html;
      });
    })
    .catch(function () { /* no data yet — the empty states already in the HTML stand */ });
})();
