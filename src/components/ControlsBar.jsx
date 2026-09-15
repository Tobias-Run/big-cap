import React from 'react';
import { CURRENT_YEAR } from '../utils/dateConstants';
import { audioSynth } from '../utils/audioSynth';
import {
  Sliders, 
  Globe2, 
  Check, 
  Search, 
  Layers, 
  HelpCircle, 
  RotateCcw,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

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

  const markets = [
    { key: 'US', label: 'United States', flag: '🇺🇸', color: 'border-blue-500 text-blue-300' },
    { key: 'EU', label: 'European Union', flag: '🇪🇺', color: 'border-yellow-500 text-yellow-300' },
    { key: 'CHINA', label: 'China', flag: '🇨🇳', color: 'border-red-500 text-red-300' },
    { key: 'ASIA_EX_CHINA', label: 'Asia ex-China', flag: '🌏', color: 'border-emerald-500 text-emerald-300' },
    { key: 'ROW', label: 'Rest of World', flag: '🌐', color: 'border-purple-500 text-purple-300' }
  ];

  const presets = [
    { label: 'McAfee 50-Yr Cutoff', age: 50, all: false, note: 'Viral baseline (1974-2024)' },
    { label: 'SAP Re-entry (52-Yr)', age: 52, all: false, note: 'Recovers SAP (1972)' },
    { label: 'Cloud & Social Era (20-Yr)', age: 20, all: false, note: 'Post-2004 winners' },
    { label: 'Mobile & AI Era (15-Yr)', age: 15, all: false, note: 'Post-2009 surge' },
    { label: 'Century Heritage (100-Yr)', age: 100, all: false, note: 'European legacy masters' },
    { label: 'All Historical Ages', age: 150, all: true, note: 'No age cutoff' }
  ];

  // Issue #5: 5 broad GICS-like sector categories (see companiesData.js
  // `sector` field). Kept independent of the isTech flag that drives bubble
  // fill color in the chart — some Healthcare/Consumer companies here are
  // isTech:true and vice versa, and this filter isn't meant to change that.
  const sectors = [
    { key: 'Technology', label: 'Technology', dotClass: 'bg-emerald-400', textClass: 'text-emerald-400', hoverClass: 'hover:bg-emerald-950/40', activeClass: 'bg-emerald-600 text-white' },
    { key: 'Consumer', label: 'Consumer', dotClass: 'bg-amber-400', textClass: 'text-amber-400', hoverClass: 'hover:bg-amber-950/40', activeClass: 'bg-amber-600 text-white' },
    { key: 'Healthcare', label: 'Healthcare', dotClass: 'bg-rose-400', textClass: 'text-rose-400', hoverClass: 'hover:bg-rose-950/40', activeClass: 'bg-rose-600 text-white' },
    { key: 'Financials', label: 'Financials', dotClass: 'bg-blue-400', textClass: 'text-blue-400', hoverClass: 'hover:bg-blue-950/40', activeClass: 'bg-blue-600 text-white' },
    { key: 'Industrials & Energy', label: 'Industrials & Energy', dotClass: 'bg-orange-400', textClass: 'text-orange-400', hoverClass: 'hover:bg-orange-950/40', activeClass: 'bg-orange-600 text-white' }
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
              <Sliders className="w-4 h-4 text-purple-400" />
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
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30' 
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
              className="w-full h-2 bg-[var(--surf-2)] rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />

            <div className="flex justify-between text-[10px] text-[var(--text-4)] font-mono">
              <span>5 yrs (2019)</span>
              <span>15 yrs (2009 Uber/Sea)</span>
              <span className="text-purple-400 font-semibold">50 yrs (1974 McAfee frontier)</span>
              <span className="text-amber-400 font-semibold">52 yrs (1972 SAP)</span>
              <span>75 yrs (1949)</span>
              <span>100+ yrs (1924)</span>
            </div>
          </div>
        </div>

        {/* ROW 2: Markets Inclusion & Methodology Toggles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Market Inclusion Multi-select Chips */}
          <div className="lg:col-span-7 bg-[var(--surf-1)]/90 border border-[var(--border-1)] rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-400" />
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
                        ? `bg-[var(--surf-2)]/90 ${m.color} shadow-sm border-current`
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
                <Layers className="w-3.5 h-3.5 text-amber-400" />
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
                      ? 'bg-purple-600 text-white' 
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
                  sectorFilter === 'all' ? 'bg-[var(--surf-3)] text-[var(--text-0)]' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                All
              </button>
              {sectors.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSectorFilter(s.key)}
                  className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                    sectorFilter === s.key ? s.activeClass : `${s.textClass} ${s.hoverClass}`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full inline-block ${s.dotClass}`}></span>
                  <span>{s.label}</span>
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
                className="w-full bg-[var(--surf-1)] border border-[var(--border-1)] rounded-lg pl-8 pr-3 py-1 text-xs text-[var(--text-0)] placeholder-[var(--text-4)] focus:outline-none focus:border-purple-500"
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
