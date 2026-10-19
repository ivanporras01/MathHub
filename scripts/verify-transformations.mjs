import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const out=new URL('../work/transformations-verification/',import.meta.url);await mkdir(out,{recursive:true});
for(const name of ['transformation-model','figure-coordinates','transformations-lab','lab-diagrams','curriculum','extra-topics','high-school-topics']){
 const jsx=['transformations-lab','lab-diagrams'].includes(name);
 let source=await readFile(new URL(`../app/${name}.${jsx?'tsx':'ts'}`,import.meta.url),'utf8');
 source=source.replace(/^import ['"].*\.css['"];$/gm,'').replace(/(['"])(\.\/[a-z-]+)\1/g,(_,q,n)=>`${q}${n}.mjs${q}`);
 await writeFile(new URL(`${name}.mjs`,out),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText);
}
const {FIGURES,TRANSFORMS,transformPoint,graphExtent,rotationTrace,transformationRule,placeVertexLabels}=await import(new URL('transformation-model.mjs',out));
const {coordinateDraft,readFigureCoordinates}=await import(new URL('figure-coordinates.mjs',out));
const fractional=readFigureCoordinates([['-3/2','−1'],['2.5','-1'],['1/2','3 1/2']]);
assert.equal(fractional.ok,true);assert.deepEqual(fractional.points,[[-1.5,-1],[2.5,-1],[.5,3.5]]);
for(const points of [...FIGURES.map(f=>f.points),[[-50,-50],[50,-50],[50,50],[-50,50]],[[0,0],[4,0],[4,4],[2,1],[0,4]]])assert.deepEqual(readFigureCoordinates(coordinateDraft(points)),{ok:true,points});
for(const draft of [[['','1']],[['abc','0']],[['1/0','0']],[['Infinity','0']],[['1,5','0']],[['50.1','0']],[['0','-51']]]){const result=readFigureCoordinates(draft);assert.equal(result.ok,false);assert.ok(Object.keys(result.errors).length);}
for(const points of [[[0,0],[1,1]],[[0,0],[0,0],[1,1]],[[0,0],[1,1],[2,2]],[[0,0],[3,3],[0,3],[3,0]],[[0,0],[4,0],[4,4],[2,0],[0,4]],Array.from({length:9},(_,i)=>[Math.cos(i),Math.sin(i)])])assert.equal(readFigureCoordinates(coordinateDraft(points)).ok,false);
assert.equal(readFigureCoordinates([['-1/2','3/4']]).ok,true);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
const signedArea=p=>p.reduce((sum,[x,y],i)=>{const q=p[(i+1)%p.length];return sum+x*q[1]-q[0]*y;},0)/2;
const distance=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
const o={dx:3,dy:-2,scale:2};
assert.deepEqual(transformPoint([2,3],'reflect-x',o),[2,-3]);
assert.deepEqual(transformPoint([2,3],'reflect-y',o),[-2,3]);
assert.deepEqual(transformPoint([2,3],'reflect-diagonal',o),[3,2]);
assert.deepEqual(transformPoint([2,3],'rotate-90',o),[-3,2]);
assert.deepEqual(transformPoint([2,3],'rotate-180',o),[-2,-3]);
assert.deepEqual(transformPoint([2,3],'rotate-270',o),[3,-2]);
assert.deepEqual(transformPoint([2,3],'rotate-90',{...o,direction:'cw'}),[3,-2]);
assert.deepEqual(transformPoint([2,3],'rotate-270',{...o,direction:'cw'}),[-3,2]);
assert.equal(transformationRule('rotate-90',{...o,direction:'cw'}),'(x, y) → (y, −x)');
assert.equal(transformationRule('rotate-270',{...o,direction:'cw'}),'(x, y) → (−y, x)');
assert.deepEqual(transformPoint([2,3],'translate',o),[5,1]);
assert.deepEqual(transformPoint([2,3],'dilate',o),[4,6]);
let checked=0;
for(const figure of [...FIGURES,{id:'custom',points:[[-2,-3],[2,-2],[4,1],[1,4],[-3,1]]}])for(const {id:mode} of TRANSFORMS)for(const direction of ['cw','ccw'])for(const scale of [.5,1,1.5,2,3])for(const offset of [-4,0,4]){
 const original=figure.points.map(([x,y])=>[x+offset,y-offset]);
 const image=original.map(p=>transformPoint(p,mode,{dx:-5,dy:5,scale,direction}));
 if(mode.startsWith('rotate'))for(const point of original){
  const trace=rotationTrace(point,Number(mode.split('-')[1]),direction),end=trace.at(-1),expected=transformPoint(point,mode,{...o,direction});near(end[0],expected[0]);near(end[1],expected[1]);
  const roundTrip=transformPoint(expected,mode,{...o,direction:direction==='cw'?'ccw':'cw'});near(roundTrip[0],point[0]);near(roundTrip[1],point[1]);
  for(const p of trace)near(Math.hypot(...p),Math.hypot(...point));
 }
 const factor=mode==='dilate'?scale:1;
 for(let i=0;i<original.length;i++)for(let j=0;j<original.length;j++)near(distance(image[i],image[j]),distance(original[i],original[j])*factor);
 if(original.length>2){const orientation=mode.startsWith('reflect')?-1:1;near(signedArea(image),signedArea(original)*factor*factor*orientation);}
 const extent=graphExtent([...original,...image]);assert.ok([...original,...image].flat().every(n=>Math.abs(n)<extent));checked++;
}
const {default:Lab}=await import(new URL('transformations-lab.mjs',out));const html=renderToStaticMarkup(React.createElement(Lab));
for(const phrase of ['Triangle','Rectangle','Square','Pentagon','Hexagon','Custom polygon','Start step by step','Original (x, y)','Image (x′, y′)','Check prediction'])assert.ok(html.includes(phrase),phrase);
for(const phrase of ['Enter your figure','Draw my figure','Apply transformation','Compare coordinates before and after','Vertex A x','Vertex C y','Add vertex','Remove last vertex'])assert.ok(html.includes(phrase),phrase);
assert.ok(html.indexOf('Vertex A x')<html.indexOf('class="tf-graph"'),'coordinate editor is visible before the graph');
assert.ok(html.includes('A → A′')&&html.includes('C → C′'));
const svg=html.match(/<svg class="tf-graph"[\s\S]*?<\/svg>/)[0];
for(const coordinateLabel of ['A (1, 1)','B (4, 1)','C (2, 4)','A′ (-1, 1)','B′ (-1, 4)','C′ (-4, 2)'])assert.ok(svg.includes(coordinateLabel),coordinateLabel);
assert.ok(html.includes('Clockwise (CW)')&&html.includes('Counterclockwise (CCW)'));
for(const id of ['original-outline','image-outline'])assert.ok(new RegExp('data-testid="'+id+'"').test(svg));
for(const box of placeVertexLabels([{text:'A (1, 1)',x:300,y:250,image:false},{text:'A′ (1, 1)',x:300,y:250,image:true}]))assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=560&&box.y+box.height<=560);
await writeFile(new URL('rotation.svg',out),svg);
for(const {id:mode} of TRANSFORMS){
 const custom=renderToStaticMarkup(React.createElement(Lab,{initialPoints:fractional.points,initialMode:mode}));
 const expected=fractional.points.map(p=>transformPoint(p,mode,{dx:2,dy:1,scale:2}));
 expected.forEach((p,i)=>assert.ok(custom.includes(`${String.fromCharCode(65+i)}′ (${p.join(', ')})`),`${mode}: ${p}`));
 assert.ok(!/NaN|Infinity/.test(custom));
}
const before=renderToStaticMarkup(React.createElement(Lab,{initialPoints:fractional.points,initialApplied:false}));
assert.ok(before.includes('Apply to reveal'));assert.ok(before.includes('data-testid="original-outline"'));assert.ok(!before.includes('data-testid="image-outline"'));assert.ok(!before.includes('class="tf-image-dot"'));assert.ok(!before.includes('class="tf-focus"'));
const point=renderToStaticMarkup(React.createElement(Lab,{initialPoints:[[1.5,-2]]}));assert.ok(point.includes('Vertex P x'));assert.ok(!point.includes('Add vertex'));assert.ok(point.includes('P′ (2, 1.5)'));
await writeFile(new URL('custom.svg',out),renderToStaticMarkup(React.createElement(Lab,{initialPoints:fractional.points})).match(/<svg class="tf-graph"[\s\S]*?<\/svg>/)[0]);
console.log(`PASS: ${checked} figure/transform/scale/position combinations preserve distances, area and orientation as expected; coordinate entry accepts fractions and validates bounds, duplicates, crossings, and area; custom figures render all transformations; results stay hidden until applied.`);
