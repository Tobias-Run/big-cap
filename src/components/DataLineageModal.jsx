import React, { useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  FileText, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { sourcesMetadata } from '../data/sourcesMetadata';

export const DataLineageModal = ({ isOpen, onClose, mode }) => {
  // Must run before the `!isOpen` early return below: React requires the
  // same hooks to run on every render of this component.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const isCrazy = mode === 'crazy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
          isCrazy 
            ? 'bg-[var(--surf-0)] border-purple-800/60 shadow-[0_0_60px_rgba(168,85,247,0.3)]' 
            : 'bg-[var(--surf-1)] border-[var(--border-2)] shadow-slate-950/90'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-1)] bg-[var(--surf-0)] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[var(--accent-400)]" />
            <div>
              <h2 className="text-lg font-bold text-[var(--text-0)]">Data Lineage & Methodology Dossier</h2>
              <span className="text-xs text-[var(--text-3)] font-mono">
                Provenance, Historical Criteria & Contested Classifications
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text-0)] hover:bg-[var(--surf-2)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-[var(--text-2)] leading-relaxed">
          {/* Snapshot disclaimer (issue #2): this app is not a live feed. */}
          <div className="p-3.5 rounded-xl bg-[var(--callout-amber-bg)] border border-[var(--callout-amber-border)]/40 text-xs text-[var(--callout-amber-text)] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-[var(--callout-amber-text)]">Not a stock tracker.</strong> Market
              capitalizations are a static snapshot curated around late-2024 valuations,
              not a live feed — they do not update with daily price moves. Company ages
              and the 50-year filter, by contrast, recalculate live against today's date.
            </p>
          </div>

          {/* Section 1: The Landmark Draghi Report */}
          <div className="p-4 rounded-xl bg-[var(--surf-0)]/80 border border-[var(--border-1)] space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-[var(--text-0)]">
                The Mario Draghi European Competitiveness Report (September 2024)
              </h3>
            </div>

            <blockquote className="border-l-4 border-amber-500 pl-4 py-1 italic text-[var(--callout-amber-text)] bg-[var(--callout-amber-bg)] rounded-r-lg">
              "{sourcesMetadata.landmarkReport.keyQuote}"
            </blockquote>

            <p className="text-xs text-[var(--text-3)]">
              Published by the European Commission, the Draghi Report underscored how Europe's capital markets lack the late-stage depth required to scale "arriviste" companies into continental and global scale.
            </p>

            <div className="flex items-center gap-1.5 pt-1">
              <a
                href={sourcesMetadata.landmarkReport.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 hover:underline"
              >
                <span>Read Official European Commission Report</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 2: Andrew McAfee's MIT Sloan Research */}
          <div className="p-4 rounded-xl bg-[var(--surf-0)]/80 border border-[var(--border-1)] space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[var(--accent-400)]" />
              <h3 className="text-base font-bold text-[var(--text-0)]">
                Andrew McAfee's 'Arriviste' & 'From-Scratch' Criteria
              </h3>
            </div>

            <p>
              In his book <em>The Geek Way</em> and Substack newsletter, MIT Sloan Principal Research Scientist Andrew McAfee plotted publicly traded companies founded in the last 50 years with a market cap ≥ $10 Billion USD:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[var(--surf-1)]/90 p-3 rounded-lg border border-[var(--border-1)]">
                <span className="font-semibold text-[var(--text-0)] block mb-1">1. "From-Scratch" Definition</span>
                <span>Entities formed as greenfield enterprises without prior corporate parents. Explicitly excludes spinoffs, demergers, and joint ventures.</span>
              </div>

              <div className="bg-[var(--surf-1)]/90 p-3 rounded-lg border border-[var(--border-1)]">
                <span className="font-semibold text-[var(--text-0)] block mb-1">2. 50-Year Horizon Cutoff</span>
                <span>Evaluated at 2024, restricting qualifying cohorts to entities founded in 1974 or later (leaving SAP at 1972 just outside the line).</span>
              </div>

              <div className="bg-[var(--surf-1)]/90 p-3 rounded-lg border border-[var(--border-1)]">
                <span className="font-semibold text-[var(--text-0)] block mb-1">3. HQ at IPO Geographic Rule</span>
                <span>Companies are grouped by where their executive headquarters were established at the time of their initial public offering.</span>
              </div>

              <div className="bg-[var(--surf-1)]/90 p-3 rounded-lg border border-[var(--border-1)]">
                <span className="font-semibold text-[var(--text-0)] block mb-1">4. High-Tech vs Other Taxonomy</span>
                <span>Green bubbles denote software, semiconductors, internet retail, and communications hardware; Blue denotes all other industries.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Contested Classifications Breakdown */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[var(--text-0)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Contested Classifications & Caveats</span>
            </h3>

            <div className="space-y-2.5">
              {sourcesMetadata.methodologyLineage.contestedClassifications.map((item) => (
                <div key={item.company} className="p-3.5 rounded-xl bg-[var(--surf-0)]/60 border border-[var(--border-1)]">
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <span className="font-bold text-[var(--text-0)]">{item.company}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--surf-2)] text-[var(--callout-amber-text)] font-mono">
                      {item.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-2)]">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Data Processing Pipeline */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[var(--text-0)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Four-Stage Verification Pipeline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sourcesMetadata.methodologyLineage.pipelineSteps.map((step) => (
                <div key={step.step} className="p-3 rounded-xl bg-[var(--surf-0)]/60 border border-[var(--border-1)] text-xs">
                  <span className="font-mono text-[var(--accent-400)] font-bold block mb-1">
                    Stage {step.step}: {step.name}
                  </span>
                  <span className="text-[var(--text-3)]">
                    {step.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Authoritative Sources Directory */}
          <div className="p-4 rounded-xl bg-[var(--surf-0)]/90 border border-[var(--border-1)] space-y-2.5">
            <h3 className="text-xs font-bold text-[var(--text-0)] uppercase tracking-wider font-mono">
              Primary Registries & Citations
            </h3>

            <div className="divide-y divide-[var(--border-1)] text-xs">
              {sourcesMetadata.authoritativeSources.map((source) => (
                <div key={source.name} className="py-2 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-[var(--text-1)] block">{source.name}</span>
                    <span className="text-[var(--text-3)]">{source.citation}</span>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[var(--text-3)] hover:text-[var(--text-0)] flex-shrink-0"
                    title={`Visit ${source.name}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[var(--text-4)] pt-1 border-t border-[var(--border-1)]/80 mt-1">
              Note: per-company citation links (in each company's dossier) mostly point to
              the company's investor-relations page or SEC EDGAR filing browser for that
              entity, not a direct link to the specific historical document named in the
              citation text — several predate EDGAR's own coverage, which starts in the
              early-to-mid 1990s.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[var(--surf-0)] border-t border-[var(--border-1)] flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-[var(--text-4)] font-mono">
            Open-source interactive replication • MIT License
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--surf-2)] hover:bg-[var(--surf-3)] text-[var(--text-1)] text-xs font-semibold transition-colors"
          >
            Close Lineage Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
