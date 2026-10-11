import snapshot from './marketCapSnapshot.json' with { type: 'json' };

export const MARKET_CAP_AS_OF = snapshot.asOf;
export const MARKET_CAP_DATE_LABEL = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${MARKET_CAP_AS_OF}T00:00:00Z`));
export const marketCapSnapshot = snapshot;

export function withMarketCapSnapshot(company) {
  const observation = snapshot.companies[company.id];
  if (!observation || observation.asOf !== MARKET_CAP_AS_OF || observation.sourceDate !== MARKET_CAP_AS_OF) {
    throw new Error(`Missing exact ${MARKET_CAP_AS_OF} market capitalization for ${company.id}`);
  }
  return { ...company, marketCap: observation.marketCap, marketCapAsOf: observation.asOf, marketCapObservation: observation };
}
