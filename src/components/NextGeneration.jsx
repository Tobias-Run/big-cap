import React, { useMemo, useState } from 'react';
import { privateCompaniesData, hasSourcedValuation, nextGenerationMatches } from '../data/privateCompaniesData';

export function NextGeneration() {
  const [query, setQuery] = useState('');
  const [broadEurope, setBroadEurope] = useState(false);
  const [sector, setSector] = useState('all');
  const companies = useMemo(() => privateCompaniesData.filter(company => nextGenerationMatches(company, { query, broadEurope, sector })), [query, broadEurope, sector]);
  return (
    <section aria-labelledby="next-generation-title" className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="rounded-2xl border border-[var(--border-1)] bg-[var(--surf-1)] p-5 space-y-3">
        <h2 id="next-generation-title" className="text-xl font-bold text-[var(--text-0)]">Europe’s Next Generation</h2>
        <p className="text-sm text-[var(--text-2)]">Explore candidates for a private-company research watchlist. Private financing valuations describe a transaction at a particular date; they are not stock-market capitalisations.</p>
        <p className="text-sm font-semibold text-[var(--text-1)]">Research preview: current listing status, founding dates and valuations have not been verified. Company links are starting points, not verified valuation citations. A candidate may since have listed or been acquired.</p>
        <p className="text-sm text-[var(--text-2)]">This small shortlist is not a complete European market screen. These profiles never enter the public-company chart, regional totals or public CSV. Public age and market-cap filters do not apply here.</p>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="min-w-0 flex-1 text-sm text-[var(--text-1)]">Search candidates<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Company, country or focus" className="block mt-1 w-full rounded-lg border border-[var(--border-2)] bg-[var(--surf-0)] p-2 text-[var(--text-0)]" /></label>
          <label className="text-sm text-[var(--text-1)]">Geography<select aria-label="Geography" value={broadEurope ? 'broad' : 'eu'} onChange={e => setBroadEurope(e.target.value === 'broad')} className="block mt-1 rounded-lg border border-[var(--border-2)] bg-[var(--surf-0)] p-2 text-[var(--text-0)]"><option value="eu">EU only</option><option value="broad">Broad Europe (including UK)</option></select></label>
          <label className="text-sm text-[var(--text-1)]">Sector<select aria-label="Sector" value={sector} onChange={e => setSector(e.target.value)} className="block mt-1 rounded-lg border border-[var(--border-2)] bg-[var(--surf-0)] p-2 text-[var(--text-0)]"><option value="all">All sectors</option>{[...new Set(privateCompaniesData.map(company => company.sector))].map(value => <option key={value}>{value}</option>)}</select></label>
          <button type="button" onClick={() => { setQuery(''); setBroadEurope(false); setSector('all'); }} className="rounded-lg border border-[var(--border-2)] px-3 py-2 text-sm text-[var(--text-1)]">Reset watchlist filters</button>
        </div>
        <p role="status" className="text-sm text-[var(--text-2)]">{companies.length} research candidates shown</p>
      </div>
      {companies.length === 0 && <p className="text-[var(--text-2)]">No candidates match these filters. Try Broad Europe or another sector.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companies.map(company => (
          <article key={company.id} className="min-w-0 rounded-2xl border border-[var(--border-1)] bg-[var(--surf-1)] p-5 space-y-3">
            <h3 className="text-lg font-bold text-[var(--text-0)]">{company.name}</h3>
            <p className="text-sm text-[var(--text-2)]">{company.country} · {company.sector}</p>
            <p className="text-sm text-[var(--text-1)]">{company.focus}</p>
            <dl className="text-sm text-[var(--text-2)] space-y-2">
              <div><dt className="font-semibold">Current listing status</dt><dd>Not verified — research candidate</dd></div>
              <div><dt className="font-semibold">Founded</dt><dd>{company.foundingYear ?? 'Not verified'}</dd></div>
              <div><dt className="font-semibold">Historical private valuation</dt><dd>{hasSourcedValuation(company) ? <><span>{new Intl.NumberFormat('en', { style: 'currency', currency: company.valuation.currency, maximumFractionDigits: 0 }).format(company.valuation.amount)}</span><br />{company.valuation.asOf} · {company.valuation.kind}<br />{company.valuation.uncertainty}<br /><a className="underline" href={company.valuation.sourceUrl} target="_blank" rel="noopener noreferrer">Valuation source</a></> : 'Not verified — no figure shown'}</dd></div>
            </dl>
            <a href={company.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block underline text-sm text-[var(--text-1)]">Research {company.name} on its official site ↗</a>
          </article>
        ))}
      </div>
    </section>
  );
}
