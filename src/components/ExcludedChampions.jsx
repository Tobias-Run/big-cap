import React, { useMemo, useState } from 'react';
import { companiesData } from '../data/companiesData';
import { CURRENT_YEAR } from '../utils/dateConstants';
import { exclusionReasons, inclusionChanges, inclusionSummary } from '../utils/companyScreen';

export function ExcludedChampions({ filters, onInclude, onSelectCompany }) {
  const [query, setQuery] = useState('');
  const excluded = useMemo(() => companiesData.map(company => ({
    company,
    reasons: exclusionReasons(company, filters, CURRENT_YEAR),
    changes: inclusionChanges(company, filters, CURRENT_YEAR)
  })).filter(entry => entry.reasons.length > 0)
    .sort((a, b) => a.reasons.length - b.reasons.length || b.company.marketCap - a.company.marketCap), [filters]);
  const visible = excluded.filter(({ company }) => `${company.name} ${company.ticker}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section aria-labelledby="excluded-title" className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="bg-[var(--surf-1)] border border-[var(--border-1)] rounded-2xl p-5 space-y-3">
        <h2 id="excluded-title" className="text-xl font-bold text-[var(--text-0)]">Excluded Champions</h2>
        <p className="text-sm text-[var(--text-2)]">Who falls outside your current screen, and why? Explore the existing curated public-company dataset. This is not a complete global list.</p>
        <p className="text-sm text-[var(--text-2)]">Closest matches first: fewer criteria to change, then larger market cap. Every failing criterion is shown; geographic grouping follows your Europe switch.</p>
        <label className="block text-sm font-medium text-[var(--text-1)]" htmlFor="excluded-search">Find an excluded company</label>
        <input id="excluded-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Company or ticker" className="w-full sm:max-w-md rounded-lg border border-[var(--border-2)] bg-[var(--surf-0)] p-2 text-[var(--text-0)]" />
        <p role="status" className="text-sm text-[var(--text-2)]">{visible.length} shown · {excluded.length} excluded · {companiesData.length - excluded.length} included</p>
      </div>
      {visible.length === 0 && <p className="text-[var(--text-2)]">{excluded.length === 0 ? 'Every company in this curated dataset is included.' : 'No excluded companies match your search.'}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map(({ company, reasons, changes }) => (
          <article key={company.id} className="min-w-0 rounded-2xl border border-[var(--border-1)] bg-[var(--surf-1)] p-5 flex flex-col gap-3">
            <div><h3 className="font-bold text-lg text-[var(--text-0)]">{company.name}</h3><p className="text-sm text-[var(--text-2)] break-words">{company.ticker} · {company.country}</p></div>
            <p className="font-semibold text-[var(--text-1)]">${company.marketCap}B market cap · {CURRENT_YEAR - company.foundingYear} years old</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-2)]">{reasons.map(reason => <li key={reason.key}>{reason.label}</li>)}</ul>
            <div className="border-t border-[var(--border-1)] pt-3 mt-auto">
              <p className="text-sm font-semibold text-[var(--text-1)]">To include this company:</p>
              <ul className="list-disc pl-5 text-sm text-[var(--text-2)] mb-3">{inclusionSummary(changes, filters.includeNonEuEurope).map(text => <li key={text}>{text}</li>)}</ul>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => onInclude(changes)} aria-label={`Include ${company.name} in screen`} className="rounded-lg bg-[var(--accent-600)] text-white px-3 py-2 text-sm font-semibold">Include in screen</button>
                <button type="button" onClick={() => onSelectCompany(company)} aria-label={`Inspect excluded ${company.name}`} className="rounded-lg border border-[var(--border-2)] text-[var(--text-1)] px-3 py-2 text-sm">View dossier</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
