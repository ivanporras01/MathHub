import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=fileURLToPath(new URL('../',import.meta.url)),app=path.join(root,'app'),out=path.join(root,'work/learning-verification');
async function compile(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);
 if(entry.isDirectory()){await compile(file);continue;}
 if(!/\.tsx?$/.test(entry.name))continue;
 let source=await readFile(file,'utf8');
 if(file.endsWith('/teacher/coursework-manager.tsx'))source+='\nexport {ClassForm,AssignmentForm,StudentResultRow};';
 source=source.replace(/^import ['"].*\.css['"];$/gm,'');
 const imports=[...source.matchAll(/(from\s*['"])(\.{1,2}\/[^'"]+)(['"])/g)];
 for(const match of imports){const target=path.resolve(dir,match[2]);let isDirectory=false;try{isDirectory=(await stat(target)).isDirectory();}catch{}
  source=source.replace(match[0],`${match[1]}${match[2]}${isDirectory?'/index':''}.mjs${match[3]}`);
 }
 const destination=path.join(out,path.relative(app,file).replace(/\.tsx?$/,'.mjs'));
 await mkdir(path.dirname(destination),{recursive:true});
 await writeFile(destination,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText);
}}
await compile(app);
const load=name=>import(pathToFileURL(path.join(out,`${name}.mjs`)));
const {TOPICS}=await load('curriculum');
const {LEARNING_CONTENT}=await load('learning-content/index');
const {default:Lesson}=await load('lesson');
const {default:ParallelLab}=await load('parallel-lines-lab');
const {ANGLE_PAIRS,angleMeasures,parallelIntersections}=await load('parallel-model');
const {conceptLab}=await load('concept-models');
assert.deepEqual(Object.keys(LEARNING_CONTENT).sort(),TOPICS.map(t=>t.id).sort(),'Every live topic must have authored teaching content');
let rendered=0;
for(const topic of TOPICS){
 const content=LEARNING_CONTENT[topic.id];
 assert.ok(content.reasoning.length>=2&&content.example.steps.length>=2&&content.vocabulary.length>=2,topic.id);
 assert.equal(new Set(content.check.options.map(o=>o[0])).size,content.check.options.length,`${topic.id}: distinct answer choices`);
 assert.ok(content.check.options[content.check.correct]?.[1],`${topic.id}: explanatory feedback`);
 const html=renderToStaticMarkup(React.createElement(Lesson,{topic,student:{id:'local-test',firstName:'Local',lastName:'Test',grade:topic.grade,helpRequested:false},progress:{},stage:'learn',setStage:()=>{},onProgress:()=>{},onBack:()=>{},onHelp:()=>{},onNext:()=>{}}));
 assert.ok(html.includes('Build the idea before the procedure.')&&html.includes('A worked connection.')&&html.includes('Check your understanding'.toUpperCase()),`${topic.id}: all teaching stages render`);
 assert.ok(!/NaN|undefined degrees/.test(html),`${topic.id}: invalid diagram output`);
 if(topic.id==='11-parallel'||topic.id==='10-radicals')await writeFile(path.join(out,`${topic.id}.html`),html);
 rendered++;
}
// Independently recover the acute/obtuse sector from vector bearings, and verify
// the drawn intersections lie on both geometric lines for every slider step.
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≠ ${b}`);
let configurations=0;
for(let theta=35;theta<=145;theta++)for(let tilt=-15;tilt<=15;tilt++){
 const values=angleMeasures(theta,tilt),centers=parallelIntersections(theta,tilt);
 const rad=x=>x*Math.PI/180;
 const lower=Math.acos(Math.cos(rad(theta))*Math.cos(rad(tilt))+Math.sin(rad(theta))*Math.sin(rad(tilt)))*180/Math.PI;
 close(values.e,lower);close(values.f,180-lower);
 close(values.a+values.b+values.c+values.d,360);close(values.e+values.f+values.g+values.h,360);
 for(const [x,y] of centers)close((x-300)*Math.sin(rad(theta))+(y-200)*Math.cos(rad(theta)),0);
 close(centers[0][1],130);close(centers[1][1],270-(centers[1][0]-300)*Math.tan(rad(tilt)));
 assert.ok(centers.every(p=>p.every(Number.isFinite)));
 for(const info of Object.values(ANGLE_PAIRS))for(const [a,b] of info.pairs){
  const measure=info.sum?values[a]+values[b]:values[a]-values[b];
  if(!info.parallelOnly||tilt===0)close(measure,info.sum?180:0);
  else assert.ok(Math.abs(measure-(info.sum?180:0))>0.5,'Cross-intersection parallel theorem must not survive nonzero tilt');
 }
 configurations++;
}
// Every specialized model must produce finite, distinct choices at boundary values.
let modelStates=0;
for(const id of ['6-fractions','7-rational','7-percent','8-percent','8-exponents','9-exponents','11-trigonometry','11-circles']){
 const topic=TOPICS.find(t=>t.id===id);
 const states=id.includes('exponents')?[{a:0,b:1,c:0},{a:4,b:4,c:4}]:id==='7-rational'?[{a:-1,b:1,c:4},{a:2,b:4,c:4},{a:5,b:4,c:4}]:id==='6-fractions'?[{a:0,b:1,c:4},{a:3,b:4,c:4}]:id.includes('percent')?[{a:1,b:2,c:1},{a:9,b:2,c:10}]:id==='11-circles'?[{a:1,b:1,c:1},{a:5,b:5,c:4}]:[{a:1,b:1,c:4},{a:6,b:5,c:4}];
 for(const values of states)for(let step=0;step<4;step++){
  const model=conceptLab(topic,{...values,step,setA:()=>{},setB:()=>{},setC:()=>{},setStep:()=>{}});
  assert.equal(new Set(model.choices).size,model.choices.length,id);
  const html=renderToStaticMarkup(React.createElement(React.Fragment,null,model.scene,model.controls));
  assert.ok(!/NaN|Infinity/.test(html),id);modelStates++;
 }
}
await writeFile(path.join(out,'parallel-lab.html'),renderToStaticMarkup(React.createElement(ParallelLab)));
console.log(`PASS: ${rendered}/${TOPICS.length} full lessons rendered; ${configurations} independently checked angle configurations; ${modelStates} specialist model boundary states.`);

// Assignment percentages represent all topic milestones, independently of lifetime progress.
const {taskSummary}=await load('coursework');
const task={id:'test-task',classId:'test-class',className:'Test class',title:'Equations review',instructions:'Show your reasoning.',dueAt:2000,goal:2,topicIds:['7-equations','6-order'],archived:false,createdAt:1};
const full={learned:true,guided:true,independent:2,correct:2,attempts:2,hints:0};
assert.equal(taskSummary(task,{},1000).status,'Not started');
assert.equal(taskSummary(task,{startedAt:500},1000).status,'In progress');
assert.equal(taskSummary(task,{},3000).status,'Overdue');
assert.equal(taskSummary(task,{progress:{'7-equations':full}},1000).percent,50);
assert.equal(taskSummary(task,{progress:{'7-equations':full}},1000).complete,false);
const completedWork={progress:{'7-equations':full,'6-order':full},startedAt:100,completedAt:1900,updatedAt:1900};
assert.equal(taskSummary(task,completedWork,3000).status,'Completed');
assert.equal(taskSummary(task,{...completedWork,completedAt:2100},3000).status,'Completed late');
const {ClassForm,AssignmentForm,StudentResultRow}=await load('teacher/coursework-manager');
const room={id:'test-class',name:'Test class',course:7,joinCode:'MHABCDEFGH',archived:false,studentIds:['test-student']};
for(const [Component,props,expected] of [
 [ClassForm,{onSave:async()=>{}},['Class name','Create class','Main course']],
 [AssignmentForm,{room,onSave:async()=>{}},['Assignment title','Independent answers per topic','Choose topics','Publish to Test class']],
 [AssignmentForm,{room,existing:task,onSave:async()=>{}},['Equations review','Save changes','Due date and time']],
 [StudentResultRow,{name:'Test Learner',expanded:true,toggle:()=>{},work:{id:'test-student',enrolled:true,...completedWork},assignment:task,summary:taskSummary(task,completedWork),totals:{correct:4,attempts:4},needsHelp:true,helpTopic:'7-equations',onHelp:async()=>{},working:false},['Test Learner','100%','Mark helped','Topics in Equations review']],
]){const html=renderToStaticMarkup(React.createElement(Component,props));for(const phrase of expected)assert.ok(html.includes(phrase),phrase);assert.ok(!/NaN|undefined/.test(html));}
const assignedLesson=renderToStaticMarkup(React.createElement(Lesson,{topic:TOPICS.find(t=>t.id==='7-equations'),student:{id:'test-student',firstName:'Test',lastName:'Learner',grade:7},progress:{'7-equations':full},assignment:task,stage:'practice',setStage:()=>{},onProgress:()=>{},onBack:()=>{},onHelp:()=>{},onNext:()=>{}}));
assert.ok(assignedLesson.includes('Equations review')&&assignedLesson.includes('Assignment topic complete')&&assignedLesson.includes('Goal: 2 correct first tries without hints'));
console.log('PASS: assignment milestone/status calculations, teacher forms, per-student topic report, and assigned lesson rendering.');
