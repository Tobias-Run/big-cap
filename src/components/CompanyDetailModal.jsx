import React from 'react';
import { CURRENT_YEAR } from '../utils/dateConstants';
import { useModalA11y } from '../utils/useModalA11y';
import { X, ExternalLink, MapPin, FileCheck, Users, Layers } from 'lucide-react';

export const CompanyDetailModal = ({ company, onClose, mode }) => {
  // Escape, focus trap, focus restore and body scroll lock. Must run before
  // the `!company` early return below: React requires the same hooks to run
  // on every render of this component.
  const dialogRef = useModalA11y(Boolean(company), onClose);

  if (!company) return null;

  const isCrazy = mode === 'crazy';
  const age = CURRENT_YEAR - company.foundingYear;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-dialog-title"
        tabIndex={-1}
        // Clicks inside must not reach the backdrop handler above.
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-all outline-none ${
          isCrazy
            ? 'bg-[var(--surf-0)] border-purple-800/60 shadow-[0_0_50px_rgba(168,85,247,0.3)]'
            : 'bg-[var(--surf-1)] border-[var(--border-2)] shadow-slate-950/80'
        }`}
      >
        {/* Header bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          company.isTech
            ? 'bg-[var(--callout-emerald-bg)] border-[var(--callout-emerald-border)]/40'
            : 'bg-[var(--callout-blue-bg)] border-[var(--callout-blue-border)]/40'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{company.countryCode === 'US' ? '🇺🇸' : company.countryCode === 'DE' ? '🇩🇪' : company.countryCode === 'NL' ? '🇳🇱' : company.countryCode === 'CN' ? '🇨🇳' : company.countryCode === 'TW' ? '🇹🇼' : '🌐'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="company-dialog-title" className="text-xl font-bold text-[var(--text-0)]">{company.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  company.isTech
                    ? 'bg-[var(--callout-emerald-bg)] text-[var(--callout-emerald-text)] border border-[var(--callout-emerald-border)]/40'
                    : 'bg-[var(--callout-blue-bg)] text-[var(--callout-blue-text)] border border-[var(--callout-blue-border)]/40'
                }`}>
                  {company.isTech ? 'High-Tech' : 'Other Industry'}
                </span>
              </div>
              <div className="text-xs text-[var(--text-3)] font-mono">
                {company.ticker} • {company.industry}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close company dossier"
            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text-0)] hover:bg-[var(--surf-2)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--surf-0)]/60 p-3.5 rounded-xl border border-[var(--border-1)]">
            <div>
              <span className="text-[10px] text-[var(--text-4)] uppercase font-mono block">Market Cap</span>
              <span className="text-lg font-black text-[var(--figure)]">
                ${company.marketCap >= 1000 ? `${(company.marketCap / 1000).toFixed(2)}T` : `${company.marketCap}B`}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[var(--text-4)] uppercase font-mono block">Founding Year</span>
              <span className="text-lg font-bold text-[var(--text-1)]">
                {company.foundingYear}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[var(--text-4)] uppercase font-mono block">Company Age</span>
              <span className="text-lg font-bold text-[var(--accent-300)]">
                {age} Years
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[var(--text-4)] uppercase font-mono block">IPO Year</span>
              <span className="text-lg font-bold text-[var(--text-1)]">
                {company.ipoYear || 'Private / N/A'}
              </span>
            </div>
          </div>

          {/* Lineage & Origin dossier */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--figure)]" />
              <span>Entity Origin & Corporate Lineage:</span>
            </span>

            <div className="p-3.5 rounded-xl bg-[var(--surf-0)]/80 border border-[var(--border-1)] space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                  company.isFromScratch 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                }`}>
                  {company.originType === 'from_scratch' ? '✓ From-Scratch Greenfield Startup' : 
                   company.originType === 'joint_venture' ? '⚖️ Joint Venture of Pre-existing Titans' : 
                   company.originType === 'spinoff' ? '✂️ Corporate Carve-out / Spinoff' : '🔄 Merger of Pre-existing Firms'}
                </span>
              </div>

              <p className="text-sm text-[var(--text-2)] leading-relaxed">
                {company.originDetails}
              </p>
            </div>
          </div>

          {/* Founders & Headquarters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[var(--surf-0)]/60 border border-[var(--border-1)]">
              <span className="text-[10px] text-[var(--text-4)] uppercase font-mono flex items-center gap-1 mb-1">
                <Users className="w-3 h-3 text-[var(--accent-400)]" />
                <span>Founders / Architects</span>
              </span>
              <span className="font-semibold text-[var(--text-1)]">
                {company.founders || 'Founding consortium'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surf-0)]/60 border border-[var(--border-1)]">
              <span className="text-[10px] text-[var(--text-4)] uppercase font-mono flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-[var(--accent-400)]" />
                <span>Headquarters / Country</span>
              </span>
              <span className="font-semibold text-[var(--text-1)]">
                {company.headquarters || `${company.country}`}
              </span>
            </div>
          </div>

          {/* Primary Source Citation */}
          <div className="p-3.5 rounded-xl bg-[var(--callout-blue-bg)] border border-[var(--callout-blue-border)]/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--callout-blue-text)] flex items-center gap-1.5 uppercase tracking-wider">
                <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Cited Source</span>
              </span>
            </div>

            <p className="text-xs text-[var(--text-2)] font-mono">
              {company.citation}
            </p>

            {company.citationUrl && (
              <a
                href={company.citationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline pt-1"
              >
                {/* Most links here are investor-relations / EDGAR browse
                    pages, not a direct link to the specific historical
                    filing named above — see the Data Lineage modal. */}
                <span>Visit Company IR / Regulator Filings Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[var(--surf-0)]/80 border-t border-[var(--border-1)]/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--surf-2)] hover:bg-[var(--surf-3)] text-[var(--text-1)] text-xs font-semibold transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
