import React from 'react';
import { 
  Building2, 
  Sparkles, 
  FileText, 
  Volume2, 
  VolumeX, 
  BarChart3, 
  Table as TableIcon, 
  Clock, 
  CircleDot,
  ExternalLink,
  Flame
} from 'lucide-react';

export const Header = ({ 
  mode, 
  setMode, 
  isMuted, 
  onToggleMute, 
  onOpenLineage, 
  onOpenInspiration,
  activeTab,
  setActiveTab,
  onSupernovaBurst
}) => {
  const isCrazy = mode === 'crazy';

  return (
    <header className={`border-b transition-colors duration-500 ${
      isCrazy 
        ? 'bg-slate-950/80 border-purple-900/50 backdrop-blur-md shadow-[0_4px_30px_rgba(168,85,247,0.15)]' 
        : 'bg-slate-900/90 border-slate-800 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top bar with title and mode toggles */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
                isCrazy 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm shadow-purple-500/50 animate-pulse' 
                  : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50'
              }`}>
                {isCrazy ? <Sparkles className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                {isCrazy ? 'Supernova Cosmic View' : 'Institutional Macro Screen'}
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Andrew McAfee • MIT Sloan • Draghi Report 2024
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
              <span>Public From-Scratch Global Giants</span>
              <span className="text-sm font-normal text-slate-400 hidden sm:inline">
                ($10B+ Market Cap Dynamics)
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Adjust the age cutoff, spinoff/from-scratch rule, and region filters below to see which companies clear the $10B+ bar.
            </p>
          </div>

          {/* Right controls: Mode Switcher & Tools */}
          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
            {/* Mode Switcher Button */}
            <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => setMode('serious')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !isCrazy 
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🏛️</span>
                <span>Institutional</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('crazy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCrazy 
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md shadow-purple-500/40 border border-purple-400/30' 
                    : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/30'
                }`}
              >
                <span>🚀</span>
                <span>Supernova (Wild)</span>
              </button>
            </div>

            {/* Supernova blast button (in crazy mode) */}
            {isCrazy && (
              <button
                type="button"
                onClick={onSupernovaBurst}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform"
                title="Trigger a cosmic market shockwave"
              >
                <Flame className="w-3.5 h-3.5 animate-bounce" />
                <span>Shockwave</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={onToggleMute}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                !isMuted 
                  ? 'bg-purple-950/60 border-purple-700/60 text-purple-300 shadow-sm shadow-purple-900/50' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isMuted ? "Unmute cosmic synth audio feedback" : "Mute audio feedback"}
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Lineage & Citations Modal Button */}
            <button
              type="button"
              onClick={onOpenLineage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Data Lineage</span>
            </button>

            {/* Original Pic Reference Button */}
            <button
              type="button"
              onClick={onOpenInspiration}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="Inspect original tweet & graphic by Andrew McAfee & Delian"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Original Share Pic</span>
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('bubbles')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'bubbles'
                ? isCrazy
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Bubble Clusters</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kpi')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'kpi'
                ? isCrazy
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Regional KPIs & Ratios</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'timeline'
                ? isCrazy
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Cohort Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'table'
                ? isCrazy
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Inspectable Data Table & CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
