/**
 * Research shortlist, not a verified current list of private companies.
 * Official sites are research starting points; source contents and current
 * listing status could not be verified during implementation (network 403).
 * Do not populate valuation without a dated primary-source statement.
 */
export const privateCompaniesData = [
  { id: 'mistral', name: 'Mistral AI', country: 'France', region: 'EU', sector: 'AI', focus: 'AI models and enterprise AI tools', sourceUrl: 'https://mistral.ai/' },
  { id: 'helsing', name: 'Helsing', country: 'Germany', region: 'EU', sector: 'Defence', focus: 'AI and software for defence', sourceUrl: 'https://helsing.ai/' },
  { id: 'celonis', name: 'Celonis', country: 'Germany', region: 'EU', sector: 'Enterprise software', focus: 'Process intelligence and enterprise software', sourceUrl: 'https://www.celonis.com/' },
  { id: 'personio', name: 'Personio', country: 'Germany', region: 'EU', sector: 'Enterprise software', focus: 'HR software for businesses', sourceUrl: 'https://www.personio.com/' },
  { id: 'revolut', name: 'Revolut', country: 'United Kingdom', region: 'EUROPE_NON_EU', sector: 'Fintech', focus: 'Digital financial services', sourceUrl: 'https://www.revolut.com/' },
  { id: 'monzo', name: 'Monzo', country: 'United Kingdom', region: 'EUROPE_NON_EU', sector: 'Fintech', focus: 'Digital banking', sourceUrl: 'https://monzo.com/' }
].map(company => ({
  ...company,
  researchStatus: 'pending',
  listingStatus: 'unverified',
  foundingYear: null,
  valuation: null
}));

// Valuation schema: amount (original currency), currency, asOf (ISO date),
// kind (e.g. funding round / secondary transaction), sourceUrl and uncertainty.
// A historical financing valuation must never be summed with public market caps.
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function hasSourcedValuation(company) {
  const v = company.valuation;
  return !!(v && Number.isFinite(v.amount) && v.amount > 0 && /^[A-Z]{3}$/.test(v.currency || '') && isValidDate(v.asOf) && v.kind && /^https:\/\//.test(v.sourceUrl || '') && v.uncertainty);
}

export function nextGenerationMatches(company, { query, broadEurope, sector }) {
  return (broadEurope || company.region === 'EU') &&
    (sector === 'all' || company.sector === sector) &&
    `${company.name} ${company.country} ${company.focus}`.toLowerCase().includes(query.trim().toLowerCase());
}
