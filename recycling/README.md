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

1. Create a free form at [formspree.io](https://formspree.io) (or any endpoint that
   accepts a JSON `POST` — a Google Apps Script web app works too).
2. Open `recycling/assets/js/survey.js` and set the first line:

   ```js
   var SURVEY_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
   ```

3. Commit and push. Submit one test response yourself and confirm it arrives.

Responses are posted as JSON, one object per respondent, including a computed
`knowledge_score` (0–3) from the three sorting questions.

If a submission fails at runtime the answers are kept in the respondent's browser
instead of being lost. Opening `survey.html?export=1` on that device offers them as CSV.

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
| `index.html` §04 | **The four findings.** Replace each "Awaiting data" block with a real one |
| `index.html` §05 | **The intervention.** What it is, why not the obvious alternative, what must be true, prototype images |
| `index.html` §07 | Your own sources and interview references |
| `survey.html` Q1 | Your campus's real building names |
| `share.html` poster | Your name, programme and contact email |

Keep the shape of each findings block: **a claim, the number behind it, and which
instrument produced it.** That structure is what makes it read as evidence.

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
