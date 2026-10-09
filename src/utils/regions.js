// Dataset regions stay fixed; the geographic switch controls display grouping.
export function displayRegion(region, includeNonEuEurope) {
  return region === 'EUROPE_NON_EU' ? (includeNonEuEurope ? 'EU' : 'ROW') : region;
}

export function regionLabel(region, includeNonEuEurope, short = false) {
  if (region === 'EU') return includeNonEuEurope ? 'Europe' : (short ? 'EU' : 'European Union');
  if (region === 'ROW') return includeNonEuEurope ? 'Rest of World' : 'Rest of World incl. UK';
  return { US: short ? 'US' : 'United States', CHINA: 'China', ASIA_EX_CHINA: 'Asia ex-China' }[region] || region;
}
