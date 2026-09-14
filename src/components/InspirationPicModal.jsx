import React, { useEffect } from 'react';
import { X, ExternalLink, Quote, Sparkles, HelpCircle } from 'lucide-react';

export const InspirationPicModal = ({ isOpen, onClose, mode }) => {
  if (!isOpen) return null;

  const isCrazy = mode === 'crazy';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
          isCrazy 
            ? 'bg-slate-950 border-purple-800/60 shadow-[0_0_50px_rgba(168,85,247,0.3)]' 
            : 'bg-slate-900 border-slate-700 shadow-slate-950/90'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Original Inspiration & Viral Context</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-300">
          {/* Tweet Card Simulation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                DA
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">delian</span>
                  <span className="text-blue-400">✓</span>
                  <span className="text-xs text-slate-400">🇭🇺</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">@zebulgar</div>
              </div>
            </div>

            <p className="text-base text-slate-100 font-medium leading-snug">
              "Crazy how the EU is just a rounding error when it comes to large companies that were founded in the last 50 years"
            </p>
            <p className="text-base text-slate-100 font-medium leading-snug">
              "It's a museum as a continent and a museum as a stock market..."
            </p>

            {/* Embedded chart note */}
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-200">
                Chart in Tweet: "Public From-Scratch US and EU Companies Less than 50 Years Old with $10B+ Market Cap"
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Research & Visualization: Andrew McAfee (@amcafee), MIT Sloan School of Management
              </div>
            </div>
          </div>

          {/* Analytical Exploration Notes */}
          <div className="space-y-3 text-xs text-slate-300">
            <h4 className="font-bold text-white text-sm">Why We Built This Interactive App</h4>
            <p>
              The viral tweet highlights a real structural phenomenon—frequently referred to by Mario Draghi as Europe's "existential innovation crisis". However, static charts obscure vital economic nuances:
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-200">The 50-Year Cliff:</strong> In 2024, Germany's software crown jewel <span className="text-amber-300">SAP</span> was 52 years old (founded 1972). Moving our slider from 50 to 52 years instantly restores Europe's largest tech giant.
              </li>
              <li>
                <strong className="text-slate-200">The "From-Scratch" Constraint:</strong> Europe's semiconductor equipment titan <span className="text-emerald-300">ASML ($295B)</span> was founded in 1984, but began as a 50/50 joint venture between Philips and ASM International. Toggling "Include Spinoffs & JVs" completely reshapes Europe's presence.
              </li>
              <li>
                <strong className="text-slate-200">The Global Dimension:</strong> Innovation is not a bilateral US vs EU game. Including <span className="text-red-300">China</span>, <span className="text-emerald-300">Asia ex-China (TSMC)</span>, and <span className="text-purple-300">Rest of World (Shopify, Nubank)</span> gives a true 360° perspective of global capitalism.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
