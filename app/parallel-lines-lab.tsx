'use client';
import {useId,useState} from 'react';
import {RotateCcw,ChevronRight,Lightbulb} from 'lucide-react';
import {Slider} from './lab-diagrams';
import {ANGLE_PAIRS,angleMeasures,parallelIntersections,type PairKind} from './parallel-model';
import './parallel-lines-lab.css';
const radians=(degrees:number)=>degrees*Math.PI/180;
const point=(x:number,y:number,r:number,a:number)=>[x+r*Math.cos(radians(a)),y-r*Math.sin(radians(a))];
function sector(x:number,y:number,start:number,end:number){const p=point(x,y,29,start),q=point(x,y,29,end);return `M ${x} ${y} L ${p.join(' ')} A 29 29 0 0 0 ${q.join(' ')} Z`;}
export default function ParallelLinesLab(){
 const [theta,setTheta]=useState(62),[tilt,setTilt]=useState(0),[locked,setLocked]=useState(true),[kind,setKind]=useState<PairKind>('corresponding'),[pairIndex,setPairIndex]=useState(0),[showMeasures,setShowMeasures]=useState(true);
 const uid=useId(),actualTilt=locked?0:tilt,parallel=actualTilt===0,angles=angleMeasures(theta,actualTilt),info=ANGLE_PAIRS[kind],pair=info.pairs[pairIndex%info.pairs.length],centers=parallelIntersections(theta,actualTilt);
 const relation=info.sum?`${angles[pair[0]]}° + ${angles[pair[1]]}° = ${angles[pair[0]]+angles[pair[1]]}°`:`${angles[pair[0]]}° ${angles[pair[0]]===angles[pair[1]]?'=':'≠'} ${angles[pair[1]]}°`;
 return <section className="parallel-lab interactive-lab" aria-label="Eight-angle parallel-line explorer">
  <div className="lab-heading"><div><span className="eyebrow">EIGHT ANGLES · SIX RELATIONSHIPS</span><h2>Find the pair. Explain the relationship.</h2></div><button className="lab-reset" onClick={()=>{setTheta(62);setTilt(0);setLocked(true);setKind('corresponding');setPairIndex(0);setShowMeasures(true);}}><RotateCcw size={16}/>Reset</button></div>
  <p>A transversal cuts lines ℓ and m. Choose a relationship to highlight its angle pairs. The letters stay in the same relative corners as the lines move.</p>
  <div className="parallel-modes" role="group" aria-label="Angle relationship">{(Object.keys(ANGLE_PAIRS) as PairKind[]).map(key=><button key={key} aria-pressed={kind===key} className={kind===key?'selected':''} onClick={()=>{setKind(key);setPairIndex(0);}}>{ANGLE_PAIRS[key].label}</button>)}</div>
  <div className="parallel-drawing"><svg viewBox="0 0 600 440" role="img" aria-labelledby={`${uid}-title ${uid}-description`}>
   <title id={`${uid}-title`}>{`${info.label}: angles ${pair.join(' and ')}`}</title><desc id={`${uid}-description`}>{parallel?'Parallel':'Nonparallel'} lines. {Object.entries(angles).map(([letter,value])=>`${letter}: ${value} degrees`).join('; ')}. Selected pair: {relation}.</desc>
   <path className="parallel-interior" d={`M 35 130 H 565 L 565 ${270-265*Math.tan(radians(actualTilt))} L 35 ${270+265*Math.tan(radians(actualTilt))} Z`}/>
   <path className="parallel-line" d="M 25 130 H 575"/><path className="parallel-line" d={`M 25 ${270+275*Math.tan(radians(actualTilt))} L 575 ${270-275*Math.tan(radians(actualTilt))}`}/>
   <path className="parallel-transversal" d={`M ${300-330*Math.cos(radians(theta))} ${200+330*Math.sin(radians(theta))} L ${300+330*Math.cos(radians(theta))} ${200-330*Math.sin(radians(theta))}`}/>
   <text className="parallel-line-label" x="22" y="113">ℓ</text><text className="parallel-line-label" x="22" y={253+275*Math.tan(radians(actualTilt))}>m</text>
   {parallel&&<><path className="parallel-mark" d="M 90 124 L 98 130 L 90 136 M 90 264 L 98 270 L 90 276"/></>}
   {centers.flatMap(([x,y],j)=>{const phi=j?actualTilt:0,bounds=[phi,theta,phi+180,theta+180,phi+360];return [0,1,2,3].map(i=>{const letter='abcdefgh'[j*4+i],selected=pair.includes(letter),mid=(bounds[i]+bounds[i+1])/2,label=point(x,y,47,mid),value=point(x,y,70,mid);return <g key={letter} className={`parallel-angle ${selected?(letter===pair[0]?'first':'second'):''}`}><path d={sector(x,y,bounds[i],bounds[i+1])}/><text className="parallel-letter" x={label[0]} y={label[1]+5} textAnchor="middle">{letter}</text>{showMeasures&&<text className="parallel-value" x={value[0]} y={value[1]+4} textAnchor="middle">{angles[letter]}°</text>}</g>})})}
   <text className="parallel-region" x="48" y="199">INTERIOR</text><text className="parallel-region" x="48" y="45">EXTERIOR</text><text className="parallel-region" x="48" y="410">EXTERIOR</text>
  </svg><div className="parallel-caption"><span className="parallel-key first">Angle {pair[0]}</span><span className="parallel-key second">Angle {pair[1]}</span><span>{parallel?'ℓ ∥ m':'ℓ and m are not parallel'}</span></div></div>
  <div className="parallel-controls"><Slider label="Transversal angle (degrees)" min={35} max={145} value={theta} onChange={setTheta}/><div className="parallel-toggles"><label><input type="checkbox" checked={locked} onChange={e=>{setLocked(e.target.checked);if(!e.target.checked)setTilt(15);}}/>Keep lines parallel</label><label><input type="checkbox" checked={showMeasures} onChange={e=>setShowMeasures(e.target.checked)}/>Show angle measures</label></div>{!locked&&<Slider label="Tilt line m (degrees)" min={-15} max={15} value={tilt} onChange={setTilt}/>}</div>
  <div className="parallel-relation" aria-live="polite"><div><span className="eyebrow">{info.label.toUpperCase()} · PAIR {pairIndex%info.pairs.length+1} OF {info.pairs.length}</span><h3>∠{pair[0]} and ∠{pair[1]}</h3><p className="parallel-result">{relation}</p><p>{info.rule}</p></div><button className="button light" onClick={()=>setPairIndex((pairIndex+1)%info.pairs.length)}>Next pair<ChevronRight size={16}/></button></div>
  <div className="lab-explain"><Lightbulb size={21}/><div><h3>Why does that work?</h3><p>{info.why}</p>{info.parallelOnly&&!parallel&&<p className="parallel-caution"><strong>The parallel condition is missing.</strong> This pair still has the same positional name, but the equal-angle or 180° relationship no longer holds in this drawing.</p>}</div></div>
  <details className="parallel-reference"><summary>Read all eight angles and the converse</summary><table><caption>Upper intersection: a–d. Lower intersection: e–h.</caption><thead><tr><th>Angle</th><th>Measure</th><th>Region</th></tr></thead><tbody>{Object.entries(angles).map(([letter,value])=><tr key={letter}><th scope="row">∠{letter}</th><td>{value}°</td><td>{'cdef'.includes(letter)?'Interior':'Exterior'}</td></tr>)}</tbody></table><p><strong>Working backward:</strong> For two lines in a plane cut by a transversal, equal corresponding angles or equal alternate angles prove the lines parallel. Supplementary same-side interior angles also prove parallelism. Vertical-angle equality alone does not.</p></details>
  <p className="lab-note">Try this: hide the measures, select a pair, and predict its relationship. Then unlock line m. Explain which facts survive before showing the measures again.</p>
 </section>;
}
