import test from 'node:test';
import assert from 'node:assert/strict';
import { companiesData } from '../src/data/companiesData.js';
import { exclusionReasons, inclusionChanges } from '../src/utils/companyScreen.js';

const baseline = { ageThreshold: 50, allAges: false, minMarketCap: 10, sectorFilter: 'all', strictFromScratch: true, includeNonEuEurope: false, selectedRegions: ['US', 'EU'] };
const company = id => companiesData.find(c => c.id === id);

test('baseline explains SAP age and ASML lineage independently', () => {
  assert.deepEqual(exclusionReasons(company('sap'), baseline, 2026).map(r => r.key), ['age']);
  assert.deepEqual(inclusionChanges(company('sap'), baseline, 2026), { ageThreshold: 54 });
  assert.deepEqual(exclusionReasons(company('asml'), baseline, 2026).map(r => r.key), ['origin']);
  assert.deepEqual(inclusionChanges(company('asml'), baseline, 2026), { strictFromScratch: false });
});

test('all failing criteria are retained, not just the first failure', () => {
  const f = { ...baseline, ageThreshold: 5, minMarketCap: 1000, sectorFilter: 'Healthcare', selectedRegions: ['CHINA'] };
  assert.deepEqual(exclusionReasons(company('asml'), f, 2026).map(r => r.key), ['age', 'marketCap', 'sector', 'origin', 'region']);
});

test('age boundary is inclusive and suggestions track a future year', () => {
  assert.equal(exclusionReasons(company('sap'), { ...baseline, ageThreshold: 54 }, 2026).length, 0);
  assert.deepEqual(inclusionChanges(company('sap'), baseline, 2027), { ageThreshold: 55 });
});

test('companies older than the slider supports require All Ages', () => {
  const changes = inclusionChanges(company('mc'), baseline, 2026);
  assert.equal(changes.allAges, true);
  assert.equal('ageThreshold' in changes, false);
  assert.equal(exclusionReasons(company('mc'), { ...baseline, ...changes }, 2026).length, 0);
});

test('geographic changes preserve the selected Europe definition', () => {
  assert.deepEqual(inclusionChanges(company('wise'), baseline, 2026), { selectedRegions: ['US', 'EU', 'ROW'] });
  assert.equal(exclusionReasons(company('wise'), { ...baseline, includeNonEuEurope: true }, 2026).length, 0);
});

test('inclusion patches admit every current company and change only failing criteria', () => {
  for (const ageThreshold of [5, 50, 100]) for (const allAges of [false, true]) for (const minMarketCap of [10, 100, 1000]) for (const sectorFilter of ['all', 'Technology', 'Healthcare']) for (const strictFromScratch of [false, true]) for (const includeNonEuEurope of [false, true]) for (const selectedRegions of [['US'], ['EU'], ['ROW'], ['US', 'EU', 'CHINA', 'ASIA_EX_CHINA', 'ROW']]) {
    const f = { ageThreshold, allAges, minMarketCap, sectorFilter, strictFromScratch, includeNonEuEurope, selectedRegions };
    for (const c of companiesData) {
      // Reference the original inclusion contract independently.
      const region = c.region === 'EUROPE_NON_EU' ? (includeNonEuEurope ? 'EU' : 'ROW') : c.region;
      const expected = (allAges || 2026 - c.foundingYear <= ageThreshold) && c.marketCap >= minMarketCap && (sectorFilter === 'all' || c.sector === sectorFilter) && (!strictFromScratch || c.isFromScratch) && selectedRegions.includes(region);
      const reasons = exclusionReasons(c, f, 2026);
      assert.equal(reasons.length === 0, expected, c.id);
      const patch = inclusionChanges(c, f, 2026);
      assert.equal(exclusionReasons(c, { ...f, ...patch }, 2026).length, 0, c.id);
      // Every suggested criterion is necessary: removing it fails to include.
      for (const key of Object.keys(patch)) {
        const smaller = { ...patch }; delete smaller[key];
        assert.ok(exclusionReasons(c, { ...f, ...smaller }, 2026).length > 0, `${c.id}: ${key}`);
      }
    }
  }
});
