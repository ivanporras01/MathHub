import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {GRAPH_EXAMPLES} from '../work/learning-verification/graphing-examples.mjs';
import * as model from '../work/learning-verification/graphing-model.mjs';
import {practiceFields,WorkedExample,PracticeProblem,ParentExplorer} from '../work/learning-verification/graphing-studio.mjs';
import {sampleGraph} from '../work/learning-verification/function-graph.mjs';
const close=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
// Independent real-root oracle (polynomial degree <= 3): isolate roots with
// derivative critical points, then bisect each monotone interval.
function trim(c){c=[...c];while(c.length>1&&Math.abs(c.at(-1))<1e-12)c.pop();return c;}
const value=(c,x)=>c.reduce((s,a,i)=>s+a*x**i,0);
function roots(coeff){
 const c=trim(coeff);if(c.length<=1)return [];
 if(c.length===2)return [-c[0]/c[1]];
 if(c.length===3){const [a,b,d]=c,D=b*b-4*d*a;if(D< -1e-9)return [];if(Math.abs(D)<1e-9)return [-b/(2*d)];return [(-b-Math.sqrt(D))/(2*d),(-b+Math.sqrt(D))/(2*d)].sort((x,y)=>x-y);}
 const bound=1+Math.max(...c.slice(0,-1).map(v=>Math.abs(v/c.at(-1))));
 const critical=roots(c.slice(1).map((v,i)=>v*(i+1))).filter(x=>x>-bound&&x<bound),cuts=[-bound,...critical,bound],out=[];
 for(const x of critical)if(Math.abs(value(c,x))<1e-8)out.push(x);
 for(let i=0;i<cuts.length-1;i++){let lo=cuts[i],hi=cuts[i+1];if(value(c,lo)*value(c,hi)>=0)continue;for(let j=0;j<80;j++){const mid=(lo+hi)/2;if(value(c,lo)*value(c,mid)<=0)hi=mid;else lo=mid;}out.push((lo+hi)/2);}
 return out.sort((a,b)=>a-b).filter((x,i,a)=>!i||Math.abs(x-a[i-1])>1e-6);
}
function multiplicity(c,x){let count=0;while(c.length>1&&Math.abs(value(c,x))<1e-6){count++;c=c.slice(1).map((v,i)=>v*(i+1));}return count;}
let rangeChecks=0;
assert.equal(GRAPH_EXAMPLES.length,22);
for(const e of GRAPH_EXAMPLES){
 assert.equal(new Set(e.excluded).size,e.excluded.length,e.id);
 const denied=roots(e.d);assert.equal(denied.length,e.excluded.length,e.id+' denominator roots');denied.sort((a,b)=>a-b).forEach((x,i)=>close(x,[...e.excluded].sort((a,b)=>a-b)[i]));
 const zeros=roots(e.n).filter(x=>Math.abs(value(e.d,x))>1e-6);assert.equal(zeros.length,e.zeros.length,e.id+' numerator roots');zeros.forEach((x,i)=>close(x,[...e.zeros].sort((a,b)=>a-b)[i]));
 for(const x of e.excluded){assert.ok(Number.isNaN(model.graphExampleValue(e,x)));const pole=multiplicity(e.d,x)>multiplicity(e.n,x);assert.equal(e.va.includes(x),pole,e.id+' pole vs hole');assert.equal(e.holes.some(h=>h[0]===x),!pole,e.id);}
 for(const [x,y] of e.holes){close(model.graphExampleValue(e,x+1e-5),y,1e-4);close(model.graphExampleValue(e,x-1e-5),y,1e-4);}
 if(e.yIntercept!==null)close(value(e.n,0)/value(e.d,0),e.yIntercept);else assert.ok(e.excluded.includes(0));
 if(e.ha!==undefined){for(const x of [-1e7,1e7])close(model.graphExampleValue(e,x),e.ha,1e-5);}else assert.ok(e.n.length>e.d.length);
 if(e.end)for(const x of [-10000,10000])close(model.graphExampleValue(e,x)-value(e.end.coefficients,x),0,.001);
 const outputs=[-20,-5,-2,-1,-.5,0,.5,2/3,1,2,3,4,5,10,20,2-2*Math.SQRT2,2+2*Math.SQRT2,2-2*Math.SQRT2+.01,2+2*Math.SQRT2-.01,...(e.vertex?[e.vertex[1],e.vertex[1]-.01,e.vertex[1]+.01]:[])];
 for(const y of outputs){const equation=Array.from({length:Math.max(e.n.length,e.d.length)},(_,i)=>(e.n[i]||0)-y*(e.d[i]||0));const zeroPoly=equation.every(v=>Math.abs(v)<1e-10);const possible=zeroPoly||roots(equation).some(x=>!e.excluded.some(v=>Math.abs(v-x)<1e-5)&&Math.abs(value(e.d,x))>1e-7);assert.equal(e.rangeContains(y),possible,`${e.id}: range at y=${y}`);rangeChecks++;}
 const segments=sampleGraph(x=>model.graphExampleValue(e,x),-8,8,e.excluded);
 for(const segment of segments){assert.ok(segment.every(p=>p.every(Number.isFinite)));for(const excluded of e.excluded)assert.ok(!segment.some(([x])=>x<excluded)||!segment.some(([x])=>x>excluded),e.id+' must not bridge a restriction');}
 for(const field of practiceFields(e)){assert.ok(field.check(field.answer),e.id+' canonical answer '+field.id);assert.equal(field.check(''),false);if(field.options)assert.equal(new Set(field.options).size,field.options.length);}
 for(const component of [WorkedExample,PracticeProblem]){const html=renderToStaticMarkup(React.createElement(component,{e,onPractice:()=>{},onComplete:()=>{}}));assert.ok(!/NaN/.test(html),e.id+' render');assert.ok(html.includes(e.name));}
}
let transforms=0;
for(const family of ['reciprocal','reciprocal-square','quadratic'])for(const a of [-3,-1,.5,2])for(const b of [-2,-1,.5,1,2])for(const h of [-4,0,3])for(const k of [-2,0,4]){
 const t={family,a,b,h,k},facts=model.transformFacts(t);
 for(const u of [-2,-1,.5,1,2]){const parent=family==='quadratic'?u*u:family==='reciprocal'?1/u:1/(u*u);const [x,y]=model.transformedPoint(t,u);close(x,h+u/b);close(y,a*parent+k);close(model.transformedValue(t,x),y);}
 for(const x of facts.zeros){assert.ok(Number.isFinite(x));close(model.transformedValue(t,x),0);}
 assert.equal(facts.yIntercept===null,family!=='quadratic'&&h===0);transforms++;
}
for(const initial of ['quadratic','reciprocal','reciprocal-square'])assert.ok(!/NaN/.test(renderToStaticMarkup(React.createElement(ParentExplorer,{initial}))));
assert.equal(model.sameNumbers('none',[]),true);assert.equal(model.sameNumbers('',[]),false);assert.equal(model.sameNumbers('1, 1',[1]),false);assert.equal(model.sameNumbers('−1, 1/2',[.5,-1]),true);assert.equal(model.sameNumbers('1/0',[0]),false);assert.equal(model.sameNumbers('Math.random()',[0]),false);
assert.equal(model.sameHoles('(1, 2); (−1, 2/3)',[[-1,2/3],[1,2]]),true);assert.equal(model.sameHoles('(2, 1)',[[1,2]]),false);
console.log(`PASS: 22 complete graph analyses; ${rangeChecks} independent range checks; ${transforms} transformations; practice answer validation; curve discontinuities; 47 rendered studio states.`);
