'use client';
import {useId,useState} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2,Lightbulb,RotateCcw} from 'lucide-react';
import {Slider} from './lab-diagrams';
import {parseAnswer} from './curriculum';
import {SYSTEM_PRESETS,solveSystem,resultText,lineEquation,solvingSteps,graphScale,clippedLine,value,fractionText,type LinearSystem,type Method} from './systems-model';
import './systems-lab.css';

export function SystemGraph({system,showPoints=true}:{system:LinearSystem;showPoints?:boolean}){
 const id=useId(),solution=solveSystem(system),{extent,tick}=graphScale(system);
 const px=(x:number)=>280+x*230/extent,py=(y:number)=>280-y*230/extent;
 const ticks=Array.from({length:2*extent/tick+1},(_,i)=>-extent+i*tick);
 const pair=solution.kind==='one'?[value(solution.x),value(solution.y)]:null;
 const label=solution.kind==='one'?`S ${resultText(solution)}`:'';
 const labelWidth=Math.max(112,label.length*7.8+18);
 const labelX=pair?Math.max(55,Math.min(505-labelWidth,px(pair[0])+14)):0;
 const labelY=pair?Math.max(55,Math.min(470,py(pair[1])-44)):0;
 return <svg className="sys-graph" viewBox="0 0 560 560" role="img" aria-labelledby={`${id}-title ${id}-description`}>
  <title id={`${id}-title`}>Two linear equations on the same coordinate plane</title>
  <desc id={`${id}-description`}>{`Solid blue Line 1: ${lineEquation(system.m1,system.b1)}. Dashed orange Line 2: ${lineEquation(system.m2,system.b2)}. ${resultText(solution)}. Each grid interval is ${tick}.`}</desc>
  <defs><clipPath id={`${id}-clip`}><rect x="50" y="50" width="460" height="460"/></clipPath></defs>
  <rect className="sys-plot-bg" x="50" y="50" width="460" height="460" rx="2"/>
  {ticks.map(n=><g key={n}><path className="sys-grid-line" d={`M ${px(n)} 50 V 510 M 50 ${py(n)} H 510`}/>{n!==0&&<><text className="sys-tick" x={px(n)} y="301" textAnchor="middle">{n}</text><text className="sys-tick" x="268" y={py(n)+5} textAnchor="end">{n}</text></>}</g>)}
  <path className="sys-axis" d="M 42 280 H 520 M 280 520 V 40 M 512 275 L 520 280 L 512 285 M 275 48 L 280 40 L 285 48"/>
  <text x="526" y="285">x</text><text x="275" y="29">y</text><text className="sys-tick" x="268" y="301" textAnchor="end">0</text>
  <g clipPath={`url(#${id}-clip)`}>
   {[[system.m1,system.b1],[system.m2,system.b2]].map(([m,b],i)=>{
    const segment=clippedLine(m,b,extent),tag=segment.length===2?[segment[0][0]*.82+segment[1][0]*.18,segment[0][1]*.82+segment[1][1]*.18]:null;
    return <g key={i} className={`sys-line-${i+1}`}><path data-testid={`system-line-${i+1}`} className={`sys-function${i===1?' sys-dashed':''}`} d={segment.map(([x,y],j)=>`${j?'L':'M'} ${px(x)} ${py(y)}`).join(' ')}/>{tag&&<g transform={`translate(${px(tag[0])},${py(tag[1])+(i===0?-17:17)})`}><circle className="sys-line-badge" r="12"/><text className="sys-badge-text" y="5" textAnchor="middle">{i+1}</text></g>}{showPoints&&[0,1].map(x=>i===0?<circle className="sys-plot-point" key={x} cx={px(x)} cy={py(m*x+b)} r="5"/>:<rect className="sys-plot-point" key={x} x={px(x)-5} y={py(m*x+b)-5} width="10" height="10"/>)}</g>;
   })}
   {pair&&<g><path className="sys-guides" d={`M ${px(pair[0])} 280 V ${py(pair[1])} H 280`}/><circle className="sys-intersection" cx={px(pair[0])} cy={py(pair[1])} r="9"/></g>}
  </g>
  {pair&&<g><path className="sys-label-leader" d={`M ${px(pair[0])} ${py(pair[1])} L ${labelX+8} ${labelY+31}`}/><rect className="sys-label-bg" x={labelX} y={labelY} width={labelWidth} height="32" rx="7"/><text className="sys-coordinate" x={labelX+9} y={labelY+21}>{label}</text></g>}
  <text className="sys-scale-text" x="280" y="545" textAnchor="middle">Each grid interval = {tick} {tick===1?'unit':'units'} · same scale on both axes</text>
 </svg>;
}

