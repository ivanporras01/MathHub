'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowRight,BookOpen,CalendarDays,Check,ClipboardList,RefreshCw,Users} from 'lucide-react';
import {api,ProgressBar,type Student} from './ui';
import {topicById,courseName} from './curriculum';
import {dueLabel,taskSummary,taskTopicDone,type StudentCoursework} from './coursework';

export default function MyAssignments({student,onJoin,onOpen,busy}:{student:Student|null;onJoin:()=>void;onOpen:(assignmentId:string,topicId:string)=>Promise<void>;busy:boolean}){
 const [data,setData]=useState<StudentCoursework>({classes:[],assignments:[]}),[loading,setLoading]=useState(!!student),[error,setError]=useState(''),[classCode,setClassCode]=useState(''),[joining,setJoining]=useState(false),[message,setMessage]=useState(''),[classId,setClassId]=useState('all'),[filter,setFilter]=useState('all');
 const version=useRef(0);
 const refresh=useCallback(async()=>{if(!student)return;const current=++version.current;try{const next=await api('assignments');if(current===version.current){setData(next);setError('');}}catch(e){if(current===version.current)setError((e as Error).message);}finally{if(current===version.current)setLoading(false);}},[student?.id]);
 useEffect(()=>{void refresh();const timer=setInterval(()=>{if(document.visibilityState==='visible')void refresh();},15000);return()=>{++version.current;clearInterval(timer);};},[refresh]);
 useEffect(()=>{setClassCode(new URLSearchParams(window.location.search).get('class')||'');},[]);
 async function joinClass(e:React.FormEvent){e.preventDefault();setJoining(true);setError('');setMessage('');try{const result=await api('class-join',{classCode});setMessage(`You joined ${result.className}.`);setClassCode('');await refresh();}catch(e){setError((e as Error).message);}finally{setJoining(false);}}
 const visible=data.assignments.filter(a=>(classId==='all'||a.classId===classId)&&(filter==='all'||(filter==='completed'?taskSummary(a,a).complete:!a.archived&&!taskSummary(a,a).complete)));
 return <section className="assignments-page">
  <div className="welcome-line"><div><span className="eyebrow">ONE CLEAR NEXT STEP</span><h1>My assignments</h1><p>Your classes, your tasks, and the progress you’re making.</p></div>{student&&<button className="button light small" onClick={refresh}><RefreshCw size={16}/>Refresh</button>}</div>
  {!student?<div className="empty-state large-empty"><ClipboardList size={38}/><h2>Your assignments start here.</h2><p>Enter your learning profile to see the work Mr. Porras has assigned to your classes.</p><button className="button dark" onClick={onJoin}>New or returning student<ArrowRight size={17}/></button></div>:<>
   <div className="student-classes"><div><Users size={22}/><div><b>My classes</b><p>{data.classes.length?data.classes.map(c=>c.name).join(' · '):'Not in a class yet. Mr. Porras can add you, or share a class code.'}</p></div></div><details><summary>Join a class with a code</summary><form onSubmit={joinClass}><label>Class code<input name="classCode" value={classCode} maxLength={16} autoComplete="off" placeholder="MH…" onChange={e=>setClassCode(e.target.value)}/></label><button className="button dark small" disabled={!classCode.trim()||joining}>{joining?'Joining…':'Join class'}</button></form></details></div>
   {error&&<div className="error-banner" role="alert">{error}</div>}{message&&<p className="save-message" role="status">{message}</p>}
   <div className="assignment-filters"><label>Class<select value={classId} onChange={e=>setClassId(e.target.value)}><option value="all">All my classes</option>{data.classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><div className="filter-chips">{[['all','All tasks'],['open','To do'],['completed','Completed']].map(([value,label])=><button key={value} aria-pressed={filter===value} className={filter===value?'selected':''} onClick={()=>setFilter(value)}>{label}</button>)}</div></div>
   {loading?<div className="empty-state"><RefreshCw className="spin" size={25}/><p>Loading your assignments…</p></div>:!visible.length?<div className="empty-state assignment-empty"><ClipboardList size={32}/><h2>{data.assignments.length?'No assignments match this view.':'You’re ready for your next assignment.'}</h2><p>{data.assignments.length?'Choose another filter to see your work.':'When Mr. Porras publishes work for your class, it will appear here. You can keep practicing in Explore topics.'}</p></div>:<div className="assignment-list">{visible.map(a=>{const summary=taskSummary(a,a);return <article className="assignment-card" key={a.id}>
    <div className="assignment-card-heading"><div><span className="eyebrow">{a.className}</span><h2>{a.title}</h2></div><span className={`assignment-status ${summary.complete?'done':summary.status==='Overdue'?'overdue':''}`}>{a.archived?'Closed':summary.status}</span></div>
    <div className="assignment-meta"><span><CalendarDays size={15}/>{dueLabel(a.dueAt)}</span><span>{a.goal} independent answers per topic</span></div>
    {a.instructions&&<p className="assignment-instructions">{a.instructions}</p>}
    <div className="assignment-progress-line"><ProgressBar value={summary.percent} label={`${a.title} completion`}/><b>{summary.percent}%</b><span>{summary.done}/{a.topicIds.length} topics complete</span></div>
    <div className="assigned-topics">{a.topicIds.map(id=>{const t=topicById(id);if(!t)return null;const p=a.progress[id],done=taskTopicDone(p,a.goal);return <button key={id} className={done?'assigned-topic complete':'assigned-topic'} disabled={busy||a.archived} onClick={()=>onOpen(a.id,id)}><span className="assigned-topic-icon">{done?<Check size={20}/>:<BookOpen size={20}/>}</span><span><b>{t.title}</b><small>{courseName(t.grade)} · Learn {p?.learned?'✓':'—'} · Guided {p?.guided?'✓':'—'} · {Math.min(a.goal,p?.independent||0)}/{a.goal} independent</small></span><ArrowRight size={18}/></button>;})}</div>
    <p className="assignment-save-note">Work saves automatically. Complete Learn, Try with me, and the independent goal for every topic. {a.archived?'This assignment is closed. Your saved results are shown above.':summary.status==='Overdue'?'You can still finish; late completion is shown to your teacher.':'Open a topic here so your work counts for this assignment.'}</p>
   </article>;})}</div>}
  </>}
 </section>;
}
