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
const {StepGuidance,clearStepReason,connectedRule}=await load('step-guidance');
const {generateQuestion}=await load('question-engine');
const {solveSystem,solvingSteps,value}=await load('systems-model');
const {default:ParallelLab}=await load('parallel-lines-lab');
const {ANGLE_PAIRS,angleMeasures,parallelIntersections}=await load('parallel-model');
const {conceptLab}=await load('concept-models');
assert.deepEqual(Object.keys(LEARNING_CONTENT).sort(),TOPICS.map(t=>t.id).sort(),'Every live topic must have authored teaching content');
let rendered=0;
for(const topic of TOPICS){
 const content=LEARNING_CONTENT[topic.id];
 const example=generateQuestion(topic.id,81293+TOPICS.indexOf(topic)*7937+38472,1);
 assert.ok(example.steps.length>=2,topic.id+': worked examples need multiple steps');
 for(const [stepIndex,step] of example.steps.entries()){
  const reason=clearStepReason(topic,step,stepIndex),rule=connectedRule(topic,step,stepIndex);
  assert.ok(reason.length>=8&&!reason.startsWith('Follow the same operation'),topic.id+': specific reason for step '+stepIndex);
  assert.ok(rule.length>=12,topic.id+': related mathematical rule');
  const explanation=renderToStaticMarkup(React.createElement(StepGuidance,{topic,step,index:stepIndex,showPitfall:true}));
  assert.ok(explanation.includes('WHY THIS STEP WORKS')&&explanation.includes('AVOID THIS MISTAKE'),topic.id+': rendered explanation');
 }

 assert.ok(content.reasoning.length>=2&&content.example.steps.length>=2&&content.vocabulary.length>=2,topic.id);
 assert.equal(new Set(content.check.options.map(o=>o[0])).size,content.check.options.length,`${topic.id}: distinct answer choices`);
 assert.ok(content.check.options[content.check.correct]?.[1],`${topic.id}: explanatory feedback`);
 const html=renderToStaticMarkup(React.createElement(Lesson,{topic,student:{id:'local-test',firstName:'Local',lastName:'Test',grade:topic.grade,helpRequested:false},progress:{},stage:'learn',setStage:()=>{},onProgress:()=>{},onBack:()=>{},onHelp:()=>{},onNext:()=>{}}));
 assert.ok(html.includes('Build the idea before the procedure.')&&html.includes('A worked connection.')&&html.includes('Check your understanding'.toUpperCase()),`${topic.id}: all teaching stages render`);
 assert.ok(!/NaN|undefined degrees/.test(html),`${topic.id}: invalid diagram output`);
 if(topic.id==='11-parallel'||topic.id==='10-radicals')await writeFile(path.join(out,`${topic.id}.html`),html);
 rendered++;
}
// Broad, reproducible audit of all six courses and every difficulty level.
// These are NEW practice examples. Stored issued questions are not changed.
let questionCases=0;
const missingAnswerSteps=new Map();
const formatFaults=new Map();
for(const topic of TOPICS){
 for(let level=1;level<=3;level++)for(let seed=0;seed<125;seed++){
  const q=generateQuestion(topic.id,seed*101+level*9973,level);
  assert.ok(q.prompt.length>=8&&q.hint.length>=8,topic.id+': missing question or teaching hint');
  assert.ok(Number.isFinite(q.answer),topic.id+': non-finite final answer');
  assert.ok(q.steps.length>=2,topic.id+': too few solution steps');
  const numbers=q.steps.map(st=>st.answer);
  for(const [i,st] of q.steps.entries()){
   assert.ok(st.title.length>=3&&st.text.length>=10&&st.math.length>=3&&st.ask.length>=6,topic.id+': incomplete step '+i);
   assert.ok(Number.isFinite(st.answer),topic.id+': invalid step answer '+i);
   if(/\\bNaN\\b|\\bInfinity\\b/.test(st.math)){formatFaults.set(topic.id,(formatFaults.get(topic.id)||0)+1);}
  }
  if(!numbers.some(n=>Math.abs(n-q.answer)<=1e-8*Math.max(1,Math.abs(n),Math.abs(q.answer))))
   missingAnswerSteps.set(topic.id,(missingAnswerSteps.get(topic.id)||0)+1);
  questionCases++;
 }
}
assert.equal(formatFaults.size,0,'Generated math contains invalid values: '+JSON.stringify([...formatFaults]));
console.log('AUDIT: '+questionCases+' question variants across '+TOPICS.length+' topics, three difficulties; answer-step gaps: '+JSON.stringify([...missingAnswerSteps]));

// Verify cancellation, equality, and feedback across all slider coefficients.
let systemChecks=0;
for(let m1=-3;m1<=3;m1++)for(let m2=-3;m2<=3;m2++)for(let b1=-2;b1<=2;b1++)for(let b2=-2;b2<=2;b2++){
 const system={m1,m2,b1,b2},solution=solveSystem(system);
 const elimination=solvingSteps(system,'elimination'),columns=elimination[2].columns;
 assert.equal(columns?.length,3,'Elimination has x/y/constant columns');
 assert.equal(columns[0].result.replace('−','-'),String(m2-m1)+'x');
 assert.equal(columns[1].result,'0y');
 assert.equal(columns[2].result.replace('−','-'),String(b1-b2));
 assert.ok(elimination[2].checkpoint?.question.includes('add up'));
 if(solution.kind==='one'){
  const x=value(solution.x),y=value(solution.y);
  assert.ok(Math.abs(y-(m1*x+b1))<1e-9);
  assert.ok(Math.abs(y-(m2*x+b2))<1e-9);
 }
 assert.ok(solvingSteps(system,'substitution').length>=4);
 assert.equal(solvingSteps(system,'graphing').length,4);
 systemChecks++;
}
console.log('PASS: '+systemChecks+' system equations verify elimination columns and correct intersections.');

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
