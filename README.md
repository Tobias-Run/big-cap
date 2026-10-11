# big-cap

An interactive screen for the claim that Europe has produced no large
companies from scratch in the last fifty years — the Draghi Report's
finding, and the Andrew McAfee chart that went viral off the back of it.

The point of the app is not to repeat that claim but to make it testable.
The headline result depends heavily on where you draw three lines: how old
a company may be, what counts as "from scratch", and whether the UK is
part of Europe for this purpose. Move any of them and the picture changes.
So all three are controls, not assumptions.

**Live:** https://Tobias-Run.github.io/big-cap

## Views

- **Interactive Bubble Clusters** — companies as bubbles, area proportional
  to market cap, grouped by region. Green is high-tech, blue everything
  else, following the taxonomy of the original chart. A dashed lasso marks
  non-EU European companies when "Broad Europe" is on.
  Region headings follow the geographic switch: Strict EU groups non-EU
  European companies with Rest of World (incl. UK); Broad Europe groups them
  with Europe. The legend explains the non-EU outline and Supernova links.
  Hovering or focusing a bubble shows the listing information already recorded
  in its ticker (including multiple exchanges where available). These are
  curated snapshot listings, not a live or exhaustive listing feed.
- **Stock Exchange Clusters** — the filtered public companies grouped at every
  exchange documented in their ticker. Multiple listings repeat a company's
  full market cap; listing appearances must not be summed. Public totals and
  CSV still count unique companies. Recorded listings are not a live registry.
- **Regional KPIs & Ratios** — totals, high-tech share and the US:EU ratio
  under the currently active filters.
- **Cohort Timeline** — the same set grouped by founding era.
- **Inspectable Data Table & CSV** — every field, sortable, exportable.

Two visual modes: *Institutional* (restrained, follows your OS light/dark
setting) and *Supernova* (loud, always dark, makes noises if you unmute it).

## New exploration views

- **Excluded Champions** explains every criterion excluding a company from
  the current public screen. Results rank by the number of failing criteria,
  then market cap. Each card previews the necessary filter changes and can
  apply them to return to the chart. The shared rules live in
  `src/utils/companyScreen.js`; geography follows the existing EU/Europe rule.
- **Europe’s Next Generation** is a separate research watchlist with its own
  search, geography and sector controls. Six candidates include editorial
  assessments of potential, hurdles and evidence to watch. Financing records
  for Mistral and Helsing were checked against company announcements on
  2026-10-11; other valuations, founding dates and current listing status remain
  unverified. Mistral's reported value is a lower bound, not an exact value.
  Every figure shows its original currency, transaction date, source and
  uncertainty; no cross-currency totals are produced. Private research entries
  never enter public charts, totals or CSV.

A private valuation record requires an amount in the original currency,
`asOf` date, transaction `kind`, primary `sourceUrl`, and an `uncertainty` note.
Financing valuations are historical transaction observations, not public market
capitalisations; profiles can subsequently IPO or be acquired.

## What the numbers are and are not

Market capitalisations are a **dated snapshot at 30 September 2026**,
expressed in USD. All 92 companies have an exact daily historical observation
from Stock Analysis (Nasdaq Data Link or S&P Global Market Intelligence, as identified per historical series). This is not a stock tracker and does not update with prices.
Company ages, by contrast, are computed against the current date, so the
50-year filter keeps moving — a company that qualified last year may not
this year. That asymmetry is deliberate and stated in the app.

The dataset is 92 hand-curated companies, not a complete screen of every
listed company above $10B. It is assembled to answer the <50-year
question; the "All Ages" and 100-year presets therefore produce totals
that omit many old giants and should be read as illustrative, not as
market aggregates.

Classification calls that are genuinely contested — Saudi Aramco's
concession origin, Linde's UK-vs-Ireland domicile, how to date a merged
company, whether fintech counts as high-tech — are documented in the app's
**Data Lineage** dossier rather than buried in the data.

## September 2026 snapshot and recent IPOs

The additions are SpaceX, Cerebras, Z.ai/Zhipu, MiniMax, CoreWeave, Circle,
Figma, Klarna, Chime, Reddit, Astera Labs, Rubrik, Raspberry Pi, Galderma,
Puig and Verisure. Listed companies stay separate from the private research
watchlist. IPO admission dates and founding-year exceptions appear in dossiers.

