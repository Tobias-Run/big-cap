import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { CURRENT_YEAR } from './utils/dateConstants';

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
        const age = CURRENT_YEAR - company.foundingYear;
        if (age > ageThreshold) return false;
      }

      // 2. Minimum Market Cap
      if (company.marketCap < minMarketCap) return false;

      // 3. Sector filter (issue #5: 5 broad GICS-like categories, replacing
      // the old binary High-Tech/Other filter — bubble color still uses
      // isTech directly and is unaffected by this).
      if (sectorFilter !== 'all' && company.sector !== sectorFilter) return false;

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

  // Issue #6 (Supernova mode 2.0): a distinctive sound when the age slider's
  // movement makes a company pop in or out of the filtered set. Deliberately
  // keyed on [ageThreshold, allAges] only (not filteredCompanies itself,
  // which also changes from region/sector/search filters — those already
  // get their own dedicated sound, e.g. playRegionToggle in ControlsBar) so
  // this doesn't double up with them. Reading filteredCompanies.length
  // inside without listing it as a dependency is intentional here, same
  // pattern as the searchQuery/simulation split in BubbleClusterView.
  const prevAgeFilteredCountRef = useRef(null);
  useEffect(() => {
    const count = filteredCompanies.length;
    if (prevAgeFilteredCountRef.current !== null && prevAgeFilteredCountRef.current !== count) {
      audioSynth.playCompanyChange(count > prevAgeFilteredCountRef.current ? 'in' : 'out');
    }
    prevAgeFilteredCountRef.current = count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageThreshold, allAges]);

  const isCrazy = mode === 'crazy';

  // "Active Screen Insight" banner. The McAfee-baseline variant may only
  // claim ASML/SAP are excluded while that is actually true on screen:
  // `allAges` has to be off (the preset leaves ageThreshold at 50, so
  // checking the threshold alone used to keep the claim up while both
  // companies sat visible in the table), the strict from-scratch rule has
  // to be on, and the EU has to be among the selected regions at all.
  const showsMcAfeeBaseline =
    !allAges && ageThreshold <= 50 && strictFromScratch && selectedRegions.includes('EU');

  // Figures quoted in that banner come from the dataset rather than prose,
  // so they can't drift out of date the way the previously hardcoded
  // "1972 = 52 years old" did once ages started tracking the real year.
  const asml = companiesData.find(c => c.id === 'asml');
  const sap = companiesData.find(c => c.id === 'sap');
  const sapAge = CURRENT_YEAR - sap.foundingYear;
  const formatCap = (cap) => (cap >= 1000 ? `$${(cap / 1000).toFixed(2)}T` : `$${cap}B`);

  return (
    <div
      // Issue #7: Supernova always forces the dark palette; Institutional
      // follows the OS preference via the plain :root CSS rules in
      // index.css (no attribute needed for that case).
      data-theme={isCrazy ? 'dark' : undefined}
      data-mode={isCrazy ? 'crazy' : 'institutional'}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-500 bg-[var(--surf-0)] text-[var(--text-0)] ${
        isCrazy
          ? 'selection:bg-purple-500 selection:text-white'
          : 'selection:bg-blue-500 selection:text-white'
      }`}
    >

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
            showsMcAfeeBaseline
              ? 'bg-[var(--callout-amber-bg)] border-[var(--callout-amber-border)] text-[var(--callout-amber-text)]'
              : 'bg-[var(--surf-1)]/60 border-[var(--border-1)] text-[var(--text-3)]'
          }`}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="leading-relaxed">
              <strong className="text-[var(--text-0)]">Active Screen Insight: </strong>
              {showsMcAfeeBaseline ? (
                <span>
                  Under Andrew McAfee's strict {ageThreshold}-year from-scratch filter, Europe's{' '}
                  <span className="text-[var(--text-0)] font-semibold">{asml.name} ({formatCap(asml.marketCap)})</span>{' '}
                  is excluded ({asml.originType === 'joint_venture' ? 'Philips' : 'lineage'} {asml.foundingYear} JV) and{' '}
                  <span className="text-[var(--text-0)] font-semibold">{sap.name} ({formatCap(sap.marketCap)})</span>{' '}
                  is excluded (founded {sap.foundingYear} = {sapAge} years old). Try dragging the slider to{' '}
                  <strong>{sapAge} years</strong> or toggling <strong>"Include Spinoffs &amp; JVs"</strong> to
                  test how Europe's presence transforms.
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

      {/* Static-data disclaimer (issue #2): make it explicit this isn't a
          live feed before someone reads the age slider results as current
          prices. */}
      <footer className="border-t border-[var(--border-1)]/80 bg-[var(--surf-0)]/60 px-4 sm:px-6 lg:px-8 py-3">
        <p className="max-w-7xl mx-auto text-[11px] text-[var(--text-4)] text-center leading-relaxed">
          Not a stock tracker: market caps are a static, curated snapshot (see{' '}
          <button
            type="button"
            onClick={() => setIsLineageOpen(true)}
            className="underline decoration-dotted underline-offset-2 hover:text-[var(--text-2)]"
          >
            Data Lineage
          </button>
          {' '}for the reference date), not a live feed — day-to-day price moves aren't reflected here.
        </p>
      </footer>

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

