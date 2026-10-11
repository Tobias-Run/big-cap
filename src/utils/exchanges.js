// These are recorded listings from the curated ticker strings, not a live
// primary-listing registry. Preserve all parenthesised groups (e.g. TSMC).
export function recordedExchanges(ticker) {
  const names = [...ticker.matchAll(/\(([^)]+)\)/g)].flatMap(match => match[1].split('/')).map(value => {
    const name = value.trim().replace(/\s+\d+$/, '');
    return ({ 'Shenzhen': 'SZSE', 'STAR Market': 'SSE STAR Market', 'Euronext AMS': 'Euronext Amsterdam', 'Euronext BRU': 'Euronext Brussels' })[name] || name;
  });
  return [...new Set(names.length ? names : ['Listing not recorded'])];
}

export function exchangeInstances(companies) {
  return companies.flatMap(company => {
    const exchanges = recordedExchanges(company.ticker);
    return exchanges.map(exchange => ({ ...company, id: `${company.id}@${exchange}`, companyId: company.id, exchange, listingCount: exchanges.length }));
  });
}
