import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const out=new URL('../work/transformations-verification/',import.meta.url);await mkdir(out,{recursive:true});
for(const name of ['transformation-model','transformations-lab','lab-diagrams','curriculum','extra-topics','high-school-topics']){
 const jsx=['transformations-lab','lab-diagrams'].includes(name);
 let source=await readFile(new URL(`../app/${name}.${jsx?'tsx':'ts'}`,import.meta.url),'utf8');
 source=source.replace(/^import ['"].*\.css['"];$/gm,'').replace(/(['"])(\.\/[a-z-]+)\1/g,(_,q,n)=>`${q}${n}.mjs${q}`);
 await writeFile(new URL(`${name}.mjs`,out),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText);
}
const {FIGURES,TRANSFORMS,transformPoint,graphExtent}=await import(new URL('transformation-model.mjs',out));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
const signedArea=p=>p.reduce((sum,[x,y],i)=>{const q=p[(i+1)%p.length];return sum+x*q[1]-q[0]*y;},0)/2;
const distance=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
const o={dx:3,dy:-2,scale:2};
assert.deepEqual(transformPoint([2,3],'reflect-x',o),[2,-3]);
assert.deepEqual(transformPoint([2,3],'reflect-y',o),[-2,3]);
assert.deepEqual(transformPoint([2,3],'rotate-90',o),[-3,2]);
assert.deepEqual(transformPoint([2,3],'rotate-180',o),[-2,-3]);
assert.deepEqual(transformPoint([2,3],'rotate-270',o),[3,-2]);
assert.deepEqual(transformPoint([2,3],'translate',o),[5,1]);
assert.deepEqual(transformPoint([2,3],'dilate',o),[4,6]);
let checked=0;
for(const figure of [...FIGURES,{id:'custom',points:[[-2,-3],[2,-2],[4,1],[1,4],[-3,1]]}])for(const {id:mode} of TRANSFORMS)for(const scale of [.5,1,1.5,2,3])for(const offset of [-4,0,4]){
 const original=figure.points.map(([x,y])=>[x+offset,y-offset]);
 const image=original.map(p=>transformPoint(p,mode,{dx:-5,dy:5,scale}));
 const factor=mode==='dilate'?scale:1;
 for(let i=0;i<original.length;i++)for(let j=0;j<original.length;j++)near(distance(image[i],image[j]),distance(original[i],original[j])*factor);
 if(original.length>2){const orientation=mode.startsWith('reflect')?-1:1;near(signedArea(image),signedArea(original)*factor*factor*orientation);}
 const extent=graphExtent([...original,...image]);assert.ok([...original,...image].flat().every(n=>Math.abs(n)<extent));checked++;
}
const {default:Lab}=await import(new URL('transformations-lab.mjs',out));const html=renderToStaticMarkup(React.createElement(Lab));
for(const phrase of ['Triangle','Rectangle','Square','Pentagon','Hexagon','Custom polygon','Start step by step','Original (x, y)','Image (x′, y′)','Check prediction'])assert.ok(html.includes(phrase),phrase);
assert.ok(html.includes('A → A′')&&html.includes('C → C′'));
console.log(`PASS: ${checked} figure/transform/scale/position combinations preserve distances, area and orientation as expected; all coordinates fit the graph; default triangle and controls render.`);
