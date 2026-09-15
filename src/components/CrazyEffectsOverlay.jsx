import React, { useEffect, useState } from 'react';
import { Flame, Sparkles, MessageSquare, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const WITTY_QUOTES = [
  "🏛️ Euro-Museum Mode: Active. Only centuries-old luxury conglomerates permitted beyond 50 years.",
  "🇳🇱 ASML was a 1984 Philips/ASM joint venture: Excluded by McAfee, crowned by semiconductor physics.",
  "🎂 Microsoft turns 50 in 2025: Aging out of the Arriviste Club!",
  "🇩🇪 Move age slider to 52 to summon SAP from the statistical void.",
  "⚡ NVIDIA alone exceeds the combined market valuation of several European national exchanges.",
  "🇹🇼 TSMC: Morris Chang's 1987 pure-play foundry gambit created the global chip ecosystem.",
  "🇬🇧 Post-Brexit Geography: ARM Holdings is in Cambridge, UK—toggle 'Broad Europe' to see it.",
  "🇧🇷 Nu Holdings (Nubank) & MercadoLibre: Latin America's tech champions rising in Rest of World."
];

export const CrazyEffectsOverlay = ({
  mode,
  onSupernovaBurst,
  supernovaTrigger
}) => {
  // Both hooks below must run before the `mode !== 'crazy'` early return:
  // React requires the same hooks to run on every render of this component.
  const [tickerIndex, setTickerIndex] = useState(0);

  // Rotate quotes every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % WITTY_QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Trigger cosmic confetti when supernova shockwave fires
  useEffect(() => {
    if (supernovaTrigger) {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#fbbf24']
      });
    }
  }, [supernovaTrigger]);

  if (mode !== 'crazy') return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-3 flex flex-col items-center">
      {/* Humorous / Insightful Debate Commentary Ticker */}
      <div className="pointer-events-auto max-w-2xl w-full bg-[var(--surf-0)]/90 border border-purple-800/60 rounded-full px-4 py-1.5 shadow-lg shadow-purple-950/80 backdrop-blur-md flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 font-bold font-mono text-[10px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
            <span>DEBATE RADAR</span>
          </span>

          <span className="text-[var(--text-1)] font-medium truncate transition-all duration-300">
            {WITTY_QUOTES[tickerIndex]}
          </span>
        </div>

        <button
          type="button"
          onClick={onSupernovaBurst}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-[10px] shadow-sm hover:scale-105 active:scale-95 transition-all"
          title="Cosmic Supernova Shockwave"
        >
          <Flame className="w-3 h-3" />
          <span>SHOCKWAVE</span>
        </button>
      </div>
    </div>
  );
};
