'use client';
import {useState} from 'react';
import {BookOpen,CheckCircle2,Lightbulb,ArrowRight} from 'lucide-react';
import type {Topic} from './curriculum';
import {LEARNING_CONTENT} from './learning-content';
import './learning-guide.css';

export function LessonFoundation({topic}:{topic:Topic}){
 const content=LEARNING_CONTENT[topic.id];
 return <article className="lesson-panel learning-foundation" id={`understand-${topic.id}`}>
  <span className="eyebrow">UNDERSTAND · CONNECT · EXPLAIN</span><h2>Build the idea before the procedure.</h2>
  <p className="learning-goal"><BookOpen size={20}/><span><strong>Your goal</strong>{content.goal}</span></p>
  <p className="learning-ready"><strong>Bring this with you:</strong> {content.ready}</p>
  <dl className="learning-vocabulary">{content.vocabulary.map(([term,definition])=><div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl>
  <div className="learning-reasons">{content.reasoning.map(([title,body],i)=><section key={title}><span className="learning-number">0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></section>)}</div>
 </article>;
}

export function ExplorationPrompt({topic}:{topic:Topic}){
 const [open,setOpen]=useState(false);
 const [prompt,insight]=LEARNING_CONTENT[topic.id].investigate;
 return <div className="learning-investigate"><span className="eyebrow">A QUESTION TO INVESTIGATE</span><p>{prompt}</p><button className="text-button" aria-expanded={open} aria-controls={`insight-${topic.id}`} onClick={()=>setOpen(!open)}><Lightbulb size={16}/>{open?'Hide the reasoning':'Compare with the reasoning'}</button>{open&&<p id={`insight-${topic.id}`} className="learning-insight">{insight}</p>}</div>;
}

export function ReasoningExample({topic}:{topic:Topic}){
 const example=LEARNING_CONTENT[topic.id].example;
 return <article className="lesson-panel learning-example" id={`reason-${topic.id}`}><span className="eyebrow">SEE THE REASONING</span><h2>A worked connection.</h2><p className="learning-example-question">{example.question}</p><ol className="learning-example-steps">{example.steps.map(([math,why],i)=><li key={i}><span className="learning-number">{i+1}</span><div><p className="learning-math">{math}</p><p><strong>Why:</strong> {why}</p></div></li>)}</ol><p className="learning-reflect">Explain the connection in your own words, then try the changing examples below.</p></article>;
}

export function ConceptCheck({topic}:{topic:Topic}){
 const {check}=LEARNING_CONTENT[topic.id];
 const [chosen,setChosen]=useState<number|null>(null);
 const correct=chosen===check.correct;
 return <article className="lesson-panel learning-check" id={`check-${topic.id}`}><span className="eyebrow">CHECK YOUR UNDERSTANDING</span><h2>Choose a reason, not just a result.</h2><p className="learning-check-question">{check.question}</p><div className="learning-check-options" role="group" aria-label={check.question}>{check.options.map(([label],i)=><button key={label} type="button" aria-pressed={chosen===i} className={chosen===i?(correct?'is-correct':'is-retry'):''} onClick={()=>setChosen(i)}><span>{String.fromCharCode(65+i)}</span>{label}{chosen===i&&correct&&<CheckCircle2 size={19}/>}</button>)}</div><div aria-live="polite" aria-atomic="true">{chosen!==null&&<div className={`learning-check-feedback ${correct?'is-correct':''}`}>{correct?<CheckCircle2 size={22}/>:<Lightbulb size={22}/>}<p><strong>{correct?'That reasoning works.':'Let’s examine that choice.'}</strong>{check.options[chosen][1]}{!correct&&' You can choose again.'}</p></div>}</div><p className="learning-reflect">This check is for understanding. Your saved mastery still comes from the guided lesson and independent practice.</p></article>;
}

export function LearningNavigation({topic}:{topic:Topic}){
 return <nav className="learning-nav" aria-label="Jump within this lesson">{[['understand','Understand'],['explore','Explore'],['reason','Reason'],['example','Practice a step'],['check','Check the idea']].map(([id,label])=><a key={id} href={`#${id}-${topic.id}`}>{label}<ArrowRight size={13}/></a>)}</nav>;
}
