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
- **Regional KPIs & Ratios** — totals, high-tech share and the US:EU ratio
  under the currently active filters.
- **Cohort Timeline** — the same set grouped by founding era.
- **Inspectable Data Table & CSV** — every field, sortable, exportable.

Two visual modes: *Institutional* (restrained, follows your OS light/dark
setting) and *Supernova* (loud, always dark, makes noises if you unmute it).

## What the numbers are and are not

Market capitalisations are a **static curated snapshot** around late-2024
valuations. This is not a stock tracker and does not update with prices.
Company ages, by contrast, are computed against the current date, so the
50-year filter keeps moving — a company that qualified last year may not
this year. That asymmetry is deliberate and stated in the app.

The dataset is 76 hand-curated companies, not a complete screen of every
listed company above $10B. It is assembled to answer the <50-year
question; the "All Ages" and 100-year presets therefore produce totals
that omit many old giants and should be read as illustrative, not as
market aggregates.

Classification calls that are genuinely contested — Saudi Aramco's
concession origin, Linde's UK-vs-Ireland domicile, how to date a merged
company, whether fintech counts as high-tech — are documented in the app's
**Data Lineage** dossier rather than buried in the data.

## Development

```bash
npm install
npm run dev      # dev server
npm run lint     # oxlint
npm run build    # production build to dist/
npm run preview  # serve the built output
npm run deploy   # build and publish to gh-pages
```

Publishing goes through `npm run deploy` only. There is no deploy
workflow, so merging to `master` does not update the live site.

Stack: React 19, Vite 8, Tailwind 4, d3 (force simulation for the bubble
layout), oxlint. No test suite yet — the filter pipeline in `App.jsx` is
the part most worth covering first.

### Layout

```
src/
  App.jsx                 filter pipeline + layout; owns all filter state
  components/             one file per view, plus the three modals
  data/companiesData.js   the 76 companies
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
