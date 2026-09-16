import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { CURRENT_YEAR } from '../utils/dateConstants';

export const TimelineView = ({ 
  filteredCompanies, 
  onSelectCompany, 
  mode 
}) => {
  const isCrazy = mode === 'crazy';

  const eras = [
    {
      id: 'ai_mobile',
      title: 'Mobile, Cloud & AI Era',
      years: '2004 – Present',
      minYear: 2004,
      maxYear: CURRENT_YEAR,
      colorCrazy: 'border-pink-500 bg-pink-950/20 text-pink-300',
      badge: 'Current Era',
      description: 'The era of hyperscale clouds, smartphones, electric autonomous vehicles, and generative AI platforms.'
    },
    {
      id: 'dotcom',
      title: 'Dot-Com & Web Infrastructure',
      years: '1994 – 2003',
      minYear: 1994,
      maxYear: 2003,
      colorCrazy: 'border-purple-500 bg-purple-950/20 text-purple-300',
      badge: 'Web 1.0 & 2.0',
      description: 'The emergence of the commercial World Wide Web, global e-commerce marketplaces, and modern search engines.'
    },
    {
      id: 'pc_silicon',
      title: 'PC & Microprocessor Revolution',
      years: '1980 – 1993',
      minYear: 1980,
      maxYear: 1993,
      colorCrazy: 'border-emerald-500 bg-emerald-950/20 text-emerald-300',
      badge: 'Silicon Boom',
      description: 'The personal computing explosion, commercial software packaging, and the birth of dedicated semiconductor foundries (TSMC, ASML).'
    },
    {
      id: 'early_tech',
      title: 'Dawn of Silicon Valley & ERP',
      years: '1968 – 1979',
      minYear: 1968,
      maxYear: 1979,
      colorCrazy: 'border-amber-500 bg-amber-950/20 text-amber-300',
      badge: '50-Year Horizon',
      description: 'The foundation of modern enterprise software and semiconductors. Features the 50-year cliff (SAP 1972, Microsoft 1975, Apple 1976).'
    },
    {
      id: 'legacy',
      title: 'Century-Old Heritage Champions',
      years: 'Pre-1968',
      // No lower bound (issue #3: "enhance timeline to infinite"). The old
      // hardcoded `1800` was an invisible ceiling: a company founded before
      // 1800 wouldn't match ANY era and would silently vanish from this
      // view entirely, contradicting the "Pre-1968" label right above,
      // which already promises no floor. -Infinity makes that promise true
      // regardless of how old a future data entry is, with no code change.
      minYear: -Infinity,
      maxYear: 1967,
      colorCrazy: 'border-blue-500 bg-blue-950/20 text-blue-300',
      badge: 'Historical Masters',
      description: 'Europe and the world\'s enduring legacy industrial, consumer, and pharmaceutical giants (Siemens 1847, L\'Oréal 1909, Novo Nordisk 1923).'
    }
  ];

  const eraData = useMemo(() => {
    return eras.map(era => {
      const companiesInEra = filteredCompanies.filter(
        c => c.foundingYear >= era.minYear && c.foundingYear <= era.maxYear
      );

      const totalCap = companiesInEra.reduce((acc, c) => acc + c.marketCap, 0);
      const sorted = [...companiesInEra].sort((a, b) => b.marketCap - a.marketCap);

      return {
        ...era,
        companies: sorted,
        count: sorted.length,
        totalCap
      };
    });
  }, [filteredCompanies]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-[var(--surf-1)] border border-[var(--border-1)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[var(--accent-400)]" />
          <h2 className="text-base font-bold text-[var(--text-0)]">Cohort Timeline & Epoch Breakdown</h2>
        </div>
        <p className="text-xs text-[var(--text-3)]">
          Observe how each founding wave concentrated value. Notice how moving the age slider truncates older epochs from right to left.
        </p>
      </div>

      <div className="space-y-4">
        {eraData.map(era => {
          return (
            <div 
              key={era.id}
              className={`rounded-2xl border p-5 transition-all ${
                isCrazy 
                  ? 'bg-[var(--surf-0)]/80 border-[var(--border-1)] hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-950/40' 
                  : 'bg-[var(--surf-1)] border-[var(--border-1)]'
              }`}
            >
              {/* Era Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${isCrazy ? era.colorCrazy : 'border-[var(--border-2)] bg-[var(--surf-2)] text-[var(--text-2)]'}`}>
                    {era.years}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-0)]">
                    {era.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-3)] font-mono">
                    {era.count} {era.count === 1 ? 'Company' : 'Companies'}
                  </span>
                  <span className="text-sm font-black text-[var(--figure)] font-mono">
                    ${(era.totalCap / 1000).toFixed(2)}T Total
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-3)] mb-4">
                {era.description}
              </p>

              {/* Company chips */}
              {era.companies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {era.companies.map(c => {
                    const capLabel = c.marketCap >= 1000 
                      ? `$${(c.marketCap / 1000).toFixed(1)}T` 
                      : `$${c.marketCap.toFixed(0)}B`;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onSelectCompany(c)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all hover:scale-105 ${
                          c.isTech
                            ? 'bg-[var(--callout-emerald-bg)] border-[var(--callout-emerald-border)]/80 hover:brightness-95'
                            : 'bg-[var(--callout-blue-bg)] border-[var(--callout-blue-border)]/80 hover:brightness-95'
                        }`}
                      >
                        <span className="font-semibold text-[var(--text-0)]">{c.name}</span>
                        <span className="text-[10px] text-[var(--text-3)] font-mono">({c.foundingYear})</span>
                        <span className="text-[var(--figure)] font-mono font-bold">{capLabel}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-4)] italic">
                  No qualifying companies active in this epoch under current filter parameters.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
