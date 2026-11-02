import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectVerifiedLocations,filterLocations,type LocationRecord} from '../src/lib/verified-locations';
import {navigationUrl,normalizedColor} from '../src/lib/waste-colors';
import {evidenceImageType,maximumEvidenceBytes} from '../src/lib/evidence-image';
const source={title:'SYNTHETIC TEST ONLY',reference:'Not campus evidence',verification_status:'verified',archived_at:null};
const row:LocationRecord={id:'TEST',area_id:'TEST_AREA',name:'Synthetic, never seeded',latitude:10,longitude:100,verification_status:'verified',verified_at:'2026-11-02T00:00:00Z',archived_at:null,data_sources:source,location_bins:[{waste_bins:{id:'BIN',area_id:'TEST_AREA',code:'TEST',color:'เหลือง',verification_status:'verified',verified_at:'2026-11-02T00:00:00Z',archived_at:null,data_sources:source,bin_accepted_categories:[{waste_categories:{id:'CAT',slug:'recyclable',name:'Synthetic category',archived_at:null}}]}}]};
test('Map boundary rejects pending/archived/invalid/unproven coordinates without substituting campus center',()=>{
 assert.equal(projectVerifiedLocations([row],'TEST_AREA').length,1);
 for(const invalid of [{verification_status:'pending'},{archived_at:'2026-01-01'},{verified_at:null},{latitude:null},{latitude:NaN},{longitude:181},{data_sources:null},{data_sources:{...source,verification_status:'expired'}},{area_id:'OTHER'}])assert.equal(projectVerifiedLocations([{...row,...invalid}],'TEST_AREA').length,0);
});
test('Map requires verified same-area linked bins and filters actual category membership independently of color',()=>{
 const r=structuredClone(row);r.location_bins[0].waste_bins!.verification_status='pending';assert.equal(projectVerifiedLocations([r],'TEST_AREA').length,0);
 r.location_bins[0].waste_bins!.verification_status='verified';r.location_bins[0].waste_bins!.area_id='OTHER';assert.equal(projectVerifiedLocations([r],'TEST_AREA').length,0);
 const rows=projectVerifiedLocations([row],'TEST_AREA');assert.equal(filterLocations(rows,'yellow','CAT').length,1);assert.equal(filterLocations(rows,'red','CAT').length,0);assert.equal(filterLocations(rows,'','OTHER_CATEGORY').length,0);assert.equal(filterLocations(rows,'','',[]).length,0);assert.equal(filterLocations(rows,'','',['BIN']).length,1);assert.equal(normalizedColor('สีน้ำเงิน'),'blue');assert.equal(normalizedColor('custom-campus-color'),null);
});
test('Navigation uses only finite supplied coordinates; image boundary rejects SVG/oversize',()=>{
 assert.equal(navigationUrl(NaN,100),null);assert.equal(navigationUrl(100,100),null);assert.ok(navigationUrl(10,100)?.includes('destination=10,100'));assert.equal(evidenceImageType(new TextEncoder().encode('<svg onload="x"/>')),null);assert.equal(evidenceImageType(new Uint8Array(maximumEvidenceBytes+1)),null);assert.equal(evidenceImageType(new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])),'image/png');
});
