import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {inequalityOracle} from './inequalities-oracle.mjs';
const out=new URL('../work/inequalities-verification/',import.meta.url);await mkdir(out,{recursive:true});
for(const name of ['inequalities-model','inequality-questions','inequalities-lab','question-engine','question-utils','curriculum','extra-topics','high-school-topics','extra-questions','high-school-questions','expressions-model']){
 let source=await readFile(new URL(`../app/${name}.${name==='inequalities-lab'?'tsx':'ts'}`,import.meta.url),'utf8');
 source=source.replace(/^import ['"].*\.css['"];$/gm,'').replace(/(['"])(\.\/[a-z-]+)\1/g,(_,q,n)=>`${q}${n}.mjs${q}`);
 await writeFile(new URL(`${name}.mjs`,out),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText);
}
const model=await import(new URL('inequalities-model.mjs',out)),engine=await import(new URL('question-engine.mjs',out)),{default:Lab,InequalityGraph,OneVariableReview}=await import(new URL('inequalities-lab.mjs',out));
const originalTruth=(q,[x,y])=>{const left=q.axis==='x'?x:y,right=q.axis==='x'?q.b:q.m*x+q.b;return q.sign==='<'?left<right:q.sign==='>'?left>right:q.sign==='≤'?left<=right:left>=right;};
const area=p=>Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-a[1]*b[0];},0))/2;
const inPolygon=(p,[x,y])=>{let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;};
let comparisons=0,polygons=0;
for(const axis of ['x','y'])for(let m=-3;m<=3;m++)for(let b=-6;b<=6;b++)for(const sign of model.SIGNS){
 const q={axis,m,b,sign},polygon=model.regionPolygon([q],8),segment=model.boundarySegment(q,8);
 for(const p of segment){assert.ok(Math.abs(p[0])<=8.00001&&Math.abs(p[1])<=8.00001);assert.ok(Math.abs(axis==='x'?p[0]-b:p[1]-m*p[0]-b)<1e-8);}
 assert.equal(segment.length,2);
 for(let x=-7.75;x<=7.75;x+=.5)for(let y=-7.75;y<=7.75;y+=.5){
  const expected=originalTruth(q,[x,y]);assert.equal(model.satisfies(q,[x,y]),expected);
  if(Math.abs(axis==='x'?x-b:y-m*x-b)>1e-8)assert.equal(inPolygon(polygon,[x,y]),expected,JSON.stringify({q,x,y}));
  comparisons++;
 }
 polygons++;
}
for(const p of model.SYSTEM_PRESETS){const result=model.feasibleSet(p.rules);assert.equal(result.kind,p.id==='none'||p.id==='strict'?'empty':p.id==='line'?'line':'region');if(result.point)assert.ok(p.rules.every(q=>model.satisfies(q,result.point)));}
const triangle=model.SYSTEM_PRESETS.find(p=>p.id==='triangle').rules;
assert.equal(area(model.regionPolygon(triangle,8)),18);
assert.equal(model.satisfiesAll(triangle,[2,3]),true);assert.equal(model.satisfiesAll(triangle,[4,3]),false);
assert.equal(model.satisfiesAll(model.SYSTEM_PRESETS[0].rules,[2,1]),false,'intersection on strict boundary is excluded');
const onlyPoint=[{axis:'x',m:0,b:0,sign:'≥'},{axis:'y',m:0,b:0,sign:'≥'},{axis:'y',m:-1,b:0,sign:'≤'}];
assert.equal(model.feasibleSet(onlyPoint).kind,'point');assert.deepEqual(model.feasibleSet(onlyPoint).point,[0,0]);
assert.equal(model.feasibleSet([{axis:'x',m:0,b:0,sign:'>'},{axis:'x',m:0,b:0,sign:'≤'}]).kind,'empty');
let state=23897;const r=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n;};
for(let i=0;i<1800;i++){
 const rules=Array.from({length:i%2+2},()=>({axis:r(4)?'y':'x',m:r(7)-3,b:r(13)-6,sign:model.SIGNS[r(4)]})),result=model.feasibleSet(rules),polygon=model.regionPolygon(rules,64);
 if(result.point)assert.ok(rules.every(q=>model.satisfies(q,result.point)),JSON.stringify({rules,result}));
 // Polygon centroids and pair midpoints independently probe the closed clipped set.
 // Strict boundary tests still use the original inequalities, never fill geometry.
 const candidates=[...polygon];if(polygon.length)candidates.push([polygon.reduce((n,p)=>n+p[0],0)/polygon.length,polygon.reduce((n,p)=>n+p[1],0)/polygon.length]);
 for(const a of polygon)for(const b of polygon)candidates.push([(a[0]+b[0])/2,(a[1]+b[1])/2]);
 const hasSolution=candidates.some(p=>rules.every(q=>model.satisfies(q,p)));
 assert.equal(result.kind!=='empty',hasSolution,JSON.stringify({rules,result,polygon}));
 if(area(polygon)>1e-7)assert.equal(result.kind,'region');
}
let questions=0;const kinds=new Set();
for(let level=1;level<=3;level++)for(let i=0;i<400;i++){
 const seed=(i*2654435761)>>>0,q=engine.generateQuestion('9-inequalities',seed,level);assert.equal(q.answer,inequalityOracle(q),JSON.stringify(q));
 assert.ok(q.steps.length>=2&&q.steps.every(s=>s.ask&&s.math&&Number.isFinite(s.answer)));
 assert.deepEqual(engine.generateStoredQuestion('9-inequalities',engine.seedForNewQuestion('9-inequalities',seed),level),q);
 kinds.add(q.prompt.includes('INTEGER')?'integer-region':q.prompt.includes('SYSTEM')?'system-point':q.prompt.startsWith('Does')?'half-plane-point':q.prompt.includes('boundary line')?'boundary':'one-variable');questions++;
}
assert.equal(kinds.size,5);
const legacy=JSON.parse(await readFile(new URL('./fixtures/legacy-inequalities.json',import.meta.url),'utf8'));
for(const f of legacy)assert.deepEqual(JSON.parse(JSON.stringify(engine.generateStoredQuestion('9-inequalities',f.seed,f.level))),f.question,'previously issued questions keep their original content and answer');
const fixtures=[...model.PLANE_PRESETS.map((p,i)=>({id:'plane-'+i,rules:[p.rule],point:p.point,mode:'plane'})),...model.SYSTEM_PRESETS.map(p=>({...p,mode:'system'})),{id:'only-point',rules:onlyPoint,point:[0,0],mode:'system'}];
const svgStyle=`svg{font-family:Arial}text{fill:#193c40;font-size:17px}.ineq-plot-bg{fill:#f8f6ef}.ineq-color-1.ineq-fill{fill:#1767b0;fill-opacity:.15}.ineq-color-2.ineq-fill{fill:#b55410;fill-opacity:.15}.ineq-color-3.ineq-fill{fill:#147c70;fill-opacity:.15}.ineq-color-1 .ineq-boundary{stroke:#1767b0}.ineq-color-2 .ineq-boundary{stroke:#b55410}.ineq-color-3 .ineq-boundary{stroke:#147c70}.ineq-boundary{fill:none;stroke-width:3.5}.ineq-grid{fill:none;stroke:#d5ddd8}.ineq-axes{fill:none;stroke:#193c40;stroke-width:1.7}.ineq-common-fill{fill:#7545ad;fill-opacity:.22}.ineq-hatch{stroke:#7545ad;stroke-width:1.6;opacity:.65}.ineq-common-line{fill:none;stroke:#7545ad;stroke-width:12;stroke-opacity:.3}.ineq-common-point{fill:#7545ad;stroke:white;stroke-width:3}.ineq-tick{font-size:13px}.ineq-scale{font-size:12px}.ineq-color-1 .ineq-line-badge{fill:#1767b0}.ineq-color-2 .ineq-line-badge{fill:#b55410}.ineq-color-3 .ineq-line-badge{fill:#147c70}.ineq-badge-text{fill:white;font-size:14px}.ineq-test-point{stroke:white;stroke-width:3}.accepted{fill:#126b47}.rejected{fill:#ae3540}.ineq-point-label rect{fill:white;stroke:#d5ddd8}.ineq-point-label text{font-size:15px}`;
for(const f of fixtures){
 const html=renderToStaticMarkup(React.createElement(Lab,{initialMode:f.mode,initialRules:f.rules,initialPoint:f.point}));assert.ok(html.includes('Test boundary 1')&&html.includes('Test point x-coordinate')&&html.includes('Test point y-coordinate')&&html.includes('Check P in'));assert.ok(!/NaN|Infinity|undefined/.test(html));
 const svg=renderToStaticMarkup(React.createElement(InequalityGraph,{rules:f.rules,point:f.point,phase:2}));assert.equal((svg.match(/data-boundary=/g)||[]).length,f.rules.length);assert.equal((svg.match(/stroke-dasharray="12 8"/g)||[]).length,f.rules.filter(q=>q.sign==='<'||q.sign==='>').length);
 if(model.feasibleSet(f.rules).kind==='empty')assert.ok(!svg.includes('data-region="overlap"'));
 await writeFile(new URL(`${f.id}.svg`,out),svg.replace(/(<svg[^>]*>)/,`$1<style>${svgStyle}</style>`));
}
assert.ok(renderToStaticMarkup(React.createElement(OneVariableReview)).includes('Test a number x'));
console.log(`PASS: ${comparisons} independent graph/point checks, ${polygons} half-plane polygons, 1,800 systems, strict/vertical/line/point cases, ${questions} scored questions, legacy scoring, and ${fixtures.length} rendered labs.`);
