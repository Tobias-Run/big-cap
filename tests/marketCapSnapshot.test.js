import test from 'node:test';
import assert from 'node:assert/strict';
import audit from '../data/market-cap-snapshots/2026-09-30.json' with { type: 'json' };
import sources from '../data/market-cap-snapshots/sources.json' with { type: 'json' };
import { companiesData } from '../src/data/companiesData.js';
import { recentIposData } from '../src/data/recentIposData.js';
import { MARKET_CAP_AS_OF, MARKET_CAP_DATE_LABEL, withMarketCapSnapshot } from '../src/data/marketCapSnapshot.js';
import { exclusionReasons, inclusionChanges } from '../src/utils/companyScreen.js';
import { exchangeInstances } from '../src/utils/exchanges.js';

const company = id => companiesData.find(c => c.id === id);

test('all public companies use complete, exact-date audited observations', () => {
  assert.equal(MARKET_CAP_AS_OF, '2026-09-30');
  assert.equal(MARKET_CAP_DATE_LABEL, '30 September 2026');
  assert.equal(companiesData.length, 92);
  assert.equal(new Set(companiesData.map(c => c.id)).size, 92);
  assert.deepEqual(audit.missing, {});
  assert.deepEqual(Object.keys(audit.companies).sort(), companiesData.map(c => c.id).sort());
  for (const c of companiesData) {
    const observation = audit.companies[c.id];
    assert.equal(c.marketCapAsOf, '2026-09-30');
    assert.equal(observation.sourceDate, '2026-09-30');
    assert.ok(Number.isFinite(c.marketCap) && c.marketCap > 0);
    assert.equal(observation.sourceUrl, sources[c.id]);
    assert.ok(['nasdaq', 'spg'].includes(observation.provider));
    assert.ok(observation.providerUrl.startsWith('https://'));
    assert.match(observation.evidenceSha256, /^[a-f0-9]{64}$/);
    assert.ok(Math.abs(c.marketCap - observation.localMarketCap * observation.usdRate / 1e9) <= 0.00000051, c.id);
    for (const [key, value] of Object.entries(c.marketCapObservation)) assert.equal(value, observation[key], `${c.id}.${key}`);
  }
  assert.equal(company('aapl').marketCap, 4860.1538);
  assert.equal(company('spcx').marketCap, 2047.59587);
  assert.throws(() => withMarketCapSnapshot({ id: 'missing-issuer' }), /Missing exact/);
});

test('currency conversion uses dated reference rates, including SAR and GBP denomination', () => {
  assert.equal(audit.fx.date, '2026-09-30');
  assert.equal(audit.fx.sar.date, '2026-09-30');
  for (const observation of Object.values(audit.companies)) {
    const rate = observation.currency === 'SAR' ? 1 / audit.fx.sar.usdToSar : audit.fx.rates.USD / audit.fx.rates[observation.currency];
    assert.equal(observation.usdRate, rate);
  }
  assert.equal(company('wise').marketCapObservation.currency, 'GBP');
  assert.equal(company('asml').marketCapObservation.currency, 'EUR');
});

test('recent listings retain founding and origin rules instead of inheriting IPO age or venue', () => {
  assert.equal(recentIposData.length, 16);
  for (const c of recentIposData) {
    assert.ok(c.ipoDate >= '2024-01-01' && c.ipoDate <= '2026-09-30', c.id);
    assert.equal(Number(c.ipoDate.slice(0, 4)), c.ipoYear);
    assert.ok(c.foundingYear <= c.ipoYear);
    assert.equal(c.isFromScratch, c.originType === 'from_scratch');
    assert.ok(c.citationUrl.startsWith('https://'));
  }
  assert.equal(company('puig').foundingYear, 1914);
  assert.equal(company('galderma').originType, 'joint_venture');
  assert.equal(company('zhipu').isFromScratch, false);
  assert.equal(company('klar').region, 'EU');
  assert.match(company('klar').geographyBasis, /London/);
  const instances = exchangeInstances([company('spcx')]);
  assert.equal(instances.length, 2);
  assert.equal(new Set(instances.map(c => c.companyId)).size, 1);
});

test('small IPOs remain discoverable with a finite All sizes inclusion patch', () => {
  const filters = { ageThreshold: 50, allAges: false, minMarketCap: 10, sectorFilter: 'all', strictFromScratch: true, includeNonEuEurope: true, selectedRegions: ['US', 'EU', 'CHINA', 'ASIA_EX_CHINA', 'ROW'] };
  for (const id of ['klar', 'rpi', 'verisure']) {
    const c = company(id);
    assert.ok(c.marketCap < 10);
    const patch = inclusionChanges(c, filters, 2026);
    assert.equal(patch.minMarketCap, 0);
    assert.equal(exclusionReasons(c, { ...filters, ...patch }, 2026).length, 0);
  }
});
