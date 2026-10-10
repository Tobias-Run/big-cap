import test from 'node:test';
import assert from 'node:assert/strict';
import { privateCompaniesData, hasSourcedValuation, nextGenerationMatches } from '../src/data/privateCompaniesData.js';
import { companiesData } from '../src/data/companiesData.js';

test('private research candidates remain separate from the public universe', () => {
  const publicIds = new Set(companiesData.map(c => c.id));
  assert.equal(new Set(privateCompaniesData.map(c => c.id)).size, privateCompaniesData.length);
  for (const c of privateCompaniesData) {
    assert.equal(publicIds.has(c.id), false);
    assert.equal('marketCap' in c, false);
    assert.equal(c.valuation, null);
    assert.equal(c.listingStatus, 'unverified');
    assert.equal(c.researchStatus, 'pending');
    assert.ok(c.sourceUrl.startsWith('https://'));
  }
});

test('geography, sector and search combine independently of public filters', () => {
  const match = (c, filters = {}) => nextGenerationMatches(c, { query: '', broadEurope: false, sector: 'all', ...filters });
  assert.equal(privateCompaniesData.filter(c => match(c)).length, 4);
  assert.equal(privateCompaniesData.filter(c => match(c, { broadEurope: true })).length, 6);
  assert.equal(privateCompaniesData.filter(c => match(c, { sector: 'Fintech' })).length, 0);
  assert.equal(privateCompaniesData.filter(c => match(c, { sector: 'Fintech', broadEurope: true })).length, 2);
  assert.deepEqual(privateCompaniesData.filter(c => match(c, { query: '  MISTRAL ' })).map(c => c.id), ['mistral']);
});

test('valuation display requires provenance, date, currency, method and uncertainty', () => {
  const v = { amount: 1e9, currency: 'EUR', asOf: '2024-06-01', kind: 'Funding round', sourceUrl: 'https://example.com/announcement', uncertainty: 'Historical transaction, not current market cap' };
  assert.equal(hasSourcedValuation({ valuation: v }), true);
  for (const key of Object.keys(v)) {
    const incomplete = { ...v }; delete incomplete[key];
    assert.equal(hasSourcedValuation({ valuation: incomplete }), false, key);
  }
  assert.equal(hasSourcedValuation({ valuation: { ...v, amount: NaN } }), false);
  assert.equal(hasSourcedValuation({ valuation: { ...v, amount: -1 } }), false);
  assert.equal(hasSourcedValuation({ valuation: { ...v, asOf: '2024-02-30' } }), false);
});
