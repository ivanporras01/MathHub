import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const out=new URL('../work/systems-verification/',import.meta.url);
await mkdir(out,{recursive:true});
for(const name of ['systems-model','systems-lab','lab-diagrams','curriculum','extra-topics','high-school-topics']){
 const jsx=['systems-lab','lab-diagrams'].includes(name);
 let source=await readFile(new URL(`../app/${name}.${jsx?'tsx':'ts'}`,import.meta.url),'utf8');
 source=source.replace(/^import ['"].*\.css['"];$/gm,'').replace(/(['"])(\.\/[a-z-]+)\1/g,(_,quote,path)=>`${quote}${path}.mjs${quote}`);
 await writeFile(new URL(`${name}.mjs`,out),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText);
}
const {solveSystem,solvingSteps,resultText,graphScale,clippedLine,value,fractionText,linearExpression,standardEquation,SYSTEM_PRESETS}=await import(new URL('systems-model.mjs',out));
const {default:Lab,SystemGraph}=await import(new URL('systems-lab.mjs',out));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
assert.equal(resultText(solveSystem(SYSTEM_PRESETS[0].system)),'(2, 3)');
assert.equal(resultText(solveSystem(SYSTEM_PRESETS[3].system)),'(1/3, 2/3)');
assert.equal(solveSystem({m1:0,b1:2,m2:0,b2:3}).kind,'none');
assert.equal(solveSystem({m1:0,b1:0,m2:0,b2:0}).kind,'infinite');
assert.equal(resultText(solveSystem({m1:0,b1:-2,m2:2,b2:2})),'(−2, −2)');
assert.equal(linearExpression(-1,-1),'−x − 1');
assert.equal(linearExpression(0,0),'0');
assert.equal(standardEquation(-1,1,1),'−x + y = 1');
assert.equal(standardEquation(-1,-1,-5),'−x − y = −5');
let count=0;
for(let m1=-3;m1<=3;m1++)for(let m2=-3;m2<=3;m2++)for(let b1=-6;b1<=6;b1++)for(let b2=-6;b2<=6;b2++){
 const system={m1,b1,m2,b2},solution=solveSystem(system),{extent,tick}=graphScale(system);
 assert.ok(extent/tick<=7);
 if(solution.kind==='one'){
  const x=value(solution.x),y=value(solution.y);
  // Independently check the ordered pair in both ORIGINAL equations.
  near(y,m1*x+b1);near(y,m2*x+b2);
  assert.ok(Math.abs(x)<extent&&Math.abs(y)<extent,'intersection remains visible');
  assert.ok(solution.x.d>0&&solution.y.d>0);
  assert.ok(!fractionText(solution.x).includes('Infinity'));
 }else assert.equal(solution.kind,m1===m2&&b1===b2?'infinite':'none');
 for(const [m,b] of [[m1,b1],[m2,b2]]){
  const segment=clippedLine(m,b,extent);assert.equal(segment.length,2);
  for(const [x,y] of segment){near(y,m*x+b);assert.ok(Math.abs(x)<=extent+1e-8&&Math.abs(y)<=extent+1e-8);}
 }
 for(const method of ['graphing','substitution','elimination']){
  const steps=solvingSteps(system,method),text=JSON.stringify(steps);
  assert.ok(steps.length>=4&&steps.every(s=>s.title&&s.why&&s.math.length));
  assert.ok(!text.includes('NaN')&&!text.includes('Infinity')&&!text.includes('÷ (0)'));
  if(solution.kind==='one')assert.ok(text.includes(resultText(solution)));
 }
 count++;
}
for(const preset of SYSTEM_PRESETS){
 const html=renderToStaticMarkup(React.createElement(Lab,{initialSystem:preset.system}));
 for(const text of ['Line 1: slope m','Line 2: slope m','Line 1: y-intercept b','Line 2: y-intercept b','Graphing','Substitution','Elimination','Check my solution',resultText(solveSystem(preset.system))])assert.ok(html.includes(text),text);
 const svg=renderToStaticMarkup(React.createElement(SystemGraph,{system:preset.system}));
 assert.equal((svg.match(/data-testid="system-line-/g)||[]).length,2);
 const paths=[...svg.matchAll(/data-testid="system-line-\d"[^>]* d="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(paths.length,2);
 if(preset.id==='same')assert.equal(paths[0],paths[1]);else assert.notEqual(paths[0],paths[1]);
 await writeFile(new URL(`${preset.id}.svg`,out),svg);
 await writeFile(new URL(`${preset.id}.html`,out),html);
}
const elimination=solvingSteps(SYSTEM_PRESETS[0].system,'elimination');
assert.ok(elimination.some(s=>s.cancelY));
assert.ok(elimination.some(s=>s.math.includes('−2x = −4')));
assert.ok(elimination.some(s=>s.math.includes('x = (−4) ÷ (−2) = 2')));
assert.ok(solvingSteps(SYSTEM_PRESETS[1].system,'substitution').some(s=>s.math.includes('0 = −3')));
assert.ok(solvingSteps(SYSTEM_PRESETS[2].system,'elimination').some(s=>s.math.includes('0 = 0')));
const entry=await readFile(new URL('../app/interactive-lesson.tsx',import.meta.url),'utf8');
assert.match(entry,/topic.id==='8-systems'\|\|topic.id==='9-systems'\)return <SystemsLab/);
console.log(`PASS: ${count} systems checked against both equations, three solving methods, bounded graphs, fractions, parallel/coincident cases, and all four rendered examples.`);
