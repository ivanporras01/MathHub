import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
// verify-learning compiles the actual TypeScript modules, not a duplicate model.
const core=await import('../work/learning-verification/advanced-math-model.mjs');
const {RATIONAL_EXAMPLES}=await import('../work/learning-verification/rational-lab.mjs');
const {default:PolynomialLab}=await import('../work/learning-verification/polynomial-lab.mjs');
const {default:CompositionLab}=await import('../work/learning-verification/composition-lab.mjs');
const {readFigureCoordinates}=await import('../work/learning-verification/figure-coordinates.mjs');
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(a),Math.abs(b)),a+' != '+b);
let checked=0;
for(let seed=1;seed<=300;seed++){
 const a=[seed%9-4,(seed*3)%11-5,(seed%4)+1],b=[seed%7-3,(seed%3)+1],c=[seed%5-2,(seed%4)-2,1];
 for(const divisor of [b,c]){
  const {quotient,remainder}=core.dividePoly(a,divisor);
  assert.ok(remainder.length<divisor.length||remainder.every(v=>v===0));
  for(const x of [-3,-.5,0,2,4])close(core.valueAt(a,x),core.valueAt(divisor,x)*core.valueAt(quotient,x)+core.valueAt(remainder,x));
  checked++;
 }
 const product=core.multiplyPoly(a,b);
 for(const x of [-2,-.5,0,1,3])close(core.valueAt(product,x),core.valueAt(a,x)*core.valueAt(b,x));
 checked++;
}
assert.throws(()=>core.dividePoly([1,2],[0,0]));
assert.deepEqual(core.dividePoly([2],[1,1]).quotient,[0]);
assert.deepEqual(core.dividePoly([0],[1,1]).remainder,[0]);
const expected=[[[1,3],[-1,3]],[[-3,1],[-3,-4]],[[-1,1],[-1,3]]];
core.COMPOSITION_EXAMPLES.forEach((e,i)=>{const r=core.composePoints([[1,1]],e.axis,e.line,e.dx,e.dy);assert.deepEqual(r.middle,[expected[i][0]]);assert.deepEqual(r.final,[expected[i][1]]);});
const points=[[1,1],[4,1],[2,4]];
for(const axis of ['horizontal','vertical'])for(let line=-5;line<=5;line++){
 const result=core.composePoints(points,axis,line,2,-3);
 for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)close(Math.hypot(points[i][0]-points[j][0],points[i][1]-points[j][1]),Math.hypot(result.final[i][0]-result.final[j][0],result.final[i][1]-result.final[j][1]));
}
assert.notDeepEqual(core.composePoints([[1,1]],'horizontal',2,0,2).final,core.composePoints([[1,1]],'horizontal',2,0,2,true).final);
for(const e of core.DIVISION_EXAMPLES.filter(e=>e.b.length===2&&e.b[1]===1)){
 const synthetic=core.syntheticDivision(e.a,-e.b[0]),long=core.dividePoly(e.a,e.b);
 assert.deepEqual(synthetic.quotient,long.quotient);close(synthetic.remainder,long.remainder[0]);close(synthetic.remainder,core.valueAt(e.a,-e.b[0]));
}
for(const e of RATIONAL_EXAMPLES)for(const x of [-5,-3,-2,-1,-.5,0,1,2,3,4,5])if(!e.excluded.includes(x)){close(e.evaluate(x),e.check(x));checked++;}
assert.deepEqual(RATIONAL_EXAMPLES[1].excluded,[3,-2,2,-3]);
assert.equal(readFigureCoordinates([['1/2','-1'],['3','0'],['0','4']]).ok,true);
assert.equal(readFigureCoordinates([['0','0'],['1','1'],['2','2']]).ok,false);
const html=renderToStaticMarkup(React.createElement(CompositionLab));
assert.ok(html.includes('(-1, 3)')&&html.includes('Reverse the order')&&html.includes('Try your own point or polygon'));
for(const initialMode of ['multiply','divide','rational']){
 const markup=renderToStaticMarkup(React.createElement(PolynomialLab,{initialMode}));
 assert.ok(markup.includes('POLYNOMIAL STUDIO'));
 assert.ok(!/NaN|Infinity/.test(markup),initialMode);
}
const topics=await import('../work/learning-verification/curriculum.mjs');
assert.equal(topics.TOPICS.length,73);
const previous=JSON.parse(await readFile(new URL('./fixtures/pre-polynomial-topic-ids.json',import.meta.url)));
assert.deepEqual(topics.TOPICS.slice(0,72).map(t=>t.id),previous,'Existing topic order and IDs stay stable');
console.log('PASS: '+checked+' polynomial/rational cases, worksheet coordinates, distance preservation, synthetic division, domain exclusions, coordinate validation, 73-topic compatibility and lab rendering.');
