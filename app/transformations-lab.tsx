'use client';
import {useState,useId} from 'react';
import {ArrowLeft,ArrowRight,Lightbulb,RotateCcw} from 'lucide-react';
import {Slider} from './lab-diagrams';
import {isCorrect,parseAnswer} from './curriculum';
import {FIGURES,TRANSFORMS,transformPoint,transformationRule,graphExtent,coordinate,rotationTrace,placeVertexLabels,type Point,type Transform,type RotationDirection} from './transformation-model';
import './transformations-lab.css';

export default function TransformationsLab(){
 const [figure,setFigure]=useState('triangle'),[vertices,setVertices]=useState<Point[]>(FIGURES[1].points.map(p=>[...p] as Point));
 const [direction,setDirection]=useState<RotationDirection>('ccw');
 const arcId=useId();
 const [mode,setMode]=useState<Transform>('rotate-90'),[dx,setDx]=useState(2),[dy,setDy]=useState(1),[scale,setScale]=useState(2);
 const [ox,setOx]=useState(0),[oy,setOy]=useState(0),[selected,setSelected]=useState(0),[shown,setShown]=useState<number|null>(null);
 const [guess,setGuess]=useState(''),[feedback,setFeedback]=useState('');
 const original=vertices.map(([x,y])=>[x+ox,y+oy] as Point),options={dx,dy,scale,direction};
 const image=original.map(p=>transformPoint(p,mode,options)),count=shown??image.length;
 const rotating=mode.startsWith('rotate-'),degrees=rotating?Number(mode.split('-')[1]):0;
 const extent=graphExtent([...original,...image,...(rotating?original.map(([x,y])=>[Math.hypot(x,y),0] as Point):[])]),tick=Math.max(1,Math.ceil(extent/7)),ticks=Array.from({length:Math.floor(extent/tick)*2+1},(_,i)=>(i-Math.floor(extent/tick))*tick);
 const px=(x:number)=>280+x*206/extent,py=(y:number)=>280-y*206/extent;
 const label=(i:number)=>original.length===1?'P':String.fromCharCode(65+i);
 const path=(pts:Point[],close:boolean)=>pts.map(([x,y],i)=>`${i?'L':'M'} ${px(x)} ${py(y)}`).join(' ')+(close?' Z':'');
 const clean=()=>{setGuess('');setFeedback('');};
 function choose(id:string){const base=FIGURES.find(f=>f.id===id);setFigure(id);setVertices((base?.points||FIGURES[1].points).map(p=>[...p] as Point));setSelected(0);setShown(null);setOx(0);setOy(0);clean();}
 function reset(){choose('triangle');setMode('rotate-90');setDirection('ccw');setDx(2);setDy(1);setScale(2);}
 function editVertex(i:number,axis:number,value:string){const n=Number(value);if(!Number.isFinite(n))return;setVertices(v=>v.map((p,j)=>j===i?p.map((x,k)=>k===axis?Math.max(-6,Math.min(6,n)):x) as Point:p));setShown(null);clean();}
 function stepTo(n:number){const next=Math.max(1,Math.min(image.length,n));setShown(next);setSelected(next-1);clean();}
 function predict(e:React.FormEvent){e.preventDefault();if(parseAnswer(guess)===null){setFeedback('Enter a number, fraction, or decimal.');return;}setFeedback(isCorrect(guess,image[selected][0])?'Correct! You applied the same rule to this vertex.':'Try again. Apply the displayed coordinate rule to the original vertex.');}
 const focus=original[selected],target=image[selected];
 const callouts=placeVertexLabels([...original.map(([x,y],i)=>({text:`${label(i)} (${coordinate(x)}, ${coordinate(y)})`,x:px(x),y:py(y),image:false})),...image.map(([x,y],i)=>({text:`${label(i)}′ (${coordinate(x)}, ${coordinate(y)})`,x:px(x),y:py(y),image:true}))]);
 const trace=rotating?rotationTrace(focus,degrees,direction):[];
 const rotationDescription=`${degrees}° ${direction==='cw'?'clockwise (CW)':'counterclockwise (CCW)'} about O (0, 0)`;
 return <section className="interactive-lab transformations-lab" aria-label="Transform points and geometric figures">
 <div className="lab-heading"><div><span className="eyebrow">CHOOSE · TRANSFORM · COMPARE</span><h2>Transform a whole geometric figure</h2></div><button className="lab-reset" onClick={reset}><RotateCcw size={16}/>Reset</button></div>
 <p>Apply the same rule to every vertex. Compare the original solid blue figure with its dashed green image.</p>
 <label className="tf-select">Choose a figure<select value={figure} onChange={e=>choose(e.target.value)}>{FIGURES.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}<option value="custom">Custom polygon (3–8 vertices)</option></select></label>
 <div className="lab-layout tf-layout"><div><div className="tf-legend"><span className="tf-original-key">● Original · solid</span><span className="tf-image-key">○ Image · dashed</span></div><svg className="tf-graph" viewBox="0 0 560 560" role="img" aria-label={`${figure}: full original and full transformed figure${rotating?`; rotation ${rotationDescription}`:''}. Every vertex is labeled with its coordinates.`}>
 <defs><marker id={arcId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" className="tf-arc-tip"/></marker></defs>
 {ticks.map(n=><g key={n}><path className="lab-grid" d={`M ${px(n)} 55 V 505 M 55 ${py(n)} H 505`}/>{n!==0&&<><text x={px(n)} y="295" textAnchor="middle">{n}</text><text x="271" y={py(n)+4} textAnchor="end">{n}</text></>}</g>)}
 <path className="lab-axis" d="M 55 280 H 505 M 280 55 V 505"/><text x="512" y="271">x</text><text x="289" y="49">y</text><circle cx="280" cy="280" r="3" className="tf-center"/><text x="288" y="310">O (0, 0)</text>
 {mode==='reflect-x'&&<path className="tf-mirror" d="M 55 280 H 505"/>}{mode==='reflect-y'&&<path className="tf-mirror" d="M 280 55 V 505"/>}
 {original.length>1&&<path className="tf-original" d={path(original,true)} data-testid="original-outline"/>}
 {image.length>1&&<path className="tf-image" d={path(image,true)} data-testid="image-outline"/>}
 {rotating&&Math.hypot(...focus)>.00001?<path className="tf-rotation-arc" d={path(trace,false)} markerEnd={`url(#${arcId})`}/>:<path className="tf-correspondence" d={`M ${px(focus[0])} ${py(focus[1])} L ${px(target[0])} ${py(target[1])}`}/>}
 {original.map(([x,y],i)=><g key={`o${i}`}><circle className="tf-original-dot" cx={px(x)} cy={py(y)} r={i===selected?7:4}/>{i===selected&&<circle className="tf-active-ring" cx={px(x)} cy={py(y)} r="11"/>}</g>)}
 {image.map(([x,y],i)=><g key={`t${i}`}><circle className="tf-image-dot" cx={px(x)} cy={py(y)} r={i===selected?8:5}/>{i===selected&&<circle className="tf-active-ring" cx={px(x)} cy={py(y)} r="13"/>}</g>)}
 {callouts.map((p,i)=><g key={`label-${i}`} className={p.image?'tf-image-callout':'tf-original-callout'}><path className="tf-label-leader" d={`M ${p.anchorX} ${p.anchorY} L ${Math.max(p.x,Math.min(p.x+p.width,p.anchorX))} ${p.y+p.height/2}`}/><rect x={p.x} y={p.y} width={p.width} height={p.height} rx="5"/><text className="tf-coordinate-label" x={p.x+6} y={p.y+16}>{p.text}</text></g>)}
 </svg><p className="lab-note">Equal scale on both axes. The grid resizes to keep the full figures visible. Each label shows its vertex and coordinates. Overlapping figures may occur because of symmetry. Decimal coordinates are displayed rounded to two places.</p></div>
 <div className="lab-controls"><div className="lab-step-buttons" aria-label="Transformation">{TRANSFORMS.map(t=><button key={t.id} aria-pressed={mode===t.id} className={mode===t.id?'selected':''} onClick={()=>{setMode(t.id);clean();}}>{t.label}</button>)}</div>
 {rotating&&<div className="tf-direction" role="group" aria-label="Rotation direction"><span>Rotation direction</span><div className="lab-step-buttons">{([{id:'ccw',label:'↺ Counterclockwise (CCW)'},{id:'cw',label:'↻ Clockwise (CW)'}] as const).map(d=><button key={d.id} aria-pressed={direction===d.id} className={direction===d.id?'selected':''} onClick={()=>{setDirection(d.id);clean();}}>{d.label}</button>)}</div></div>}
 <p className="tf-convention">{rotating?rotationDescription:'Rotations and dilations use the origin O (0, 0) as their center.'}</p>
 {mode==='translate'&&<><Slider label="Translation: horizontal shift" min={-5} max={5} value={dx} onChange={n=>{setDx(n);clean();}}/><Slider label="Translation: vertical shift" min={-5} max={5} value={dy} onChange={n=>{setDy(n);clean();}}/></>}
 {mode==='dilate'&&<Slider label="Dilation scale factor" min={.5} max={3} step={.5} value={scale} onChange={n=>{setScale(n);clean();}}/>}
 <Slider label="Original figure: horizontal position" min={-4} max={4} value={ox} onChange={n=>{setOx(n);clean();}}/><Slider label="Original figure: vertical position" min={-4} max={4} value={oy} onChange={n=>{setOy(n);clean();}}/>
 <div className="tf-rule"><small>THE RULE FOR EVERY VERTEX</small><strong>{transformationRule(mode,options)}</strong></div>
 <div className="tf-step-controls"><button className="button light" onClick={()=>stepTo(1)}>Start step by step</button><div><button aria-label="Previous transformed vertex" className="lab-reset" disabled={shown===null||count<=1} onClick={()=>stepTo(count-1)}><ArrowLeft size={16}/></button><span>Focus: {label(selected)} → {label(selected)}′</span><button aria-label="Next transformed vertex" className="lab-reset" disabled={shown===null||count===image.length} onClick={()=>stepTo(count+1)}><ArrowRight size={16}/></button></div><button className="text-button" onClick={()=>{setShown(null);clean();}}>Show all vertex pairs</button><p className="lab-note">Both complete figures stay visible. Step controls highlight one corresponding vertex pair at a time.</p></div>
 </div></div>
 <div className="lab-explain"><Lightbulb size={20}/><p>{mode==='dilate'?`A dilation with factor ${scale} multiplies every coordinate by ${scale}. Lengths scale by ${scale}; areas scale by ${scale*scale}.`:'Reflections, rotations, and translations preserve side lengths and angles. Reflections reverse orientation; rotations and translations preserve it.'} Transform each vertex, then connect the image vertices in the same order.</p></div>
 {figure==='custom'&&<div className="tf-custom"><h3>Build your polygon</h3><p>Enter vertices in boundary order. Coordinates below are before the position sliders are applied.</p><div className="tf-editors">{vertices.map((p,i)=><div key={i}><b>{label(i)}</b>{p.map((n,axis)=><label key={axis}>{axis===0?'x':'y'}<input aria-label={`Vertex ${label(i)} ${axis===0?'x':'y'}`} type="number" min={-6} max={6} step="0.5" value={n} onChange={e=>editVertex(i,axis,e.target.value)}/></label>)}</div>)}</div><button className="button light" disabled={vertices.length>=8} onClick={()=>{setVertices(v=>[...v,[(v[v.length-1][0]+v[0][0])/2,(v[v.length-1][1]+v[0][1])/2]]);setShown(null);clean();}}>Add vertex</button><button className="button light" disabled={vertices.length<=3} onClick={()=>{setVertices(v=>v.slice(0,-1));setSelected(0);setShown(null);clean();}}>Remove last vertex</button></div>}
 <div className="tf-coordinate-wrap"><table className="lab-table tf-coordinates"><caption>Vertex by vertex — select a row to highlight the pair</caption><thead><tr><th>Vertex</th><th>Original (x, y)</th><th>Image (x′, y′)</th></tr></thead><tbody>{original.map((p,i)=><tr key={i} className={selected===i?'selected':''}><th><button aria-label={`Highlight vertex ${label(i)}`} aria-pressed={selected===i} onClick={()=>{setSelected(i);if(shown!==null)setShown(Math.max(shown,i+1));clean();}}>{label(i)} → {label(i)}′</button></th><td>({p.map(coordinate).join(', ')})</td><td>{`(${image[i].map(coordinate).join(', ')})`}</td></tr>)}</tbody></table></div>
 <div className="tf-focus" aria-live="polite"><b>Follow {label(selected)}{rotating?` — ${rotationDescription}`:''}:</b> ({focus.map(coordinate).join(', ')}) → {`(${target.map(coordinate).join(', ')})`}</div>
 {rotating&&<div className="tf-coordinate-change" aria-live="polite"><span>Start: x = {coordinate(focus[0])}, y = {coordinate(focus[1])}</span><span>Apply: {transformationRule(mode,options)}</span><span>Result: <strong>x′ = {coordinate(target[0])}, y′ = {coordinate(target[1])}</strong></span>{original.length>1&&<p className="tf-side-check">Compare one side: {label(0)}{label(1)} = <b>{coordinate(Math.hypot(original[1][0]-original[0][0],original[1][1]-original[0][1]))}</b> units; {label(0)}′{label(1)}′ = <b>{coordinate(Math.hypot(image[1][0]-image[0][0],image[1][1]-image[0][1]))}</b> units. Rotation changes position while preserving shape and size.</p>}{Math.hypot(...focus)<.00001&&<p>The selected vertex is at the center of rotation, so its coordinates stay (0, 0).</p>}</div>}
 <form className="lab-check tf-predict" onSubmit={predict}><span className="eyebrow">PAUSE & PREDICT</span><label htmlFor="tf-prediction">What is the x′-coordinate of {label(selected)}′? Use the rule above.</label><div className="answer-row"><input id="tf-prediction" className="answer-input" value={guess} onChange={e=>setGuess(e.target.value)} placeholder="Your prediction"/><button className="button dark" type="submit" disabled={!guess.trim()}>Check prediction</button></div><p className="lab-note">Use at least six decimal places when needed. This exploration does not change your saved practice score.</p>{feedback&&<p role="status">{feedback}</p>}</form>
 </section>;
}
