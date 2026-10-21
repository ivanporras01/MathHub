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
assert.equal(topics.TOPICS.length,75);
const previous=JSON.parse(await readFile(new URL('./fixtures/pre-polynomial-topic-ids.json',import.meta.url)));
assert.deepEqual(topics.TOPICS.slice(0,72).map(t=>t.id),previous,'Existing topic order and IDs stay stable');
console.log('PASS: '+checked+' polynomial/rational cases, worksheet coordinates, distance preservation, synthetic division, domain exclusions, coordinate validation, 75-topic compatibility and lab rendering.');

const {combinePolynomials}=await import('../work/learning-verification/polynomial-operations-model.mjs');
const {WORKSHEET_PROBLEMS,WORKSHEET_PROBLEM_3_CUBIC}=await import('../work/learning-verification/polynomial-worksheet-data.mjs');
const {RATIONAL_GRAPHS,graphValue}=await import('../work/learning-verification/rational-graph-model.mjs');
const radical=await import('../work/learning-verification/radical-graph-model.mjs');
const {sampleGraph}=await import('../work/learning-verification/function-graph.mjs');
const {default:OperationsLab}=await import('../work/learning-verification/polynomial-operations-lab.mjs');
const {default:RationalGraphLab}=await import('../work/learning-verification/rational-graph-lab.mjs');
const {default:RadicalGraphLab}=await import('../work/learning-verification/radical-graph-lab.mjs');
assert.equal(topics.TOPICS[72].id,'10-multiplication');
assert.deepEqual(topics.TOPICS.slice(73).map(t=>t.id),['10-addition','10-subtraction']);
assert.equal(topics.TOPICS.find(t=>t.id==='10-division').title,'Operations with Polynomials');
for(let seed=1;seed<=200;seed++){
 const a=[seed%9-4,seed%5-2,seed%4-2],b=[seed%11-5,seed%7-3,0,seed%3-1];
 for(const subtract of [false,true])for(const x of [-3,-.5,0,1,4])close(core.valueAt(combinePolynomials(a,b,subtract),x),core.valueAt(a,x)+(subtract?-1:1)*core.valueAt(b,x));
 assert.deepEqual(combinePolynomials(a,a,true),[0]);
}
assert.equal(WORKSHEET_PROBLEMS.length,13);
assert.deepEqual(WORKSHEET_PROBLEMS.map(p=>p.number),Array.from({length:13},(_,i)=>i+1));
const exclusions=[[7,-7],[3,-1,2,-2],[0,1,5,-1],[3,-3],[.5,-3,-2/3],[3,-3,2],[0,-1/20],[0],[0,5,-4,4,1/3],[],[],[0,2],[3,-3]];
for(const p of [...WORKSHEET_PROBLEMS,WORKSHEET_PROBLEM_3_CUBIC]){
 assert.deepEqual(p.excluded,exclusions[p.number-1],`Problem ${p.number} original domain`);
 assert.ok(p.steps.length>=4&&p.steps.every(s=>s.why.length>20));
 if(p.evaluate)for(const x of [-11,-8,-5,-4,-3,-2,-1,-.5,0,1/3,.5,1,2,3,4,5,7,8,11])if(!p.excluded.some(n=>Math.abs(x-n)<1e-8))close(p.evaluate(x),p.check(x));
 if(p.solutions){for(const x of p.solutions){assert.ok(!p.excluded.some(n=>Math.abs(x-n)<1e-8));close(p.residual(x),0);}assert.deepEqual(p.candidates.filter(x=>!p.excluded.some(n=>Math.abs(x-n)<1e-8)),p.solutions);}
}
assert.deepEqual(WORKSHEET_PROBLEMS[11].solutions,[],'Problem 12 has no solution');
for(const [i,e] of RATIONAL_GRAPHS.entries()){
 assert.equal(graphValue(e,e.excluded),null);
 close(graphValue(e,e.xIntercept),0);close(graphValue(e,0),e.yIntercept);
 for(const x of [-8,-5,-3,-2,0,1,2,4,7,9])if(x!==e.excluded){const independently=i===0?6/(x+2)+3:i===1?(3*x+6)/(x-1):(x*x-7*x+6)/(x-1);close(graphValue(e,x),independently);assert.notEqual(graphValue(e,x),e.rangeExcluded);}
 if(e.vertical!==undefined){const segments=sampleGraph(e.fn,-10,10,[e.vertical]);assert.equal(segments.length,2);assert.ok(segments[0].every(([x])=>x<e.vertical));assert.ok(segments[1].every(([x])=>x>e.vertical));}
}
assert.deepEqual(RATIONAL_GRAPHS[2].hole,[1,-5]);assert.equal(RATIONAL_GRAPHS[2].rangeExcluded,-5);
for(const root of ['square','cube'])for(const a of [-3,-1,.5,2])for(const direction of [-1,1])for(const h of [-4,0,3])for(const k of [-2,0,4]){
 const c={root,a,direction,h,k};
 for(const p of radical.radicalPoints(c)){close(radical.radicalValue(c,p.x),p.y);close(p.y,a*p.v+k);}
 if(root==='square'){assert.ok(Number.isNaN(radical.radicalValue(c,h-direction)));close(radical.radicalValue(c,h),k);assert.ok(radical.radicalRange(c).includes(a>0?'≥':'≤'));}
 else assert.ok(Number.isFinite(radical.radicalValue(c,h-direction)));
}
for(const operation of ['divide','multiply','add','subtract']){
 const markup=renderToStaticMarkup(React.createElement(OperationsLab,{initialOperation:operation}));
 assert.ok(markup.includes('Choose a polynomial operation')&&markup.includes('13 SOLVED PROBLEMS'));
 assert.ok(markup.includes('Why:')&&markup.includes('Final answer'));
 assert.ok(!/NaN|Infinity/.test(markup));
}
for(const Component of [RationalGraphLab,RadicalGraphLab]){
 const markup=renderToStaticMarkup(React.createElement(Component));assert.ok(markup.includes('<svg')&&markup.includes('Domain')&&markup.includes('Range'));assert.ok(!/NaN|Infinity/.test(markup));
}
console.log('PASS: polynomial addition/subtraction identities, all 13 original worksheet solutions and exclusions, three supplied rational graphs, radical transformation domains and point tables, and four-operation navigation.');
