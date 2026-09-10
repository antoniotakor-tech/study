# Sorted — campus waste-sorting field study

A three-page site for the recycling project, deployed by the repository's existing
GitHub Pages workflow.

| Page | Path | What it's for |
| --- | --- | --- |
| Study | `recycling/index.html` | The dossier: context, question, method, findings, intervention, validation, sources |
| Survey | `recycling/survey.html` | The 14-question instrument you share |
| Share | `recycling/share.html` | QR code, copyable link, printable A5 poster |

Live at `https://<user>.github.io/study/recycling/` once `main` has deployed.

---

## 1. Before you share the QR code — required

The survey cannot save answers until you give it somewhere to send them. Until then it
tells visitors it isn't collecting yet, rather than silently dropping their responses.

Set **one** of the two values at the top of `recycling/assets/js/survey.js`, then push.
Nothing else needs changing — the page adapts its request format to whichever you pick.

### Option A — no account at all (fastest)

```js
var SURVEY_INBOX = 'you@example.com';
```

Responses arrive as email via [formsubmit.co](https://formsubmit.co), which requires no
signup. You click a confirmation link in the first email and it's live.

> **Trade-off:** the address sits in a public file, so bots will find it. Use a throwaway
> or an alias, never your main personal address. And an inbox of individual emails is
> tedious to analyse — if you expect more than about thirty responses, use Option B.

### Option B — a dashboard you can export (~2 minutes)

```js
var SURVEY_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
```

Works with [Formspree](https://formspree.io), [Basin](https://usebasin.com), or a Google
Apps Script web app (detected automatically and sent form-encoded, since Apps Script
sends no CORS headers). Responses land in a dashboard with CSV export, which is what you
want when it's time to fill in `data/results.json`.

`SURVEY_ENDPOINT` wins if both are set.

### Either way

Submit one test response yourself and confirm it arrives before you print anything.
If a submission fails at runtime the answers are kept in the respondent's browser rather
than lost — opening `survey.html?export=1` on that device offers them as CSV.

## 2. What you need to fill in

Every spot is marked `<!-- FILL: ... -->` in the HTML. Search for `FILL` to find them all.

```bash
grep -rn "FILL:" recycling/
```

| Where | What |
| --- | --- |
| `index.html` hero | Your programme, year and semester |
| `index.html` §02 | Your actual hypothesis |
| `index.html` §03 | Bin-audit locations, dates, sample sizes; interview count |
| `data/results.json` | **Your numbers.** Section 04 renders itself from this file — see below |
| `index.html` §05 | **The intervention.** What it is, why not the obvious alternative, what must be true, prototype images |
| `index.html` §07 | Your own sources and interview references |
| `survey.html` Q1 | Your campus's real building names |
| `share.html` poster | Your name, programme and contact email |

### Section 04 fills itself in

Section 04 holds four **pre-registered predictions** — each states what is expected and
the condition that would falsify it, written before collection opened. You do not write
results into the HTML by hand. Put the numbers in `recycling/data/results.json` and the
page renders them: the counts, the verdict badge (prediction held / failed), and the bar
charts for the barrier and trade-off questions.

Anything left `null` or `{}` stays as an empty state. The page cannot display a number
you did not measure, which is the point — it can't accidentally claim a result.

```jsonc
"gap": {
  "reported_separated_pct": 71,   // survey Q5, % reporting 3+ separations a week
  "observed_correct_pct": 34      // bin audit, % of scored items in the right stream
},
"barriers": {
  "counts": { "No bin nearby": 31, "In a hurry": 22 }   // Q7, free labels, any order
}
```

Label keys however you like — they're printed verbatim and sorted largest-first, with the
top bar emphasised.

**On predictions:** a prediction that fails is a better finding than one that holds, and
the page says so. If prediction 4 fails — if students correctly diagnose their own
constraint — write that up. It's the most interesting outcome available to this study.

## 3. Renaming the project

"Sorted" is a placeholder. To change it, replace the word in:

- the `<title>` and `og:title` of all three pages
- the `.wordmark` link in each page header
- the footer line in each page

## 4. What's already real

The context section is not filler — it cites published figures, and the citations in
§07 are live links:

- Household waste per inhabitant by stream, Netherlands 2024 (CBS)
- 8.2 billion kg collected; 456 kg per inhabitant; 149 kg residual
- ~60% of municipalities now sort residual waste after collection
- The value–action gap in student recycling (Chung & Leung, 2007)

If you cite these in your report, cite CBS and the paper directly — not this page.

## 5. Design notes

- **Palette** is green-biased throughout; the single accent is `--signal`, the orange
  used on Dutch PMD bins. It appears on the survey call to action and one figure only.
- **Chart colour** is deliberately single-hue. The stream chart shows magnitude, not
  identity, so it needs one hue with the residual bar emphasised — a four-colour
  categorical palette was tested and failed colour-blindness separation
  (red/green at equal lightness are indistinguishable under deuteranopia).
- Every chart has a **table view** — this is required relief for marks below 3:1
  contrast, and the accessible route to the same numbers.
- Three themes are handled: OS light, OS dark, and an explicit toggle that wins over both.

## 6. Local preview

```bash
python3 -m http.server 8099
# then open http://localhost:8099/recycling/
```

The QR code is generated from the page's own URL at runtime, so it is always correct
for wherever the site is served from. On `file://` it will encode a local path — open
the published URL before screenshotting the code.
