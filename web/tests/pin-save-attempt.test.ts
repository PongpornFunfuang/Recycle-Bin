import {test} from 'node:test';
import assert from 'node:assert/strict';
import {preparePinSaveAttempt} from '../src/lib/pin-save-attempt';
test('pin retries preserve request and payload; bin edits or moved coordinates start a new request',()=>{
 const values={latitude:16,longitude:102,bins:[{code:'TEST',color:'น้ำเงิน',categories:['general']}]};
 const first=preparePinSaveAttempt(null,values);
 assert.equal(preparePinSaveAttempt(first,structuredClone(values)),first);
 values.bins[0].color='เขียว';
 const edited=preparePinSaveAttempt(first,values);
 assert.notEqual(edited.id,first.id);
 assert.equal((first.values as typeof values).bins[0].color,'น้ำเงิน');
 assert.deepEqual(edited.values,values);
 assert.notEqual(preparePinSaveAttempt(edited,{...values,latitude:17}).id,edited.id);
});
