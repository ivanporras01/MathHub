'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2,Eye,Lightbulb,RefreshCw} from 'lucide-react';
import {generateQuestion} from './question-engine';
import {isCorrect,parseAnswer,type Topic} from './curriculum';
import {StepGuidance} from './step-guidance';
import './visual-walkthrough.css';

// Token colors reinforce meaning; the legend and written steps carry the same information.
export function ColorMath({text}:{text:string}){
 return <span className="vw-math">{text.split(/(\^-?\d+(?:\.\d+)?|-?\d+(?:\.\d+)?|[=+−×÷<>≤≥]|(?<![a-zA-Z])[a-zA-Z](?![a-zA-Z]))/g).map((part,i)=>part.startsWith('^')?<sup className="vw-number" key={i}>{part.slice(1)}</sup>:<span key={i} className={/^-?\d/.test(part)?'vw-number':/^[=+−×÷<>≤≥]$/.test(part)?'vw-operation':/^[a-zA-Z]$/.test(part)?'vw-variable':''}>{part}</span>)}</span>;
}

export default function VisualWalkthrough({topic,seed,onComplete}:{topic:Topic;seed:number;onComplete:()=>void}){
 const [level,setLevel]=useState(1);
 const [variant,setVariant]=useState(0),[index,setIndex]=useState(0),[unlocked,setUnlocked]=useState(0);
 const [input,setInput]=useState(''),[feedback,setFeedback]=useState('');
 const question=generateQuestion(topic.id,seed+variant*104729,level),step=question.steps[index];
 const shown=index<unlocked,finished=unlocked===question.steps.length;
 function reveal(){const next=Math.max(unlocked,index+1);setUnlocked(next);if(next===question.steps.length)onComplete();}
 function move(next:number){setIndex(next);setInput('');setFeedback('');}
 function check(e:React.FormEvent){e.preventDefault();if(parseAnswer(input)===null){setFeedback('Enter a number, decimal, or fraction.');return;}if(isCorrect(input,step.answer)){setFeedback('Yes! Compare your reasoning with the explanation below.');reveal();}else setFeedback('Not yet. Try the calculation again, or reveal this step to see the reasoning.');}
 return <article className="lesson-panel visual-walkthrough" aria-label={`Visual worked example: ${topic.title}`}>
  <div className="panel-heading"><div><span className="eyebrow">PREDICT · REVEAL · UNDERSTAND</span><h2>A similar example, one step at a time.</h2></div><span className="pill">Example {variant+1}</span></div>
  <div className="vw-levels"><label htmlFor={`example-level-${topic.id}`}>Example difficulty</label><select id={`example-level-${topic.id}`} value={level} onChange={e=>{setLevel(Number(e.target.value));setIndex(0);setUnlocked(0);setInput('');setFeedback('');}}><option value={1}>1 · Getting started</option><option value={2}>2 · Building confidence</option><option value={3}>3 · Growing stronger</option></select><small>Choose a level, then predict each step.</small></div><p>This is a learning example. At every step, try the calculation first, learn WHY it works, and check that the result makes sense. A different question follows in practice.</p>
  <div className="vw-legend" aria-label="Math color key"><span className="vw-number">123 · Numbers</span><span className="vw-variable">x · Variables</span><span className="vw-operation">+ · Operations</span><span className="vw-result-label">✓ · Completed step</span></div>
  <div className="vw-problem"><span className="eyebrow">START WITH THE QUESTION</span><p>{question.prompt}</p>{question.expression&&<ColorMath text={question.expression}/ >}{question.note&&<p className="input-help">{question.note}</p>}</div>
  <nav className="vw-timeline" aria-label="Worked example steps">{question.steps.map((s,i)=><button type="button" key={i} disabled={i>unlocked} aria-current={index===i?'step':undefined} onClick={()=>move(i)} className={index===i?'current':i<unlocked?'done':''}><span>{i<unlocked?<CheckCircle2 size={17}/>:i+1}</span><span>{s.title}</span></button>)}</nav>
  <div className="vw-active" aria-live="polite">
   <div className="vw-step-heading"><span className="vw-step-number">{index+1}</span><div><span className="eyebrow">STEP {index+1} OF {question.steps.length}</span><h3>{step.title}</h3></div></div>
   {index>0&&<div className="vw-previous"><small>FROM THE PREVIOUS STEP</small><ColorMath text={question.steps[index-1].math}/></div>}
   {!shown?<><form onSubmit={check} className="vw-predict"><label htmlFor={`predict-${topic.id}`}>{step.ask}</label><div className="answer-row"><input id={`predict-${topic.id}`} className="answer-input" value={input} onChange={e=>setInput(e.target.value)} autoComplete="off" placeholder="Predict this step"/><button type="submit" className="button dark" disabled={!input.trim()}>Check prediction</button></div></form><button className="text-button" onClick={()=>{setFeedback('');reveal();}}><Eye size={17}/>Reveal and explain this step</button></>:<div className="vw-reveal"><div className="vw-result"><small>STEP {index+1}: SHOW THE CALCULATION</small><ColorMath text={step.math}/></div><StepGuidance topic={topic} step={step} index={index} showPitfall={index===question.steps.length-1}/><div className="vw-step-sense"><b>CHECK YOUR THINKING</b><p>{step.ask} The answer at this step is {step.answer}. Explain how the calculation produces it.</p></div><p className="vw-reflect">Try explaining WHY the step works in your own words before continuing.</p></div>}
   {feedback&&<p className="vw-feedback" role="status">{feedback}</p>}
  </div>
  <div className="vw-navigation"><button className="button light" disabled={index===0} onClick={()=>move(index-1)}><ArrowLeft size={16}/>Previous</button><span>Step {index+1} / {question.steps.length}</span><button className="button dark" disabled={!shown||index===question.steps.length-1} onClick={()=>move(index+1)}>Next step<ArrowRight size={16}/></button></div>
  {finished&&<div className="vw-finished"><CheckCircle2 size={21}/><p>Example explored! Continue to “Try with me” below to practice with different numbers.</p></div>}
  <button className="text-button vw-new" onClick={()=>{setVariant(v=>v+1);setIndex(0);setUnlocked(0);setInput('');setFeedback('');}}><RefreshCw size={16}/>Explore another similar example</button>
 </article>;
}
