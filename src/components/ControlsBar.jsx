import React from 'react';
import { CURRENT_YEAR } from '../utils/dateConstants';
import { audioSynth } from '../utils/audioSynth';
import { Sliders, Globe2, Check, Search, Layers, RotateCcw } from 'lucide-react';

export const ControlsBar = ({
  ageThreshold,
  setAgeThreshold,
  allAges,
  setAllAges,
  selectedRegions,
  toggleRegion,
  strictFromScratch,
  setStrictFromScratch,
  includeNonEuEurope,
  setIncludeNonEuEurope,
  minMarketCap,
  setMinMarketCap,
  sectorFilter,
  setSectorFilter,
  searchQuery,
  setSearchQuery,
  onResetFilters,
  mode
}) => {
  const isCrazy = mode === 'crazy';
  const currentYear = CURRENT_YEAR;
  const cutOffYear = currentYear - ageThreshold;

  // One consistent chip style for every selected region (previously each
  // region had its own border/text hue — a rainbow that didn't encode any
  // real information the flag emoji wasn't already giving).
  const markets = [
    { key: 'US', label: 'United States', flag: '🇺🇸' },
    { key: 'EU', label: 'European Union', flag: '🇪🇺' },
    { key: 'CHINA', label: 'China', flag: '🇨🇳' },
    { key: 'ASIA_EX_CHINA', label: 'Asia ex-China', flag: '🌏' },
    { key: 'ROW', label: 'Rest of World', flag: '🌐' }
  ];

  // The SAP preset exists to demonstrate the one threshold at which
  // Europe's largest software company re-enters the screen, so its age has
  // to track SAP's actual age. Hardcoded at 52 it stopped doing its job in
  // 2025: at a 52-year cutoff SAP (1972) still measures older than the
  // cutoff allows, and the preset recovered nothing.
  const sapAge = currentYear - 1972;
  const presets = [
    { label: 'McAfee 50-Yr Cutoff', age: 50, all: false, note: `Viral baseline, rolling (${currentYear - 50}-${currentYear})` },
    { label: `SAP Re-entry (${sapAge}-Yr)`, age: sapAge, all: false, note: 'Recovers SAP (1972)' },
    { label: 'Cloud & Social Era (20-Yr)', age: 20, all: false, note: `Post-${currentYear - 20} winners` },
    { label: 'Mobile & AI Era (15-Yr)', age: 15, all: false, note: `Post-${currentYear - 15} surge` },
    { label: 'Century Heritage (100-Yr)', age: 100, all: false, note: 'European legacy masters' },
    { label: 'All Historical Ages', age: 150, all: true, note: 'No age cutoff' }
  ];

  // Issue #5: 5 broad GICS-like sector categories (see companiesData.js
  // `sector` field). Kept independent of the isTech flag that drives bubble
  // fill color in the chart — some Healthcare/Consumer companies here are
  // isTech:true and vice versa, and this filter isn't meant to change that.
  // One shared active/inactive style for all 5 (previously each had its own
  // dot + text hue — a rainbow the label text already made redundant).
  const sectors = [
    { key: 'Technology', label: 'Technology' },
    { key: 'Consumer', label: 'Consumer' },
    { key: 'Healthcare', label: 'Healthcare' },
    { key: 'Financials', label: 'Financials' },
    { key: 'Industrials & Energy', label: 'Industrials & Energy' }
  ];

  return (
    <div className={`border-b transition-colors ${
      isCrazy 
        ? 'bg-[var(--surf-0)]/70 border-purple-950/60' 
        : 'bg-[var(--surf-1)]/60 border-[var(--border-1)]/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* ROW 1: Age Threshold Slider & Presets */}
        <div className="bg-[var(--surf-1)]/90 border border-[var(--border-1)] rounded-xl p-3.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--accent-400)]" />
              <label htmlFor="age-slider" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-2)]">
                Company Age Threshold:
              </label>
              <span className="text-sm font-bold text-[var(--text-0)] px-2 py-0.5 rounded bg-[var(--surf-2)] border border-[var(--border-2)]">
                {allAges ? "All Ages (Any founding year)" : `≤ ${ageThreshold} Years Old`}
              </span>
              {!allAges && (
                <span className="text-xs text-[var(--text-3)]">
                  (Founded {cutOffYear} – {currentYear})
                </span>
              )}
            </div>

            {/* Quick age preset buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[var(--text-4)] uppercase font-mono mr-1">Presets:</span>
              {presets.map((p) => {
                const isActive = allAges ? p.all : (!p.all && ageThreshold === p.age);
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      if (p.all) {
                        setAllAges(true);
                      } else {
                        setAllAges(false);
                        setAgeThreshold(p.age);
                      }
                    }}
                    className={`text-[11px] px-2 py-1 rounded-md transition-all font-medium ${
                      isActive 
                        ? 'bg-[var(--accent-600)] text-white shadow-sm shadow-[var(--accent-500)]/30' 
                        : 'bg-[var(--surf-2)]/90 hover:bg-[var(--surf-3)] text-[var(--text-2)]'
                    }`}
                    title={p.note}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Range Slider and Milestone indicators */}
          <div className="space-y-1.5">
            <input
              id="age-slider"
              type="range"
              min="5"
              max="100"
              step="1"
              value={allAges ? 100 : ageThreshold}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                audioSynth.playSliderMove(newValue > ageThreshold ? 'up' : 'down');
                setAllAges(false);
                setAgeThreshold(newValue);
              }}
              className="w-full h-2 bg-[var(--surf-2)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/40"
            />

            {/* Every label is derived from CURRENT_YEAR rather than written
                out, because both halves of a label move. A fixed-age tick
                ("5 yrs") names a founding year that advances each year; a
                company-anchored tick (SAP 1972) keeps its year and its age
                advances instead. The McAfee frontier is the rolling
                50-year rule the rest of the app applies, not the fixed
                1974 of the original chart, so it moves with the fixed-age
                ticks. */}
            <div className="flex justify-between text-[10px] text-[var(--text-4)] font-mono">
              <span>5 yrs ({currentYear - 5})</span>
              <span>{currentYear - 2009} yrs (2009 Uber/Sea)</span>
              <span className="text-[var(--accent-400)] font-semibold">50 yrs ({currentYear - 50} McAfee frontier)</span>
              <span className="text-[var(--figure)] font-semibold">{currentYear - 1972} yrs (1972 SAP)</span>
              <span>75 yrs ({currentYear - 75})</span>
              <span>100+ yrs ({currentYear - 100})</span>
            </div>
          </div>
        </div>

        {/* ROW 2: Markets Inclusion & Methodology Toggles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Market Inclusion Multi-select Chips */}
          <div className="lg:col-span-7 bg-[var(--surf-1)]/90 border border-[var(--border-1)] rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-[var(--accent-400)]" />
                <span>Markets Included ({selectedRegions.length}):</span>
              </span>
              <span className="text-[11px] text-[var(--text-3)]">Click to toggle regional clusters</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {markets.map((m) => {
                const isSelected = selectedRegions.includes(m.key);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      // Mirrors App.jsx's toggleRegion "keep at least one
                      // region" guard: a remove-click on the last selected
                      // region is a no-op there, so skip the "removed"
                      // sound rather than announce a change that didn't
                      // happen.
                      if (isSelected) {
                        if (selectedRegions.length > 1) audioSynth.playRegionToggle(false);
                      } else {
                        audioSynth.playRegionToggle(true);
                      }
                      toggleRegion(m.key);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-[var(--accent-600)]/10 border-[var(--accent-500)] text-[var(--accent-400)] shadow-sm'
                        : 'bg-[var(--surf-0)]/60 border-[var(--border-1)]/90 text-[var(--text-4)] hover:text-[var(--text-2)]'
                    }`}
                  >
                    <span className="text-sm">{m.flag}</span>
                    <span>{m.label}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5 opacity-80" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lineage & Geography Nuance Toggles */}
          <div className="lg:col-span-5 bg-[var(--surf-1)]/90 border border-[var(--border-1)] rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--figure)]" />
                <span>Methodology Nuances:</span>
              </span>
              <span className="text-[11px] text-[var(--text-3)]">ASML / Spinoff & UK effects</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Strict From-Scratch Toggle */}
              <button
                type="button"
                onClick={() => setStrictFromScratch(!strictFromScratch)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                  strictFromScratch
                    ? 'bg-[var(--callout-emerald-bg)] border-[var(--callout-emerald-border)]/60 text-[var(--callout-emerald-text)]'
                    : 'bg-[var(--callout-amber-bg)] border-[var(--callout-amber-border)]/60 text-[var(--callout-amber-text)]'
                }`}
                title={strictFromScratch ? "Strict: Excludes JVs like ASML & Spinoffs like AbbVie/Ferrari" : "Permissive: Includes ASML, Ferrari, AbbVie, TSMC"}
              >
                <div className="truncate pr-1">
                  <div className="font-semibold truncate">
                    {strictFromScratch ? "From-Scratch Only" : "Include Spinoffs & JVs"}
                  </div>
                  <div className="text-[10px] opacity-75 truncate">
                    {strictFromScratch ? "McAfee/Draghi standard" : "Includes ASML, Ferrari"}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${strictFromScratch ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </button>

              {/* Broad Europe Toggle */}
              <button
                type="button"
                onClick={() => setIncludeNonEuEurope(!includeNonEuEurope)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                  includeNonEuEurope
                    ? 'bg-[var(--callout-blue-bg)] border-[var(--callout-blue-border)]/60 text-[var(--callout-blue-text)]'
                    : 'bg-[var(--surf-2)] border-[var(--border-2)] text-[var(--text-2)]'
                }`}
                title="Include non-EU European nations (UK, Switzerland, Norway) to observe ARM Holdings & AstraZeneca"
              >
                <div className="truncate pr-1">
                  <div className="font-semibold truncate">
                    {includeNonEuEurope ? "Broad Europe (inc UK)" : "Strict EU-27 Only"}
                  </div>
                  <div className="text-[10px] opacity-75 truncate">
                    {includeNonEuEurope ? "ARM Holdings included" : "Post-Brexit boundary"}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${includeNonEuEurope ? 'bg-blue-400' : 'bg-slate-400'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: Minimum Market Cap, Sector Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            {/* Minimum Market Cap Filter */}
            <div className="flex items-center gap-1.5 bg-[var(--surf-1)] border border-[var(--border-1)] rounded-lg px-2.5 py-1">
              <span className="text-[11px] font-semibold text-[var(--text-3)] uppercase">Min Cap:</span>
              {[10, 25, 50, 100, 1000].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setMinMarketCap(cap)}
                  className={`text-xs px-2 py-0.5 rounded font-mono font-medium transition-colors ${
                    minMarketCap === cap 
                      ? 'bg-[var(--accent-600)] text-white' 
                      : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
                  }`}
                  title={cap === 10 ? "McAfee $10B baseline" : cap === 100 ? "Draghi €100B milestone" : cap === 1000 ? "$1 Trillion Club" : ""}
                >
                  {cap === 1000 ? "$1T+" : `$${cap}B+`}
                </button>
              ))}
            </div>

            {/* Sector classification filter (issue #5: 5 broad GICS-like
                categories, replacing the old binary High-Tech/Other filter.
                Bubble color in the chart still comes from isTech directly
                and is unaffected — this is an additive filter dimension,
                not a recolor of the chart's existing legend). */}
            <div className="flex items-center gap-1.5 bg-[var(--surf-1)] border border-[var(--border-1)] rounded-lg px-2.5 py-1 flex-wrap">
              <span className="text-[11px] font-semibold text-[var(--text-3)] uppercase">Sector:</span>
              <button
                type="button"
                onClick={() => setSectorFilter('all')}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  sectorFilter === 'all' ? 'bg-[var(--accent-600)] text-white' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                All
              </button>
              {sectors.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSectorFilter(s.key)}
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${
                    sectorFilter === s.key ? 'bg-[var(--accent-600)] text-white' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar & reset */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[var(--text-3)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company or ticker..."
                className="w-full bg-[var(--surf-1)] border border-[var(--border-1)] rounded-lg pl-8 pr-3 py-1 text-xs text-[var(--text-0)] placeholder-[var(--text-4)] focus:outline-none focus:border-[var(--accent-500)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-3)] hover:text-[var(--text-0)]"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onResetFilters}
              className="p-1.5 rounded-lg border border-[var(--border-1)] bg-[var(--surf-1)] text-[var(--text-3)] hover:text-[var(--text-0)] hover:bg-[var(--surf-2)] text-xs transition-colors"
              title="Reset all filters to default McAfee 50-year baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
