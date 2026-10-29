'use client';
import {useState} from 'react';
import {ArrowRight,Check,Clock,Search,ChevronDown,Target} from 'lucide-react';
import {courseStages,orderedCourseTopics} from './learning-path';
import type {Grade,Topic} from './curriculum';
import {TopicArt,ProgressBar,mastered,percent,type ProgressMap} from './ui';
import './course-catalog.css';

type Props={grade:Grade;progress:ProgressMap;search:string;onOpen:(t:Topic)=>void;onClearSearch:()=>void};
export default function CourseCatalog({grade,progress,search,onOpen,onClearSearch}:Props){
 const [unit,setUnit]=useState('all'),stages=courseStages(grade),ordered=orderedCourseTopics(grade),query=search.trim().toLocaleLowerCase();
 const active=stages.some(s=>s.id===unit)?unit:'all';
 const matches=(t:Topic)=>(t.title+' '+t.category+' '+t.description+' '+t.idea).toLocaleLowerCase().includes(query);
 const visible=stages.filter(s=>(active==='all'||s.id===active)&&[...s.topics,...s.focusTopics].some(matches));
 const next=ordered.find(t=>!mastered(progress[t.id]));
 function card(t:Topic,focused=false){
  const p=progress[t.id],done=mastered(p);
  return <button type="button" className={'topic-card '+t.color+(focused?' skill-practice-card':'')} key={t.id} onClick={()=>onOpen(t)}>
   <div className="topic-picture"><TopicArt topic={t}/><span className="lesson-number">{String(ordered.indexOf(t)+1).padStart(2,'0')}</span>{done&&<span className="mastery-badge"><Check size={13}/>Mastered</span>}</div>
   <div className="topic-content"><span className="card-category">{focused?'FOCUSED PRACTICE · '+t.category:t.category}</span><h3>{t.title}</h3><p>{t.description}</p><div className="card-meta"><span><Clock size={13}/>{t.minutes} min lesson</span><span className="card-arrow"><ArrowRight size={17}/></span></div>{p&&<ProgressBar value={percent(p)} label={t.title+' progress'}/>}</div>
  </button>;
 }
 return <div className="course-catalog">
  <div className="course-route-heading"><div><span className="eyebrow">YOUR STEP-BY-STEP COURSE MAP</span><h3>Follow the sequence—or choose the skill you need.</h3><p>Related topics belong together. Earlier courses build foundations, while later courses deepen those ideas. Focused polynomial practice is grouped under the main operations studio.</p></div>{next&&<button type="button" className="button dark small" onClick={()=>onOpen(next)}>Next unfinished topic <ArrowRight size={15}/></button>}</div>
  <nav className="course-route-filters" aria-label="Filter learning units">
    <button type="button" className={active==='all'?'selected':''} aria-pressed={active==='all'} onClick={()=>setUnit('all')}>All units</button>
    {stages.map((s,i)=><button type="button" key={s.id} className={active===s.id?'selected':''} aria-pressed={active===s.id} onClick={()=>setUnit(active===s.id?'all':s.id)}>{i+1}. {s.title}</button>)}
  </nav>
  {visible.length?visible.map(s=>{
    const i=stages.indexOf(s),main=s.topics.filter(matches),focus=s.focusTopics.filter(matches),all=[...s.topics,...s.focusTopics],complete=all.filter(t=>mastered(progress[t.id])).length,rate=Math.round(100*complete/all.length),first=s.topics.find(t=>!mastered(progress[t.id]))||s.topics[0];
    return <section key={s.id} className="course-route-unit" aria-label={s.title}>
      <header className="course-route-unit-header"><span className="course-route-step">UNIT {String(i+1).padStart(2,'0')}</span><div className="course-route-unit-copy"><h3>{s.title}</h3><p>{s.summary}</p></div><div className="course-route-status"><span>{complete}/{all.length} mastered</span><div className="course-route-meter" role="progressbar" aria-label={s.title+' mastery'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={rate}><i style={{width:rate+'%'}}/></div></div>{!query&&<button type="button" className="course-route-start" onClick={()=>onOpen(first)}>{complete===all.length?'Review unit':'Start / continue'} <ArrowRight size={16}/></button>}</header>
      {main.length>0&&<div className="topics-grid">{main.map(t=>card(t))}</div>}
      {focus.length>0&&<details className="course-route-focus" open={query?true:undefined} key={query?'searched':'closed'}><summary><span><Target size={18}/>Focused polynomial practice <small>Optional single-operation lessons with independent progress</small></span><ChevronDown size={18}/></summary><div className="topics-grid">{focus.map(t=>card(t,true))}</div></details>}
    </section>;
  }):<div className="empty-state course-route-empty"><Search size={28}/><h3>No matching lessons</h3><p>Try another word, clear the search, or show all units.</p><div className="course-route-empty-actions">{query&&<button className="button light" onClick={onClearSearch}>Clear search</button>}{active!=='all'&&<button className="button light" onClick={()=>setUnit('all')}>Show all units</button>}</div></div>}
 </div>;
}