export default function SystemsLab({initialSystem=SYSTEM_PRESETS[0].system}:{initialSystem?:LinearSystem}){
 const [system,setSystem]=useState<LinearSystem>({...initialSystem}),[method,setMethod]=useState<Method>('graphing'),[step,setStep]=useState(0),[showPoints,setShowPoints]=useState(true),[checkpointAnswer,setCheckpointAnswer]=useState<number|null>(null);
 const [prediction,setPrediction]=useState(''),[xInput,setXInput]=useState(''),[yInput,setYInput]=useState(''),[feedback,setFeedback]=useState('');
 const solution=solveSystem(system),steps=solvingSteps(system,method),inputId=useId();
 function changeSystem(next:LinearSystem){setSystem(next);setStep(0);setCheckpointAnswer(null);setPrediction('');setXInput('');setYInput('');setFeedback('');}
 function check(e:React.FormEvent){
  e.preventDefault();
  if(prediction!==solution.kind){setFeedback('Look again: do the lines cross once, stay parallel, or lie on top of each other?');return;}
  if(solution.kind==='one'){
   const x=parseAnswer(xInput),y=parseAnswer(yInput);
   if(x===null||y===null){setFeedback('Enter both coordinates. You can use a fraction such as 1/3.');return;}
   if(Math.abs(x-value(solution.x))>1e-6||Math.abs(y-value(solution.y))>1e-6){setFeedback('Check x first, then y. Substitute your ordered pair into BOTH equations. Use an exact fraction when needed.');return;}
  }
  setFeedback(solution.kind==='one'?'Correct! Your ordered pair satisfies both equations.':solution.kind==='none'?'Correct! Distinct parallel lines share no point.':'Correct! Every point on the common line satisfies both equations.');
 }
 return <section className="interactive-lab systems-lab" aria-label="Systems of linear equations: graphing, substitution, and elimination">
  <div className="lab-heading"><div><span className="eyebrow">TWO EQUATIONS · THREE METHODS</span><h2>One system, three ways to solve it</h2></div><button className="lab-reset" onClick={()=>{changeSystem({...SYSTEM_PRESETS[0].system});setMethod('graphing');setShowPoints(true);}}><RotateCcw size={16}/>Reset</button></div>
  <p>Change either equation. Compare the two lines, then follow the same system through graphing, substitution, or elimination.</p>
  <div className="sys-presets" role="group" aria-label="Example systems">{SYSTEM_PRESETS.map(p=><button key={p.id} aria-pressed={Object.keys(system).every(k=>system[k as keyof LinearSystem]===p.system[k as keyof LinearSystem])} onClick={()=>changeSystem({...p.system})}>{p.label}</button>)}</div>
  <div className="sys-explorer">
   <div className="sys-graph-panel"><div className="sys-legend"><span className="sys-line-1"><i/>1 · Solid blue</span><span className="sys-line-2"><i/>2 · Dashed orange</span></div><SystemGraph system={system} showPoints={showPoints}/><label className="sys-toggle"><input type="checkbox" checked={showPoints} onChange={e=>setShowPoints(e.target.checked)}/>Show the two plotting points for each line</label><p className="sys-graph-note">{solution.kind==='infinite'?'The dashed orange line overlaps the blue line exactly. They are the same line.':solution.kind==='none'?'These are two different parallel lines. Neither crosses the other.':'S marks the shared point. Dashed guides show its x- and y-coordinates.'}</p></div>
   <div className="sys-equations">{[1,2].map(n=>{
    const mKey=n===1?'m1':'m2',bKey=n===1?'b1':'b2',m=system[mKey],b=system[bKey];
    return <fieldset key={n} className={`sys-equation-card sys-line-${n}`}><legend>Equation {n} · {n===1?'solid blue':'dashed orange'}</legend><div className="sys-equation">{lineEquation(m,b)}</div><Slider label={`Line ${n}: slope m`} min={-3} max={3} value={m} onChange={v=>changeSystem({...system,[mKey]:v})}/><Slider label={`Line ${n}: y-intercept b`} min={-6} max={6} value={b} onChange={v=>changeSystem({...system,[bKey]:v})}/><table className="sys-point-table"><caption>Two points to plot Line {n}</caption><thead><tr><th scope="col">x</th><th scope="col">y</th><th scope="col">Point (x, y)</th></tr></thead><tbody>{[0,1].map(x=><tr key={x}><td>{x}</td><td>{m*x+b}</td><td>({x}, {m*x+b})</td></tr>)}</tbody></table></fieldset>;
   })}</div>
  </div>
  <div className="sys-result" aria-live="polite"><CheckCircle2 size={23}/><div><small>{solution.kind==='one'?'ONE SHARED POINT':solution.kind==='none'?'PARALLEL LINES':'COINCIDENT LINES'}</small><strong>{resultText(solution)}</strong><p>{solution.kind==='one'?'A solution is the complete ordered pair (x, y).':solution.kind==='none'?'Equal slopes and different intercepts: the lines never meet.':'Equal slopes and equal intercepts: every point on this line is a solution.'}</p></div></div>
  <div className="sys-methods" role="group" aria-label="Choose a solving method">{(['graphing','substitution','elimination'] as Method[]).map((name,i)=><button key={name} aria-pressed={method===name} onClick={()=>{setMethod(name);setStep(0);setCheckpointAnswer(null);}}><small>METHOD {i+1}</small><b>{name[0].toUpperCase()+name.slice(1)}</b></button>)}</div>
  <p className="sys-method-tip">{method==='graphing'?'Graphing shows where the two relationships meet. Use both equations on the same axes.':method==='substitution'?'Substitution replaces a variable with an equal expression. It is useful when a variable is already isolated.':'Elimination adds equations after making one pair of coefficients opposites. Multiply an entire equation when needed.'}</p>
  <ol className="sys-steps" aria-label={`${method} solution steps`}>{steps.slice(0,step+1).map((item,i)=><li key={`${method}-${i}`} className={i===step?'current':''}><span className="sys-step-number">{i+1}</span><div><h3>{item.title}</h3><p>{item.why}</p><div className="sys-step-math">{item.math.map((line,j)=><div key={j}>{line}</div>)}</div>{item.columns&&<div className="sys-column-work"><p><strong>One column at a time:</strong></p><div className="sys-column-grid">{item.columns.map(col=><section key={col.label} className={col.label==='y-terms'?'sys-cancel-column':''}><h4>{col.label}</h4><div className="sys-column-term">{col.first}</div><div className="sys-column-term">+ ({col.second})</div><div className="sys-column-total">= {col.result}</div><small>{col.why}</small></section>)}</div><p className="sys-column-conclusion">The y-terms became zero. Now there is just one variable left to solve.</p></div>}{item.checkpoint&&i===step&&<div className="sys-checkpoint"><h4>Pause: Check your understanding</h4><p>{item.checkpoint.question}</p><div className="sys-checkpoint-choices">{item.checkpoint.options.map((option,j)=><button key={j} type="button" aria-pressed={checkpointAnswer===j} onClick={()=>setCheckpointAnswer(j)}>{option}</button>)}</div>{checkpointAnswer!==null&&<p className={checkpointAnswer===item.checkpoint.correct?'sys-check-right':'sys-check-retry'} role="status">{checkpointAnswer===item.checkpoint.correct?'Correct! ':'Look again: '}{item.checkpoint.why}</p>}</div>}</div></li>)}</ol>
  <div className="sys-step-controls"><button className="button light small" disabled={step===0} onClick={()=>{setStep(step-1);setCheckpointAnswer(null);}}><ArrowLeft size={16}/>Previous</button><span aria-live="polite">Step {step+1} of {steps.length}</span><button className="button dark small" disabled={step===steps.length-1} onClick={()=>{setStep(step+1);setCheckpointAnswer(null);}}>Next step<ArrowRight size={16}/></button></div>
  {step<steps.length-1&&<button className="text-button sys-show-all" onClick={()=>{setStep(steps.length-1);setCheckpointAnswer(null);}}>Show all steps for this method</button>}
  <form className="sys-practice" onSubmit={check}><span className="eyebrow">YOUR TURN · CHECK BOTH EQUATIONS</span><h3>What is the solution to this system?</h3><label htmlFor={`${inputId}-kind`}>Number of solutions</label><select id={`${inputId}-kind`} value={prediction} onChange={e=>{setPrediction(e.target.value);setFeedback('');}}><option value="" disabled>Choose an answer</option><option value="one">One solution</option><option value="none">No solution</option><option value="infinite">Infinitely many solutions</option></select>{prediction==='one'&&<div className="sys-answer-pair"><label htmlFor={`${inputId}-x`}>x-coordinate<input id={`${inputId}-x`} value={xInput} onChange={e=>{setXInput(e.target.value);setFeedback('');}} placeholder="e.g. 2 or 1/3" autoComplete="off"/></label><label htmlFor={`${inputId}-y`}>y-coordinate<input id={`${inputId}-y`} value={yInput} onChange={e=>{setYInput(e.target.value);setFeedback('');}} placeholder="e.g. 3 or 2/3" autoComplete="off"/></label></div>}<button className="button dark" disabled={!prediction} type="submit">Check my solution</button><div aria-live="polite">{feedback&&<p className="sys-feedback"><Lightbulb size={18}/>{feedback}</p>}</div></form>
  <p className="lab-note">This exploration uses nonvertical lines in y = mx + b form. Its checks are for learning; complete “Try with me” and “On your own” to record your progress.</p>
 </section>;
}
