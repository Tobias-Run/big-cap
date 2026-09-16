import React from 'react';
import { useModalA11y } from '../utils/useModalA11y';
import { X, Quote } from 'lucide-react';

export const InspirationPicModal = ({ isOpen, onClose, mode }) => {
  // Escape, focus trap, focus restore and body scroll lock. Must run before
  // the `!isOpen` early return below: React requires the same hooks to run on
  // every render of this component.
  const dialogRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const isCrazy = mode === 'crazy';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspiration-dialog-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all outline-none ${
          isCrazy 
            ? 'bg-[var(--surf-0)] border-purple-800/60 shadow-[0_0_50px_rgba(168,85,247,0.3)]' 
            : 'bg-[var(--surf-1)] border-[var(--border-2)] shadow-slate-950/90'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-1)] bg-[var(--surf-0)] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-[var(--accent-400)]" />
            <h2 id="inspiration-dialog-title" className="text-base font-bold text-[var(--text-0)]">Original Inspiration & Viral Context</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspiration panel"
            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text-0)] hover:bg-[var(--surf-2)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-sm text-[var(--text-2)]">
          {/* Tweet Card Simulation */}
          <div className="p-4 rounded-xl bg-[var(--surf-0)] border border-[var(--border-1)] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                DA
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--text-0)]">delian</span>
                  <span className="text-blue-400">✓</span>
                  <span className="text-xs text-[var(--text-3)]">🇭🇺</span>
                </div>
                <div className="text-xs text-[var(--text-3)] font-mono">@zebulgar</div>
              </div>
            </div>

            <p className="text-base text-[var(--text-0)] font-medium leading-snug">
              "Crazy how the EU is just a rounding error when it comes to large companies that were founded in the last 50 years"
            </p>
            <p className="text-base text-[var(--text-0)] font-medium leading-snug">
              "It's a museum as a continent and a museum as a stock market..."
            </p>

            {/* Embedded chart note */}
            <div className="p-3.5 rounded-lg bg-[var(--surf-1)] border border-[var(--border-1)] text-xs space-y-1">
              <div className="font-bold text-[var(--text-1)]">
                Chart in Tweet: "Public From-Scratch US and EU Companies Less than 50 Years Old with $10B+ Market Cap"
              </div>
              <div className="text-[var(--text-3)] font-mono text-[11px]">
                Research & Visualization: Andrew McAfee (@amcafee), MIT Sloan School of Management
              </div>
            </div>
          </div>

          {/* Analytical Exploration Notes */}
          <div className="space-y-3 text-xs text-[var(--text-2)]">
            <h4 className="font-bold text-[var(--text-0)] text-sm">Why We Built This Interactive App</h4>
            <p>
              The viral tweet highlights a real structural phenomenon—frequently referred to by Mario Draghi as Europe's "existential innovation crisis". However, static charts obscure vital economic nuances:
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-[var(--text-3)]">
              <li>
                <strong className="text-[var(--text-1)]">The 50-Year Cliff:</strong> Germany's software crown jewel <span className="text-[var(--figure)]">SAP</span> was founded in 1972 — 52 years old when the Draghi report landed, and a year older every year since. Widening the age slider past its current age instantly restores Europe's largest tech giant.
              </li>
              <li>
                <strong className="text-[var(--text-1)]">The "From-Scratch" Constraint:</strong> Europe's semiconductor equipment titan <span className="text-emerald-300">ASML ($295B)</span> was founded in 1984, but began as a 50/50 joint venture between Philips and ASM International. Toggling "Include Spinoffs & JVs" completely reshapes Europe's presence.
              </li>
              <li>
                <strong className="text-[var(--text-1)]">The Global Dimension:</strong> Innovation is not a bilateral US vs EU game. Including <span className="text-[var(--text-1)] font-semibold">China</span>, <span className="text-[var(--text-1)] font-semibold">Asia ex-China (TSMC)</span>, and <span className="text-[var(--text-1)] font-semibold">Rest of World (Shopify, Nubank)</span> gives a true 360° perspective of global capitalism.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[var(--surf-0)] border-t border-[var(--border-1)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--surf-2)] hover:bg-[var(--surf-3)] text-[var(--text-1)] text-xs font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
