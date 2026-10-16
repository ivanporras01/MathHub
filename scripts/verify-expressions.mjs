import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {evaluateText,coefficientFromText,expressionOracle} from './expression-oracle.mjs';
const out=new URL('../work/expressions-verification/',import.meta.url);await mkdir(out,{recursive:true});
for(const name of ['expressions-model','expressions-lab','lab-diagrams','curriculum','extra-topics','high-school-topics','question-utils','question-engine','extra-questions','high-school-questions']){
 const jsx=['expressions-lab','lab-diagrams'].includes(name);
 let source=await readFile(new URL(`../app/${name}.${jsx?'tsx':'ts'}`,import.meta.url),'utf8');
 source=source.replace(/^import ['"].*\.css['"];$/gm,'').replace(/(['"])(\.\/[a-z-]+)\1/g,(_,q,n)=>`${q}${n}.mjs${q}`);
 await writeFile(new URL(`${name}.mjs`,out),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText);
}
const model=await import(new URL('expressions-model.mjs',out));
const engine=await import(new URL('question-engine.mjs',out));
const near=(a,b,message='')=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}: ${message}`);
assert.equal(evaluateText('−2(3x² − 2x + 1) + 3(x² + x − 4)',2),-12);
assert.equal(evaluateText('2[3(x − 2) − (x + 4)] + 5x',3),7);
near(evaluateText('(1/2)(7x − 3) − (1/3)(2x + 4)',2),17/6);
let examples=0,checkedSteps=0;
for(let level=1;level<=7;level++)for(let i=0;i<75;i++){
 const expression=model.generateExpression(level,(i*2654435761)>>>0),original=model.formatExpression(expression),terms=model.expand(expression),c=model.coefficients(terms),simplified=model.polynomial(c),steps=model.expressionSteps(expression);
 for(const key of model.TERM_ORDER)near(model.numeric(c[key]),coefficientFromText(original,key),`${original}, ${key}`);
 for(const [x,y] of [[-3,2],[-1,-2],[0,0],[1,3],[4,-1]]){
  const expected=evaluateText(original,x,y);
  near(model.evaluateExpression(expression,x,y),expected,original);
  near(model.numeric(model.evaluateExact(expression,x,y)),expected,original);
  near(evaluateText(simplified,x,y),expected,simplified);
  for(const s of steps){near(evaluateText(s.math,x,y),expected,`${s.property}: ${s.math}`);checkedSteps++;}
 }
 assert.ok(steps.some(s=>s.property.startsWith('Commutative'))&&steps.some(s=>s.property.startsWith('Associative'))&&steps.some(s=>s.property.startsWith('Distributive')));
 assert.ok(!simplified.includes(' + −')&&!/(?:^|[ +−])0[xy]/.test(simplified));
 examples++;
}
const expectedTypes=new Set();
for(let level=1;level<=3;level++)for(let i=0;i<180;i++){
 const seed=(i*2654435761)>>>0,q=engine.generateQuestion('9-expressions',seed,level);
 near(q.answer,expressionOracle(q),q.expression);
 assert.ok(q.steps.length>=4&&q.steps.every(s=>Number.isFinite(s.answer)));
 assert.deepEqual(engine.generateStoredQuestion('9-expressions',engine.seedForNewQuestion('9-expressions',seed),level),q);
 if(level===1)assert.ok(q.expression.includes('('));
 if(level===2)assert.ok(q.expression.includes('y')||q.expression.includes('²'));
 if(level===3)assert.ok(q.expression.includes('/2')||q.expression.includes('['));
 expectedTypes.add(q.prompt.match(/coefficient of (x²|x|y)/)[1]);
}
assert.deepEqual([...expectedTypes].sort(),['x','x²','y'].sort());
const fixtures=JSON.parse(await readFile(new URL('./fixtures/legacy-expressions.json',import.meta.url),'utf8'));
for(const f of fixtures)assert.deepEqual(JSON.parse(JSON.stringify(engine.generateStoredQuestion('9-expressions',f.seed,f.level))),f.question,'Existing student question must not change');
assert.equal(engine.seedForNewQuestion('9-expressions',0),-1);
assert.equal(engine.seedForNewQuestion('9-expressions',4294967295),-4294967296);
assert.equal(engine.seedForNewQuestion('9-systems',42),42);
const {default:Lab,DistributionDiagram}=await import(new URL('expressions-lab.mjs',out));
const html=renderToStaticMarkup(React.createElement(Lab));
for(const phrase of ['EXPRESSION','EQUATION','INEQUALITY','Commutative','Associative','Distributive','Negative groups','Two variables','Powers','Fractions','Nested groups','Check the whole expression','Multiplicative inverse'])assert.ok(html.includes(phrase),phrase);
const foundation=renderToStaticMarkup(React.createElement(Lab,{advanced:false}));
assert.ok(!foundation.includes('<option value="7">'),'Younger courses keep foundational challenge levels');
assert.ok(foundation.includes('Negative groups'));
await writeFile(new URL('lesson.html',out),html);
for(const [factor,a,b] of [[3,2,4],[-3,1,-2],[0,2,-3]]){
 const svg=renderToStaticMarkup(React.createElement(DistributionDiagram,{factor,a,b}));
 for(const [,path] of svg.matchAll(/\bd="([^"]*)"/g))assert.ok(!path.includes('−'),'SVG paths must use ASCII minus signs');
 await writeFile(new URL(`distribution-${factor}.svg`,out),svg);
}
console.log(`PASS: ${examples} generated expressions; ${checkedSteps} independently evaluated step/input combinations; 540 advanced questions; old-question compatibility; all lesson sections render.`);
