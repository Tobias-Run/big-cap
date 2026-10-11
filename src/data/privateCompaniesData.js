/**
 * Research shortlist, not a verified current list of private companies.
 * Two financing announcements were checked on 2026-10-11. Other figures
 * and current listing status remain unverified; this is not a live feed.
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

const assessments = {
  mistral: { opportunity: 'A European AI infrastructure and software champion serving international enterprises.', hurdle: 'Prove durable paid demand and sustainable economics despite expensive compute and global competition.', milestone: 'Look for recurring revenue, customer retention and audited cash-flow disclosure before calling this an IPO-ready champion.' },
  helsing: { opportunity: 'A European defence-software and AI supplier with potential demand beyond its home market.', hurdle: 'Long procurement cycles, export controls and execution on hardware/software delivery.', milestone: 'Look for contracted revenue, successful deployments and a durable order book.' },
  celonis: { opportunity: 'An international enterprise-software platform built around process intelligence.', hurdle: 'Demonstrate continued growth, product differentiation and defensible economics as enterprise AI evolves.', milestone: 'Look for audited revenue, retention and cash-generation evidence.' },
  personio: { opportunity: 'A European HR-software platform addressing repeatable business workflows.', hurdle: 'Show efficient growth and differentiation in a competitive software market.', milestone: 'Look for recurring revenue quality, retention and an improving profitability trajectory.' },
  revolut: { opportunity: 'A digital-finance group with potential to scale across multiple national markets.', hurdle: 'Sustain regulatory compliance, service quality and earnings as its footprint expands.', milestone: 'Look for audited profit quality, successful licensed-market launches and a stated listing plan.' },
  monzo: { opportunity: 'A digital bank with potential to turn customer adoption into a durable banking franchise.', hurdle: 'Prove sustainable banking economics and successful expansion beyond core markets.', milestone: 'Look for audited profitability, deposits, credit quality and a stated listing plan.' }
};
const sourcedValuations = {
  mistral: { amount: 21e9, qualifier: 'more than', currency: 'EUR', asOf: '2026-09-08', kind: 'Series D post-money financing valuation', sourceUrl: 'https://mistral.ai/news/mistral-makes-sovereign-open-weight-ai-to-frontier/', uncertainty: 'Company-reported lower bound; financing valuation, not a traded market cap. Publication date is listed in the company news index.', evidence: 'The announcement reports €3B raised, operations in 20 countries and 125+ enterprise customers. These are company-reported statements.' },
  helsing: { amount: 18e9, currency: 'USD', asOf: '2026-07-13', kind: 'Series E financing valuation', sourceUrl: 'https://helsing.ai/newsroom/helsing-raises-1-8bn-in-series-e', uncertainty: 'Company-reported transaction valuation; not a live price or proof of IPO readiness.', evidence: 'The dated press release reports $1.8B raised and a company valuation of $18B.' }
};
for (const company of privateCompaniesData) {
  company.assessment = assessments[company.id];
  company.valuation = sourcedValuations[company.id] || null;
  company.sourceCheckedAt = company.valuation ? '2026-10-11' : null;
  company.researchStatus = company.valuation ? 'financing-source-checked' : 'pending';
}

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
