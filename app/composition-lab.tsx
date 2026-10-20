'use client';
import {useState,useId} from 'react';
import {coordinateDraft,readFigureCoordinates,type CoordinateDraft} from './figure-coordinates';
import {FIGURES,coordinate,placeVertexLabels,type Point} from './transformation-model';
import {composePoints,COMPOSITION_EXAMPLES,type MirrorAxis} from './advanced-math-model';
import {parseAnswer,isCorrect} from './curriculum';
import './advanced-math-labs.css';

export default function CompositionLab(){
 const [points,setPoints]=useState<Point[]>([[1,1]]),[draft,setDraft]=useState<CoordinateDraft>([['1','1']]);
 const [axis,setAxis]=useState<MirrorAxis>('horizontal'),[line,setLine]=useState(2),[dx,setDx]=useState(-2),[dy,setDy]=useState(0);
 const [reverse,setReverse]=useState(false),[stage,setStage]=useState(2),[selected,setSelected]=useState(0);
 const [error,setError]=useState(''),[guess,setGuess]=useState(''),[feedback,setFeedback]=useState('');
 const id=useId(),clear=()=>{setGuess('');setFeedback('');};
 const {middle,final}=composePoints(points,axis,line,dx,dy,reverse);
 const all=[...points,...middle,...final],extent=Math.max(5,Math.ceil(Math.max(...all.flat().map(Math.abs),Math.abs(line)))+2);
 const px=(x:number)=>280+208*x/extent,py=(y:number)=>280-208*y/extent;
 const tick=Math.max(1,Math.ceil(extent/6)),ticks=Array.from({length:2*Math.floor(extent/tick)+1},(_,i)=>(i-Math.floor(extent/tick))*tick);
 const label=(i:number)=>points.length===1?'P':String.fromCharCode(65+i),pair=(p:Point)=>'('+p.map(coordinate).join(', ')+')';
 const path=(p:Point[])=>p.map(([x,y],i)=>(i?'L':'M')+px(x)+' '+py(y)).join(' ')+(p.length>1?' Z':'');
 const groups=[points,...(stage>=1?[middle]:[]),...(stage>=2?[final]:[])];
 const labels=placeVertexLabels(groups.flatMap((g,s)=>g.map((p,i)=>({text:label(i)+'′'.repeat(s)+' '+pair(p),x:px(p[0]),y:py(p[1]),image:s>0}))));
 const reflection='Reflect in '+(axis==='horizontal'?'y':'x')+' = '+line;
 const shift='Translate ⟨'+dx+', '+dy+'⟩';
 const names=reverse?[shift,reflection]:[reflection,shift];
 function example(index:number){const e=COMPOSITION_EXAMPLES[index];setAxis(e.axis);setLine(e.line);setDx(e.dx);setDy(e.dy);setReverse(false);setStage(2);setPoints([[1,1]]);setDraft([['1','1']]);setSelected(0);setError('');clear();}
 function chooseFigure(index:number){const p=FIGURES[index].points;setPoints(p);setDraft(coordinateDraft(p));setSelected(0);setError('');clear();}
 function draw(){const result=readFigureCoordinates(draft);if(!result.ok){setError(result.message+' '+Object.values(result.errors).join(' '));return;}setPoints(result.points);setSelected(0);setError('');clear();}
 return <section className="am-lab" aria-labelledby={id+'title'}>
 <div className="am-heading"><div><span className="eyebrow">GEOMETRY · TWO TRANSFORMATIONS</span><h2 id={id+'title'}>Follow the point. See the order.</h2></div><button className="button light small" onClick={()=>example(0)}>Reset</button></div>
 <p>In <b>T ∘ r</b>, apply the operation on the right first: reflect, then translate the reflected image. Every vertex follows the same two rules.</p>
 <div className="am-preset-row">{COMPOSITION_EXAMPLES.map((e,i)=><button key={e.title} className="button light small" onClick={()=>example(i)}>{e.title}</button>)}</div>
 <p className="am-note">Worksheet setup: P(1, 1), m: y = 2, n: x = −1. The three buttons reproduce its transformation sequences.</p>
 <div className="am-two-columns"><div>
 <div className="am-legend"><span className="am-original">● Original</span><span className="am-middle">◆ After operation 1</span><span className="am-final">■ Final image</span></div>
 <svg className="am-coordinate-graph" viewBox="0 0 560 560" role="img" aria-label={'Coordinate graph. '+names.join(', then ')+'. Original '+pair(points[selected])+', intermediate '+pair(middle[selected])+', final '+pair(final[selected])+'.'}>
 <title>Original, intermediate, and final coordinates on equal-scale axes</title>
 {ticks.map(n=><g key={n}><path className="am-grid" d={'M '+px(n)+' 55 V 505 M 55 '+py(n)+' H 505'}/>{n!==0&&<><text x={px(n)} y={296} textAnchor="middle">{n}</text><text x={271} y={py(n)+4} textAnchor="end">{n}</text></>}</g>)}
 <path className="am-axis" d="M 55 280 H 505 M 280 55 V 505"/><text x={514} y={274}>x</text><text x={290} y={48}>y</text>
 <path className="am-mirror" d={axis==='horizontal'?'M 55 '+py(line)+' H 505':'M '+px(line)+' 55 V 505'}/>
 <text x={axis==='horizontal'?60:px(line)+7} y={axis==='horizontal'?py(line)-9:68}>{axis==='horizontal'?'y':'x'} = {line}</text>
 {groups.map((g,s)=><g key={s} className={'am-stage-'+s}>
 {g.length>1&&<path d={path(g)} className="am-shape"/>}
 {g.map((p,i)=><g key={i}>{s===0?<circle cx={px(p[0])} cy={py(p[1])} r={i===selected?6:4}/>:s===1?<path d={'M '+px(p[0])+' '+(py(p[1])-6)+' l 6 6 l -6 6 l -6 -6 Z'}/>:<rect x={px(p[0])-5} y={py(p[1])-5} width="10" height="10"/>}</g>)}
 </g>)}
 {stage>=1&&<path className="am-trace am-middle" d={'M '+px(points[selected][0])+' '+py(points[selected][1])+' L '+px(middle[selected][0])+' '+py(middle[selected][1])}/>}
 {stage>=2&&<path className="am-trace am-final" d={'M '+px(middle[selected][0])+' '+py(middle[selected][1])+' L '+px(final[selected][0])+' '+py(final[selected][1])}/>}
 {labels.map((l,i)=><g key={i} className={'am-callout am-stage-'+Math.floor(i/points.length)}><path d={'M '+l.anchorX+' '+l.anchorY+' L '+(l.x+l.width/2)+' '+(l.y+l.height/2)}/><rect x={l.x} y={l.y} width={l.width} height={l.height} rx="5"/><text x={l.x+l.width/2} y={l.y+16} textAnchor="middle">{l.text}</text></g>)}
 </svg>
 <div className="am-preset-row">{['Original','Operation 1','Both operations'].map((s,i)=><button key={s} className="button light small" aria-pressed={stage===i} onClick={()=>setStage(i)}>{s}</button>)}</div>
 <div className="am-sequence" aria-live="polite"><div className="am-original"><b>{label(selected)} {pair(points[selected])}</b><span>Start</span></div><div className="am-middle"><b>{stage>=1?pair(middle[selected]):'?'}</b><span>1. {names[0]}</span></div><div className="am-final"><b>{stage>=2?pair(final[selected]):'?'}</b><span>2. {names[1]}</span></div></div>
 </div><div className="am-controls">
 <h3>Build your sequence</h3>
 <label>Reflect across<select value={axis} onChange={e=>{setAxis(e.target.value as MirrorAxis);clear();}}><option value="horizontal">Horizontal line y = k</option><option value="vertical">Vertical line x = h</option></select></label>
 <label>{axis==='horizontal'?'k':'h'} = {line}<input type="range" min="-10" max="10" step="0.5" value={line} onChange={e=>{setLine(Number(e.target.value));clear();}}/></label>
 <div className="am-rule">{axis==='horizontal'?'(x, y) → (x, 2k − y)':'(x, y) → (2h − x, y)'}</div>
 <label>Horizontal translation: {dx}<input type="range" min="-10" max="10" value={dx} onChange={e=>{setDx(Number(e.target.value));clear();}}/></label>
 <label>Vertical translation: {dy}<input type="range" min="-10" max="10" value={dy} onChange={e=>{setDy(Number(e.target.value));clear();}}/></label>
 <div className="am-rule">(x, y) → (x + ({dx}), y + ({dy}))</div>
 <button className="button light" aria-pressed={reverse} onClick={()=>{setReverse(!reverse);clear();}}>Reverse the order</button>
 <p><b>Current order:</b> {names.join(' → ')}.</p>
 <p className="am-note">Reflecting in y = 2 changes y to 4 − y. It does not simply change the sign of y. Some sequences commute; try a translation perpendicular to the mirror to see the difference.</p>
 </div></div>
 <details className="am-details"><summary>Try your own point or polygon</summary>
 <div className="am-preset-row">{FIGURES.map((f,i)=><button className="button light small" key={f.id} onClick={()=>chooseFigure(i)}>{f.label}</button>)}</div>
 <p>Enter vertices in boundary order. Use fractions or decimals from −50 to 50.</p>
 <div className="am-vertex-editor">{draft.map((row,i)=><fieldset key={i}><legend>{draft.length===1?'P':String.fromCharCode(65+i)}</legend>{row.map((v,a)=><label key={a}>{a===0?'x':'y'}<input value={v} onChange={e=>setDraft(draft.map((r,j)=>j===i?r.map((t,k)=>a===k?e.target.value:t) as [string,string]:r))}/></label>)}</fieldset>)}</div>
 <button className="button light" onClick={draw}>Draw my figure</button><p role="status">{error}</p></details>
 <div className="am-table-wrap"><table><caption>Every vertex follows both transformations</caption><thead><tr><th>Vertex</th><th className="am-original">Original</th><th className="am-middle">After 1</th><th className="am-final">After 2</th></tr></thead><tbody>{points.map((p,i)=><tr key={i}><th><button className="button light small" aria-pressed={selected===i} onClick={()=>{setSelected(i);clear();}}>{label(i)}</button></th><td>{pair(p)}</td><td>{stage>=1?pair(middle[i]):'—'}</td><td>{stage>=2?pair(final[i]):'—'}</td></tr>)}</tbody></table></div>
 <form className="am-predict" onSubmit={e=>{e.preventDefault();setFeedback(parseAnswer(guess)===null?'Enter a number, decimal, or fraction.':isCorrect(guess,final[selected][0])?'Correct. You used the intermediate image as the second input.':'Try again: first '+names[0].toLowerCase()+', then '+names[1].toLowerCase()+'.');}}>
 <label htmlFor={id+'guess'}>Predict the final x-coordinate of {label(selected)}. Hide the final image to challenge yourself.</label>
 <div className="am-preset-row"><input id={id+'guess'} value={guess} onChange={e=>setGuess(e.target.value)} placeholder="Your prediction"/><button className="button light">Check prediction</button></div><p role="status">{feedback}</p></form>
 <p className="am-note">Exploration does not change your saved practice score. Continue with guided and independent practice below.</p>
 </section>;
}
