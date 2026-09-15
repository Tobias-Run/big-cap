import React from 'react';
import { CURRENT_YEAR } from '../utils/dateConstants';
import {
  TrendingUp, 
  Cpu, 
  Building, 
  Award, 
  ArrowRight,
  PieChart as PieIcon,
  Percent
} from 'lucide-react';

export const RegionalKPICards = ({ 
  filteredCompanies, 
  selectedRegions, 
  mode,
  onSelectCompany
}) => {
  const isCrazy = mode === 'crazy';

  // The stacked "Regional Value Share" bar genuinely needs some visual
  // differentiation between segments — but 5 unrelated saturated hues
  // (blue/amber/red/emerald/purple) reads as a rainbow, not a serious
  // chart. Institutional mode uses one alternating blue/neutral tonal
  // ramp instead; Supernova keeps the original per-region gradients.
  const regionNames = {
    US: { label: 'United States', flag: '🇺🇸', colorCrazy: 'from-blue-600 to-indigo-600', colorInstitutional: 'bg-[var(--accent-600)]' },
    EU: { label: 'European Union', flag: '🇪🇺', colorCrazy: 'from-amber-500 to-yellow-600', colorInstitutional: 'bg-[var(--border-3)]' },
    CHINA: { label: 'China', flag: '🇨🇳', colorCrazy: 'from-red-600 to-rose-600', colorInstitutional: 'bg-[var(--accent-400)]' },
    ASIA_EX_CHINA: { label: 'Asia ex-China', flag: '🌏', colorCrazy: 'from-emerald-600 to-teal-600', colorInstitutional: 'bg-[var(--text-4)]' },
    ROW: { label: 'Rest of World', flag: '🌐', colorCrazy: 'from-purple-600 to-pink-600', colorInstitutional: 'bg-[var(--accent-300)]' }
  };

  // Group companies by region
  const regionStats = selectedRegions.map(regionKey => {
    const list = filteredCompanies.filter(c => {
      if (regionKey === 'EU') {
        return c.region === 'EU' || c.region === 'EUROPE_NON_EU';
      }
      return c.region === regionKey;
    });

    const totalCap = list.reduce((acc, c) => acc + c.marketCap, 0);
    const techCount = list.filter(c => c.isTech).length;
    const techCap = list.filter(c => c.isTech).reduce((acc, c) => acc + c.marketCap, 0);
    const techSharePct = totalCap > 0 ? Math.round((techCap / totalCap) * 100) : 0;
    
    // Sort to find largest company
    const sorted = [...list].sort((a, b) => b.marketCap - a.marketCap);
    const largest = sorted[0] || null;

    // Median/avg age
    const ages = list.map(c => CURRENT_YEAR - c.foundingYear);
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

    return {
      key: regionKey,
      meta: regionNames[regionKey] || { label: regionKey, flag: '📍', colorCrazy: 'from-slate-600 to-slate-700', colorInstitutional: 'bg-[var(--border-3)]' },
      count: list.length,
      totalCap,
      techCount,
      techCap,
      techSharePct,
      largest,
      avgAge
    };
  });

  const totalSelectedCap = regionStats.reduce((acc, r) => acc + r.totalCap, 0);

  // Calculate US to EU ratio
  const usStats = regionStats.find(r => r.key === 'US');
  const euStats = regionStats.find(r => r.key === 'EU');
  const usToEuRatio = usStats && euStats && euStats.totalCap > 0 
    ? (usStats.totalCap / euStats.totalCap).toFixed(1) 
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner KPI Ratios */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isCrazy 
          ? 'bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-950 border-purple-800/50 shadow-lg shadow-purple-950/40' 
          : 'bg-[var(--surf-1)] border-[var(--border-1)] shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">
              Selected Cohort Overview
            </span>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-0)]">
                ${(totalSelectedCap / 1000).toFixed(2)} Trillion
              </span>
              <span className="text-sm text-[var(--text-3)]">
                ({filteredCompanies.length} qualifying public companies)
              </span>
            </div>
          </div>

          {usToEuRatio && (
            <div className="flex items-center gap-4 bg-[var(--surf-0)]/80 border border-[var(--border-1)] px-4 py-2 rounded-xl">
              <div className="text-center">
                <span className="text-[10px] uppercase font-mono text-[var(--text-3)]">US : EU Market Cap Ratio</span>
                <div className="text-xl font-bold text-amber-400">
                  {usToEuRatio}x
                </div>
              </div>
              <div className="h-8 w-px bg-[var(--surf-2)] hidden sm:block"></div>
              <div className="text-xs text-[var(--text-2)] max-w-xs leading-relaxed hidden sm:block">
                US arriviste cohort market cap is <strong className="text-amber-300">{usToEuRatio} times</strong> larger than the EU's under currently applied criteria.
              </div>
            </div>
          )}
        </div>

        {/* Global Regional Share Stacked Progress Bar */}
        <div className="mt-4 pt-3 border-t border-[var(--border-1)]/80">
          <div className="flex items-center justify-between text-xs text-[var(--text-3)] mb-1.5 font-mono">
            <span>Regional Value Share:</span>
            <span>100% Normalized</span>
          </div>

          <div className="h-3 w-full bg-[var(--surf-2)] rounded-full overflow-hidden flex shadow-inner">
            {regionStats.map(r => {
              const pct = totalSelectedCap > 0 ? (r.totalCap / totalSelectedCap) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={r.key}
                  style={{ width: `${pct}%` }}
                  className={`h-full transition-all duration-500 hover:brightness-125 ${
                    isCrazy ? `bg-gradient-to-r ${r.meta.colorCrazy}` : r.meta.colorInstitutional
                  }`}
                  title={`${r.meta.label}: ${pct.toFixed(1)}% ($${(r.totalCap/1000).toFixed(2)}T)`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-[var(--text-3)]">
            {regionStats.map(r => {
              const pct = totalSelectedCap > 0 ? (r.totalCap / totalSelectedCap) * 100 : 0;
              return (
                <div key={r.key} className="flex items-center gap-1.5">
                  <span className="text-sm">{r.meta.flag}</span>
                  <span className="font-medium text-[var(--text-1)]">{r.meta.label}:</span>
                  <span className="font-mono text-[var(--text-3)]">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Regional Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regionStats.map(r => {
          const capDisplay = r.totalCap >= 1000 
            ? `$${(r.totalCap / 1000).toFixed(2)}T` 
            : `$${r.totalCap.toFixed(0)}B`;

          return (
            <div 
              key={r.key}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 ${
                isCrazy 
                  ? 'bg-[var(--surf-1)]/80 border-[var(--border-1)] hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/50' 
                  : 'bg-[var(--surf-1)] border-[var(--border-1)] hover:border-[var(--border-2)]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{r.meta.flag}</span>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-0)] leading-tight">
                        {r.meta.label}
                      </h3>
                      <span className="text-xs text-[var(--text-3)] font-mono">
                        {r.count} {r.count === 1 ? 'Company' : 'Companies'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[var(--surf-0)] border border-[var(--border-1)] text-[var(--text-2)]">
                    {r.avgAge > 0 ? `Avg Age: ${r.avgAge}y` : 'No data'}
                  </span>
                </div>

                {/* Total Cap & Tech split */}
                <div className="space-y-3 my-4">
                  <div>
                    <span className="text-xs text-[var(--text-3)] uppercase font-mono tracking-wider">
                      Total Market Cap
                    </span>
                    <div className="text-2xl font-black text-[var(--text-0)]">
                      {capDisplay}
                    </div>
                  </div>

                  {/* Tech % Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-[var(--text-3)] mb-1">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        <span>High-Tech Share</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {r.techSharePct}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--surf-2)] rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${r.techSharePct}%` }} 
                        className="bg-emerald-500 rounded-full transition-all duration-500" 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-4)] mt-1 font-mono">
                      <span>Tech: {r.techCount}</span>
                      <span>Other: {r.count - r.techCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Largest Company Card */}
              {r.largest ? (
                <div 
                  onClick={() => onSelectCompany(r.largest)}
                  className="mt-2 pt-3 border-t border-[var(--border-1)]/80 cursor-pointer group flex items-center justify-between text-xs text-[var(--text-2)] hover:text-[var(--text-0)]"
                >
                  <div>
                    <span className="text-[10px] text-[var(--text-4)] uppercase font-mono block">Top Champion</span>
                    <span className="font-semibold text-[var(--text-0)] group-hover:text-[var(--accent-300)] transition-colors">
                      {r.largest.name}
                    </span>
                    <span className="text-[var(--text-3)] font-mono ml-1.5">
                      (${r.largest.marketCap >= 1000 ? `${(r.largest.marketCap/1000).toFixed(1)}T` : `${r.largest.marketCap}B`})
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-4)] group-hover:text-[var(--accent-400)] group-hover:translate-x-0.5 transition-all" />
                </div>
              ) : (
                <div className="mt-2 pt-3 border-t border-[var(--border-1)]/80 text-xs text-[var(--text-4)] italic">
                  No qualifying companies at this threshold.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
