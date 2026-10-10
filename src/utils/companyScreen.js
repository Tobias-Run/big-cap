import { displayRegion, regionLabel } from './regions.js';

// One definition for both the public screen and its exclusion explanations.
export function exclusionReasons(company, filters, currentYear) {
  const reasons = [];
  const age = currentYear - company.foundingYear;
  if (!filters.allAges && age > filters.ageThreshold) {
    reasons.push({ key: 'age', label: `Age ${age} exceeds the ${filters.ageThreshold}-year limit` });
  }
  if (company.marketCap < filters.minMarketCap) {
    reasons.push({ key: 'marketCap', label: `$${company.marketCap}B is below the $${filters.minMarketCap}B minimum` });
  }
  if (filters.sectorFilter !== 'all' && company.sector !== filters.sectorFilter) {
    reasons.push({ key: 'sector', label: `${company.sector} is outside the selected sector` });
  }
  if (filters.strictFromScratch && !company.isFromScratch) {
    const origin = { joint_venture: 'Joint venture', spinoff: 'Spinoff', merger: 'Merger' }[company.originType] || 'Non-greenfield origin';
    reasons.push({ key: 'origin', label: `${origin} is excluded by the from-scratch rule` });
  }
  const region = displayRegion(company.region, filters.includeNonEuEurope);
  if (!filters.selectedRegions.includes(region)) {
    reasons.push({ key: 'region', label: `${regionLabel(region, filters.includeNonEuEurope)} is not selected` });
  }
  return reasons;
}

// Return only the criteria that have to change. Keep the current geographic
// definition and select its actual destination instead of silently changing it.
export function inclusionChanges(company, filters, currentYear) {
  const changes = {};
  const age = currentYear - company.foundingYear;
  for (const { key } of exclusionReasons(company, filters, currentYear)) {
    if (key === 'age') {
      if (age > 100) changes.allAges = true;
      else changes.ageThreshold = age;
    }
    if (key === 'marketCap') changes.minMarketCap = Math.max(...[10, 25, 50, 100, 1000].filter(cap => cap <= company.marketCap));
    if (key === 'sector') changes.sectorFilter = company.sector;
    if (key === 'origin') changes.strictFromScratch = false;
    if (key === 'region') changes.selectedRegions = [...filters.selectedRegions, displayRegion(company.region, filters.includeNonEuEurope)];
  }
  return changes;
}

export function inclusionSummary(changes, includeNonEuEurope) {
  return Object.entries(changes).map(([key, value]) => {
    if (key === 'ageThreshold') return `Age limit → ${value} years`;
    if (key === 'allAges') return 'Age limit → All Ages';
    if (key === 'minMarketCap') return `Minimum → $${value}B`;
    if (key === 'sectorFilter') return `Sector → ${value}`;
    if (key === 'strictFromScratch') return 'Include spinoffs, joint ventures and mergers';
    if (key === 'selectedRegions') return `Add ${regionLabel(value.at(-1), includeNonEuEurope)}`;
    return key;
  });
}
