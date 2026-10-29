import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const sources=await Promise.all(['app/curriculum.ts','app/extra-topics.ts','app/high-school-topics.ts'].map(p=>readFile(new URL(p,root),'utf8')));
const ids=[...[...sources[0].matchAll(/T\('([0-9]+-[^']+)'/g)].map(m=>m[1]),...[...sources[1].matchAll(/t\('([0-9]+-[^']+)'/g)].map(m=>m[1]),...[...sources[2].matchAll(/"id":\s*"([0-9]+-[^"]+)"/g)].map(m=>m[1])];
assert.equal(ids.length,75);assert.equal(new Set(ids).size,75);
const data=JSON.parse(await readFile(new URL('app/learning-path-data.json',root),'utf8')),listed=[];
for(const grade of ['6','7','8','9','10','11']){
 const stages=data[grade];assert.ok(Array.isArray(stages)&&stages.length>=4);
 const names=new Set();
 for(const stage of stages){
  assert.ok(stage.id&&!names.has(stage.id));names.add(stage.id);
  assert.ok(stage.title&&stage.summary&&stage.topics.length);
  for(const id of [...stage.topics,...(stage.focus||[])]){assert.ok(id.startsWith(grade+'-'));listed.push(id);}
  if(stage.focus){assert.equal(grade,'10');assert.equal(stage.id,'polynomial-studio');assert.ok(stage.topics.includes('10-division'));assert.deepEqual(stage.focus,['10-addition','10-subtraction','10-multiplication']);}
 }
 assert.equal(listed.filter(id=>id.startsWith(grade+'-')).length,grade==='10'?15:12);
}
assert.equal(listed.length,75);assert.equal(new Set(listed).size,75);
assert.deepEqual([...listed].sort(),[...ids].sort());
console.log('PASS: 75 existing MathHub topics appear once in progressive stages; no lost IDs or duplicate polynomial drills.');
