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

  const regionNames = {
    US: { label: 'United States', flag: '🇺🇸', color: 'from-blue-600 to-indigo-600', text: 'text-blue-400' },
    EU: { label: 'European Union', flag: '🇪🇺', color: 'from-amber-500 to-yellow-600', text: 'text-yellow-400' },
    CHINA: { label: 'China', flag: '🇨🇳', color: 'from-red-600 to-rose-600', text: 'text-red-400' },
    ASIA_EX_CHINA: { label: 'Asia ex-China', flag: '🌏', color: 'from-emerald-600 to-teal-600', text: 'text-emerald-400' },
    ROW: { label: 'Rest of World', flag: '🌐', color: 'from-purple-600 to-pink-600', text: 'text-purple-400' }
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
      meta: regionNames[regionKey] || { label: regionKey, flag: '📍', color: 'from-slate-600 to-slate-700', text: 'text-slate-300' },
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
          : 'bg-slate-900 border-slate-800 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Selected Cohort Overview
            </span>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                ${(totalSelectedCap / 1000).toFixed(2)} Trillion
              </span>
              <span className="text-sm text-slate-400">
                ({filteredCompanies.length} qualifying public companies)
              </span>
            </div>
          </div>

          {usToEuRatio && (
            <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
              <div className="text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400">US : EU Market Cap Ratio</span>
                <div className="text-xl font-bold text-amber-400">
                  {usToEuRatio}x
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
              <div className="text-xs text-slate-300 max-w-xs leading-relaxed hidden sm:block">
                US arriviste cohort market cap is <strong className="text-amber-300">{usToEuRatio} times</strong> larger than the EU's under currently applied criteria.
              </div>
            </div>
          )}
        </div>

        {/* Global Regional Share Stacked Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>Regional Value Share:</span>
            <span>100% Normalized</span>
          </div>

          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            {regionStats.map(r => {
              const pct = totalSelectedCap > 0 ? (r.totalCap / totalSelectedCap) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={r.key}
                  style={{ width: `${pct}%` }}
                  className={`h-full bg-gradient-to-r ${r.meta.color} transition-all duration-500 hover:brightness-125`}
                  title={`${r.meta.label}: ${pct.toFixed(1)}% ($${(r.totalCap/1000).toFixed(2)}T)`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-slate-400">
            {regionStats.map(r => {
              const pct = totalSelectedCap > 0 ? (r.totalCap / totalSelectedCap) * 100 : 0;
              return (
                <div key={r.key} className="flex items-center gap-1.5">
                  <span className="text-sm">{r.meta.flag}</span>
                  <span className="font-medium text-slate-200">{r.meta.label}:</span>
                  <span className="font-mono text-slate-400">{pct.toFixed(1)}%</span>
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
                  ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/50' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{r.meta.flag}</span>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {r.meta.label}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {r.count} {r.count === 1 ? 'Company' : 'Companies'}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold bg-slate-950 border border-slate-800 ${r.meta.text}`}>
                    {r.avgAge > 0 ? `Avg Age: ${r.avgAge}y` : 'No data'}
                  </span>
                </div>

                {/* Total Cap & Tech split */}
                <div className="space-y-3 my-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                      Total Market Cap
                    </span>
                    <div className="text-2xl font-black text-white">
                      {capDisplay}
                    </div>
                  </div>

                  {/* Tech % Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        <span>High-Tech Share</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {r.techSharePct}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${r.techSharePct}%` }} 
                        className="bg-emerald-500 rounded-full transition-all duration-500" 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
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
                  className="mt-2 pt-3 border-t border-slate-800/80 cursor-pointer group flex items-center justify-between text-xs text-slate-300 hover:text-white"
                >
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Top Champion</span>
                    <span className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {r.largest.name}
                    </span>
                    <span className="text-slate-400 font-mono ml-1.5">
                      (${r.largest.marketCap >= 1000 ? `${(r.largest.marketCap/1000).toFixed(1)}T` : `${r.largest.marketCap}B`})
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              ) : (
                <div className="mt-2 pt-3 border-t border-slate-800/80 text-xs text-slate-500 italic">
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
