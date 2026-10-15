'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,Lightbulb,RotateCcw} from 'lucide-react';
import {Slider} from './lab-diagrams';
import {isCorrect,parseAnswer} from './curriculum';
import {FIGURES,TRANSFORMS,transformPoint,transformationRule,graphExtent,coordinate,type Point,type Transform} from './transformation-model';
import './transformations-lab.css';

export default function TransformationsLab(){
 const [figure,setFigure]=useState('triangle'),[vertices,setVertices]=useState<Point[]>(FIGURES[1].points.map(p=>[...p] as Point));
 const [mode,setMode]=useState<Transform>('reflect-x'),[dx,setDx]=useState(2),[dy,setDy]=useState(1),[scale,setScale]=useState(2);
 const [ox,setOx]=useState(0),[oy,setOy]=useState(0),[selected,setSelected]=useState(0),[shown,setShown]=useState<number|null>(null);
 const [guess,setGuess]=useState(''),[feedback,setFeedback]=useState('');
 const original=vertices.map(([x,y])=>[x+ox,y+oy] as Point),options={dx,dy,scale};
 const image=original.map(p=>transformPoint(p,mode,options)),count=shown??image.length;
 const extent=graphExtent([...original,...image]),tick=Math.max(1,Math.ceil(extent/7)),ticks=Array.from({length:Math.floor(extent/tick)*2+1},(_,i)=>(i-Math.floor(extent/tick))*tick);
 const px=(x:number)=>210+x*177/extent,py=(y:number)=>210-y*177/extent;
 const label=(i:number)=>original.length===1?'P':String.fromCharCode(65+i);
 const path=(pts:Point[],close:boolean)=>pts.map(([x,y],i)=>`${i?'L':'M'} ${px(x)} ${py(y)}`).join(' ')+(close?' Z':'');
 const clean=()=>{setGuess('');setFeedback('');};
 function choose(id:string){const base=FIGURES.find(f=>f.id===id);setFigure(id);setVertices((base?.points||FIGURES[1].points).map(p=>[...p] as Point));setSelected(0);setShown(null);setOx(0);setOy(0);clean();}
 function reset(){choose('triangle');setMode('reflect-x');setDx(2);setDy(1);setScale(2);}
 function editVertex(i:number,axis:number,value:string){const n=Number(value);if(!Number.isFinite(n))return;setVertices(v=>v.map((p,j)=>j===i?p.map((x,k)=>k===axis?Math.max(-6,Math.min(6,n)):x) as Point:p));setShown(null);clean();}
 function stepTo(n:number){const next=Math.max(1,Math.min(image.length,n));setShown(next);setSelected(next-1);clean();}
 function predict(e:React.FormEvent){e.preventDefault();if(parseAnswer(guess)===null){setFeedback('Enter a number, fraction, or decimal.');return;}setFeedback(isCorrect(guess,image[selected][0])?'Correct! You applied the same rule to this vertex.':'Try again. Apply the displayed coordinate rule to the original vertex.');}
 const focus=original[selected],target=image[selected];
 return <section className="interactive-lab transformations-lab" aria-label="Transform points and geometric figures">
 <div className="lab-heading"><div><span className="eyebrow">CHOOSE · TRANSFORM · COMPARE</span><h2>Transform a whole geometric figure</h2></div><button className="lab-reset" onClick={reset}><RotateCcw size={16}/>Reset</button></div>
 <p>Apply the same rule to every vertex. Compare the original solid blue figure with its dashed green image.</p>
 <label className="tf-select">Choose a figure<select value={figure} onChange={e=>choose(e.target.value)}>{FIGURES.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}<option value="custom">Custom polygon (3–8 vertices)</option></select></label>
 <div className="lab-layout tf-layout"><div><div className="tf-legend"><span className="tf-original-key">● Original · solid</span><span className="tf-image-key">○ Image · dashed</span></div><svg className="tf-graph" viewBox="0 0 420 420" role="img" aria-label={`${figure}: original and ${mode} image; ${count} of ${image.length} transformed vertices visible. Coordinates are listed below.`}>
 {ticks.map(n=><g key={n}><path className="lab-grid" d={`M ${px(n)} 24 V 396 M 24 ${py(n)} H 396`}/>{n!==0&&<><text x={px(n)} y="225" textAnchor="middle">{n}</text><text x="202" y={py(n)+4} textAnchor="end">{n}</text></>}</g>)}
 <path className="lab-axis" d="M 24 210 H 396 M 210 24 V 396"/><text x="399" y="201">x</text><text x="220" y="22">y</text><text x="201" y="225">0</text>
 {mode==='reflect-x'&&<path className="tf-mirror" d="M 24 210 H 396"/>}{mode==='reflect-y'&&<path className="tf-mirror" d="M 210 24 V 396"/>}
 {original.length>1&&<path className="tf-original" d={path(original,true)}/ >}
 {image.length>1&&count>1&&<path className="tf-image" d={path(image.slice(0,count),count===image.length)}/>}
 {selected<count&&<path className="tf-correspondence" d={`M ${px(focus[0])} ${py(focus[1])} L ${px(target[0])} ${py(target[1])}`}/>}
 {original.map(([x,y],i)=><g key={`o${i}`}><circle className="tf-original-dot" cx={px(x)} cy={py(y)} r={i===selected?6:4}/><text className="tf-original-label" x={px(x)-8} y={py(y)-9} textAnchor="end">{label(i)}</text></g>)}
 {image.slice(0,count).map(([x,y],i)=><g key={`t${i}`}><circle className="tf-image-dot" cx={px(x)} cy={py(y)} r={i===selected?7:5}/><text className="tf-image-label" x={px(x)+8} y={py(y)+17}>{label(i)}′</text></g>)}
 </svg><p className="lab-note">Equal scale on both axes. The grid resizes to keep the full figures visible. Decimal coordinates are displayed rounded to two places.</p></div>
 <div className="lab-controls"><div className="lab-step-buttons" aria-label="Transformation">{TRANSFORMS.map(t=><button key={t.id} aria-pressed={mode===t.id} className={mode===t.id?'selected':''} onClick={()=>{setMode(t.id);clean();}}>{t.label}</button>)}</div>
 <p className="tf-convention">Rotations are counterclockwise about (0, 0). Dilations are centered at (0, 0).</p>
 {mode==='translate'&&<><Slider label="Translation: horizontal shift" min={-5} max={5} value={dx} onChange={n=>{setDx(n);clean();}}/><Slider label="Translation: vertical shift" min={-5} max={5} value={dy} onChange={n=>{setDy(n);clean();}}/></>}
 {mode==='dilate'&&<Slider label="Dilation scale factor" min={.5} max={3} step={.5} value={scale} onChange={n=>{setScale(n);clean();}}/>}
 <Slider label="Original figure: horizontal position" min={-4} max={4} value={ox} onChange={n=>{setOx(n);clean();}}/><Slider label="Original figure: vertical position" min={-4} max={4} value={oy} onChange={n=>{setOy(n);clean();}}/>
 <div className="tf-rule"><small>THE RULE FOR EVERY VERTEX</small><strong>{transformationRule(mode,options)}</strong></div>
 <div className="tf-step-controls"><button className="button light" onClick={()=>stepTo(1)}>Start step by step</button><div><button aria-label="Previous transformed vertex" className="lab-reset" disabled={shown===null||count<=1} onClick={()=>stepTo(count-1)}><ArrowLeft size={16}/></button><span>{count} / {image.length} vertices</span><button aria-label="Next transformed vertex" className="lab-reset" disabled={shown===null||count===image.length} onClick={()=>stepTo(count+1)}><ArrowRight size={16}/></button></div><button className="text-button" onClick={()=>{setShown(null);clean();}}>Show whole image</button></div>
 </div></div>
 <div className="lab-explain"><Lightbulb size={20}/><p>{mode==='dilate'?`A dilation with factor ${scale} multiplies every coordinate by ${scale}. Lengths scale by ${scale}; areas scale by ${scale*scale}.`:'Reflections, rotations, and translations preserve side lengths and angles. Reflections reverse orientation; rotations and translations preserve it.'} Transform each vertex, then connect the image vertices in the same order.</p></div>
 {figure==='custom'&&<div className="tf-custom"><h3>Build your polygon</h3><p>Enter vertices in boundary order. Coordinates below are before the position sliders are applied.</p><div className="tf-editors">{vertices.map((p,i)=><div key={i}><b>{label(i)}</b>{p.map((n,axis)=><label key={axis}>{axis===0?'x':'y'}<input aria-label={`Vertex ${label(i)} ${axis===0?'x':'y'}`} type="number" min={-6} max={6} step="0.5" value={n} onChange={e=>editVertex(i,axis,e.target.value)}/></label>)}</div>)}</div><button className="button light" disabled={vertices.length>=8} onClick={()=>{setVertices(v=>[...v,[(v[v.length-1][0]+v[0][0])/2,(v[v.length-1][1]+v[0][1])/2]]);setShown(null);clean();}}>Add vertex</button><button className="button light" disabled={vertices.length<=3} onClick={()=>{setVertices(v=>v.slice(0,-1));setSelected(0);setShown(null);clean();}}>Remove last vertex</button></div>}
 <div className="tf-coordinate-wrap"><table className="lab-table tf-coordinates"><caption>Vertex by vertex — select a row to highlight the pair</caption><thead><tr><th>Vertex</th><th>Original (x, y)</th><th>Image (x′, y′)</th></tr></thead><tbody>{original.map((p,i)=><tr key={i} className={selected===i?'selected':''}><th><button aria-label={`Highlight vertex ${label(i)}`} aria-pressed={selected===i} onClick={()=>{setSelected(i);if(shown!==null)setShown(Math.max(shown,i+1));clean();}}>{label(i)} → {label(i)}′</button></th><td>({p.map(coordinate).join(', ')})</td><td>{i<count?`(${image[i].map(coordinate).join(', ')})`:'Reveal next vertex'}</td></tr>)}</tbody></table></div>
 <div className="tf-focus" aria-live="polite"><b>Follow {label(selected)}:</b> ({focus.map(coordinate).join(', ')}) → {selected<count?`(${target.map(coordinate).join(', ')})`:'image not revealed yet'}</div>
 <form className="lab-check tf-predict" onSubmit={predict}><span className="eyebrow">PAUSE & PREDICT</span><label htmlFor="tf-prediction">What is the x′-coordinate of {label(selected)}′? Use the rule above.</label><div className="answer-row"><input id="tf-prediction" className="answer-input" value={guess} onChange={e=>setGuess(e.target.value)} placeholder="Your prediction"/><button className="button dark" type="submit" disabled={!guess.trim()}>Check prediction</button></div><p className="lab-note">Use at least six decimal places when needed. This exploration does not change your saved practice score.</p>{feedback&&<p role="status">{feedback}</p>}</form>
 </section>;
}