The standard $10B floor still applies. **All sizes** includes smaller IPOs such
as Klarna ($4.70B) and Raspberry Pi ($1.78B). Being a recent IPO does not mean
being a new business: Puig was founded in 1914; Galderma is a joint venture;
Verisure and Raspberry Pi have institutional parent origins. Z.ai's university
spinout is explicitly excluded by the strict greenfield rule. Reddit follows
its independent 2005 founding, with subsequent acquisition/separation disclosed.
Klarna follows its Swedish operating origin and principal IPO-era facilities,
with its London registered parent disclosed as a geographic exception.

The complete audit trail is in
[data/market-cap-snapshots/2026-09-30.json](data/market-cap-snapshots/2026-09-30.json):
original currency and value, exact observation date, FX rate/source, retrieval
time and SHA-256 fingerprint of the fetched page. Non-USD caps use same-day ECB
reference rates via Frankfurter v1; SAR uses Frankfurter v2's dated USD/SAR rate.
The app ships a smaller projection in `src/data/marketCapSnapshot.json`; tests
check it against the audit file. Values retain six decimal places in USD billions
for calculation; the UI rounds to two decimal places. CSV exports retain dates,
local values, FX rates and source links.

Reproduce the snapshot with Python 3 and curl:

```bash
python scripts/fetch-market-cap-snapshot.py --date 2026-09-30
```

Downloaded evidence is cached in `/tmp/big-cap-market-cap-evidence`. Use a fresh
`--cache-dir` to re-fetch. The importer fails if any company lacks an exact date
or supported currency; it never substitutes a current cap, interpolates adjacent
dates or uses IPO valuations. Market caps follow the provider's historical
shares-outstanding methodology, and FX rates are daily reference rates, not
synchronized exchange-closing ticks. The original 2024 Draghi/McAfee observations
remain historical context and are not restated as September 2026 facts.

## Development

```bash
npm install
npm run dev      # dev server
npm run lint     # oxlint
npm test         # filter/exclusion and private-data invariants
npm run build    # production build to dist/
npm run preview  # serve the built output
npm run deploy   # build and publish to gh-pages
```

Publishing goes through `npm run deploy` only. There is no deploy
workflow, so merging to `master` does not update the live site.

Stack: React 19, Vite 8, Tailwind 4, d3 (force simulation for the bubble
layout), oxlint. Node tests cover the shared screen/exclusion rules and private-research data
invariants. Run `npm test`; browser checks remain important for the interactive
chart and dialogs.

### Chart labels and scale

Region headings follow each cluster's actual bubble envelope on simulation
updates and search nearby positions that avoid bubbles and other headings.
They render above the bubble layer with a readable background as a fallback
in crowded layouts. The scale legend occupies its own space below the chart.
Its circles share the chart's zero-based square-root radius scale, so areas
remain proportional to market cap in both visual modes.

### Layout

```
src/
  App.jsx                 filter pipeline + layout; owns all filter state
  components/             one file per view, plus the three modals
  data/companiesData.js   76 established companies + 16 recent IPOs
  data/sourcesMetadata.js methodology, sources, contested classifications
  utils/dateConstants.js  CURRENT_YEAR — the single source of "now"
  utils/useModalA11y.js   focus trap, scroll lock, focus restore for dialogs
  utils/audioSynth.js     Web Audio synthesis for Supernova mode
```

Theming runs on CSS custom properties in `index.css`, on two independent
axes. `--surf-*`, `--text-*`, `--border-*`, `--figure` and `--callout-*`
flip with light/dark (OS preference, or a `data-theme="dark"` override).
`--accent-*` flips with the Institutional/Supernova mode via a `data-mode`
attribute. Both attributes live on the app root.

Prefer those over hardcoded Tailwind color classes when adding UI. A
literal like `text-amber-300` is a dark-mode value and will be unreadable
on the light surfaces — `--figure` is the token for numeric emphasis
(market caps, totals, ratios). The exception is an element sitting on an
explicitly dark background in both themes, where the literal is correct.

## Credits

Based on research by Andrew McAfee (MIT Sloan) and the European
Commission's 2024 report on European competitiveness by Mario Draghi.
Not affiliated with either.

## License

MIT — see [LICENSE](LICENSE).
