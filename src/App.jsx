import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ControlsBar } from './components/ControlsBar';
import { BubbleClusterView } from './components/BubbleClusterView';
import { RegionalKPICards } from './components/RegionalKPICards';
import { SearchableDataTable } from './components/SearchableDataTable';
import { TimelineView } from './components/TimelineView';
import { CompanyDetailModal } from './components/CompanyDetailModal';
import { DataLineageModal } from './components/DataLineageModal';
import { InspirationPicModal } from './components/InspirationPicModal';
import { CrazyEffectsOverlay } from './components/CrazyEffectsOverlay';
import { companiesData } from './data/companiesData';
import { audioSynth } from './utils/audioSynth';
import { Info, AlertCircle, Sparkles } from 'lucide-react';

function App() {
  // Mode: 'serious' (Institutional) or 'crazy' (Supernova)
  const [mode, setMode] = useState('serious');

  // Navigation tab: 'bubbles' | 'kpi' | 'timeline' | 'table'
  const [activeTab, setActiveTab] = useState('bubbles');

  // Interactive filter states
  const [ageThreshold, setAgeThreshold] = useState(50);
  const [allAges, setAllAges] = useState(false);

  // Selected markets to compare (default: US & EU as in original share pic)
  const [selectedRegions, setSelectedRegions] = useState(['US', 'EU']);

  // Methodology strictness toggles
  const [strictFromScratch, setStrictFromScratch] = useState(true);
  const [includeNonEuEurope, setIncludeNonEuEurope] = useState(false);

  // Additional filters
  const [minMarketCap, setMinMarketCap] = useState(10);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLineageOpen, setIsLineageOpen] = useState(false);
  const [isInspirationOpen, setIsInspirationOpen] = useState(false);

  // Audio mute state
  const [isMuted, setIsMuted] = useState(true);

  // Shockwave trigger counter
  const [supernovaTrigger, setSupernovaTrigger] = useState(0);

  // Toggle region selection
  const toggleRegion = (regionKey) => {
    setSelectedRegions(prev => {
      if (prev.includes(regionKey)) {
        if (prev.length === 1) return prev; // Keep at least one region selected
        return prev.filter(r => r !== regionKey);
      } else {
        return [...prev, regionKey];
      }
    });
  };

  // Reset all filters to default baseline
  const handleResetFilters = () => {
    setAgeThreshold(50);
    setAllAges(false);
    setSelectedRegions(['US', 'EU']);
    setStrictFromScratch(true);
    setIncludeNonEuEurope(false);
    setMinMarketCap(10);
    setSectorFilter('all');
    setSearchQuery('');
  };

  // Audio mute toggle handler
  const handleToggleMute = () => {
    const muted = audioSynth.toggleMute();
    setIsMuted(muted);
  };

  // Supernova burst trigger
  const handleSupernovaBurst = () => {
    setSupernovaTrigger(prev => prev + 1);
  };

  // Primary filtering pipeline
  const filteredCompanies = useMemo(() => {
    return companiesData.filter(company => {
      // 1. Age threshold
      if (!allAges) {
        const age = 2024 - company.foundingYear;
        if (age > ageThreshold) return false;
      }

      // 2. Minimum Market Cap
      if (company.marketCap < minMarketCap) return false;

      // 3. Sector filter
      if (sectorFilter === 'tech' && !company.isTech) return false;
      if (sectorFilter === 'non-tech' && company.isTech) return false;

      // 4. Strict from-scratch filter
      if (strictFromScratch && !company.isFromScratch) return false;

      // 5. Region selection & Europe geographic nuance
      const region = company.region;
      if (region === 'EUROPE_NON_EU') {
        if (!includeNonEuEurope) return false;
        if (!selectedRegions.includes('EU')) return false;
      } else {
        if (!selectedRegions.includes(region)) return false;
      }

      return true;
    });
  }, [ageThreshold, allAges, minMarketCap, sectorFilter, strictFromScratch, includeNonEuEurope, selectedRegions]);

  const isCrazy = mode === 'crazy';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${
      isCrazy 
        ? 'bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white' 
        : 'bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white'
    }`}>
      {/* Header */}
      <Header
        mode={mode}
        setMode={setMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLineage={() => setIsLineageOpen(true)}
        onOpenInspiration={() => setIsInspirationOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSupernovaBurst={handleSupernovaBurst}
      />

      {/* Global Interactive Controls Bar */}
      <ControlsBar
        ageThreshold={ageThreshold}
        setAgeThreshold={setAgeThreshold}
        allAges={allAges}
        setAllAges={setAllAges}
        selectedRegions={selectedRegions}
        toggleRegion={toggleRegion}
        strictFromScratch={strictFromScratch}
        setStrictFromScratch={setStrictFromScratch}
        includeNonEuEurope={includeNonEuEurope}
        setIncludeNonEuEurope={setIncludeNonEuEurope}
        minMarketCap={minMarketCap}
        setMinMarketCap={setMinMarketCap}
        sectorFilter={sectorFilter}
        setSectorFilter={setSectorFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetFilters={handleResetFilters}
        mode={mode}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1 flex flex-col">
        {/* Contextual Nuance Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
            ageThreshold === 50 && strictFromScratch && !includeNonEuEurope && selectedRegions.includes('EU')
              ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="leading-relaxed">
              <strong className="text-white">Active Screen Insight: </strong>
              {ageThreshold <= 50 && strictFromScratch ? (
                <span>
                  Under Andrew McAfee's strict 50-year from-scratch filter, Europe's <span className="text-white font-semibold">ASML ($295B)</span> is excluded (Philips 1984 JV) and <span className="text-white font-semibold">SAP ($250B)</span> is excluded (founded 1972 = 52 years old). Try dragging the slider to <strong>52 years</strong> or toggling <strong>"Include Spinoffs & JVs"</strong> to test how Europe's presence transforms!
                </span>
              ) : (
                <span>
                  Showing <strong>{filteredCompanies.length}</strong> qualifying companies across <strong>{selectedRegions.length}</strong> regions. Click any bubble or table row to inspect its incorporation lineage, founding history, and statutory SEC/prospectus citations.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab 1: Interactive Bubble Clusters */}
        {activeTab === 'bubbles' && (
          <div className="flex-1 flex flex-col justify-center py-4">
            <BubbleClusterView
              filteredCompanies={filteredCompanies}
              selectedRegions={selectedRegions}
              mode={mode}
              searchQuery={searchQuery}
              onSelectCompany={setSelectedCompany}
              supernovaTrigger={supernovaTrigger}
            />
          </div>
        )}

        {/* Tab 2: Regional Metrics & KPIs */}
        {activeTab === 'kpi' && (
          <RegionalKPICards
            filteredCompanies={filteredCompanies}
            selectedRegions={selectedRegions}
            mode={mode}
            onSelectCompany={setSelectedCompany}
          />
        )}

        {/* Tab 3: Cohort Timeline */}
        {activeTab === 'timeline' && (
          <TimelineView
            filteredCompanies={filteredCompanies}
            onSelectCompany={setSelectedCompany}
            mode={mode}
          />
        )}

        {/* Tab 4: Searchable Data Table */}
        {activeTab === 'table' && (
          <SearchableDataTable
            filteredCompanies={filteredCompanies}
            onSelectCompany={setSelectedCompany}
            mode={mode}
          />
        )}
      </main>

      {/* Crazy Mode Dynamic Overlays */}
      <CrazyEffectsOverlay
        mode={mode}
        onSupernovaBurst={handleSupernovaBurst}
        supernovaTrigger={supernovaTrigger}
      />

      {/* Modals & Slide-overs */}
      <CompanyDetailModal
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        mode={mode}
      />

      <DataLineageModal
        isOpen={isLineageOpen}
        onClose={() => setIsLineageOpen(false)}
        mode={mode}
      />

      <InspirationPicModal
        isOpen={isInspirationOpen}
        onClose={() => setIsInspirationOpen(false)}
        mode={mode}
      />
    </div>
  );
}

export default App;

