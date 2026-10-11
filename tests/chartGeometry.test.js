import test from 'node:test';
import assert from 'node:assert/strict';
import { bubbleRadius } from '../src/utils/bubbleScale.js';
import { placeClusterLabels } from '../src/utils/clusterLabels.js';

test('bubble area matches market-cap ratios in both modes', () => {
  for (const mode of [false, true]) {
    assert.equal(bubbleRadius(0, mode), 0);
    for (const [a,b] of [[3450,11.5],[1000,100],[100,10]]) {
      assert.ok(Math.abs((bubbleRadius(a,mode) / bubbleRadius(b,mode)) ** 2 - a/b) < 1e-9);
    }
  }
});

test('small cluster heading follows its envelope instead of a fixed offset', () => {
  const node={x:200,y:250,r:10,labelRegion:'EU'};
  const label=placeClusterLabels([node],[{region:'EU',width:60,height:30,center:{x:200,y:250}}],800,600)[0];
  assert.equal(label.y+label.height,230);
  assert.equal(label.x+label.width/2,200);
});

test('three cluster headings avoid all bubble circles and each other', () => {
  const nodes=[{x:160,y:200,r:60,labelRegion:'US'},{x:350,y:170,r:12,labelRegion:'EU'},{x:260,y:400,r:30,labelRegion:'ROW'}];
  const labels=nodes.map(n=>({region:n.labelRegion,width:100,height:30,center:n}));
  const placements=placeClusterLabels(nodes,labels,800,600);
  for(const p of placements){
    for(const n of nodes){const x=Math.max(p.x,Math.min(n.x,p.x+p.width));const y=Math.max(p.y,Math.min(n.y,p.y+p.height));assert.ok(Math.hypot(n.x-x,n.y-y)>=n.r+10);}
    assert.ok(p.x>=0&&p.y>=0&&p.x+p.width<=800&&p.y+p.height<=600);
  }
});

test('every recorded exchange gets an instance while public companies remain unique', async () => {
  const { recordedExchanges, exchangeInstances } = await import('../src/utils/exchanges.js');
  assert.deepEqual(recordedExchanges('2330 (TWSE) / TSM (NYSE)'), ['TWSE', 'NYSE']);
  assert.deepEqual(recordedExchanges('BABA (NYSE / HKEX 9988)'), ['NYSE', 'HKEX']);
  const source = [{id:'test',ticker:'X (NASDAQ / NYSE)',marketCap:10}];
  const instances=exchangeInstances(source);
  assert.equal(instances.length,2);
  assert.equal(new Set(instances.map(c=>c.id)).size,2);
  assert.ok(instances.every(c=>c.companyId==='test'&&c.listingCount===2&&c.marketCap===10));
  assert.equal(source.length,1);
});
