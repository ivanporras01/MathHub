'use client';
import {useId,useState} from 'react';
import {parseAnswer,isCorrect} from './curriculum';
import {trimPoly,multiplyPoly,dividePoly,syntheticDivision,polyText,MULTIPLICATION_EXAMPLES,DIVISION_EXAMPLES} from './advanced-math-model';
import RationalLab from './rational-lab';
import './advanced-math-labs.css';

type Mode='multiply'|'divide'|'rational';
function CoefficientEditor({a,b,onApply}:{a:number[];b:number[];onApply:(a:number[],b:number[])=>void}){
 const [left,setLeft]=useState([...a].reverse().join(', ')),[right,setRight]=useState([...b].reverse().join(', ')),[error,setError]=useState('');
 const parse=(s:string)=>{const values=s.split(',').map(t=>parseAnswer(t));return values.length<=5&&values.every(n=>n!==null&&Number.isInteger(n)&&Math.abs(n)<=30)?values as number[]:null;};
 return <details className="am-details"><summary>Try your own polynomial coefficients</summary><p>Enter coefficients from highest power to constant, separated by commas. Include 0 for missing powers. Example: <b>1, 0, 2, −5</b> means x³ + 0x² + 2x − 5. Use up to five coefficients, each an integer between −30 and 30.</p><form onSubmit={e=>{e.preventDefault();const x=parse(left),y=parse(right);if(!x||!y){setError('Use 1–5 integer coefficients in each field, separated by commas.');return;}if(y.every(n=>n===0)){setError('The second polynomial must be nonzero.');return;}onApply(x.reverse(),y.reverse());setError('Your polynomials are loaded.');}}>
 <div className="am-two-columns"><label>First polynomial<input value={left} onChange={e=>setLeft(e.target.value)}/></label><label>Second polynomial<input value={right} onChange={e=>setRight(e.target.value)}/></label></div><button className="button light">Load polynomials</button><p role="status">{error}</p></form></details>;
}
export default function PolynomialLab({initialMode='multiply'}:{initialMode?:Mode}){
 const [mode,setMode]=useState<Mode>(initialMode),[index,setIndex]=useState(0),[custom,setCustom]=useState<{a:number[];b:number[]}|null>(null);
 const [revealed,setRevealed]=useState(1),[guess,setGuess]=useState(''),[feedback,setFeedback]=useState(''),[synthetic,setSynthetic]=useState(false),id=useId();
 const examples=mode==='divide'?DIVISION_EXAMPLES:MULTIPLICATION_EXAMPLES,example=custom||examples[index%examples.length],{a,b}=example;
 const reset=()=>{setRevealed(1);setGuess('');setFeedback('');setSynthetic(false);};
 const selectMode=(next:Mode)=>{setMode(next);setIndex(0);setCustom(null);reset();};
 const product=multiplyPoly(a,b),division=dividePoly(a,b);
 const rowPowers=Array.from({length:a.length},(_,i)=>a.length-1-i),columnPowers=Array.from({length:b.length},(_,i)=>b.length-1-i);
 const cells=rowPowers.flatMap(i=>columnPowers.map(j=>({i,j,power:i+j,value:a[i]*b[j]}))),allShown=revealed>=cells.length;
 const current=cells[Math.min(revealed-1,cells.length-1)];
 const divisionTotal=Math.max(1,division.steps.length*3),divisionComplete=revealed>=divisionTotal,activeIndex=Math.min(Math.floor((revealed-1)/3),division.steps.length-1),phase=(revealed-1)%3;
 const active=division.steps[activeIndex],term=(c:number,p:number)=>polyText([...Array(p).fill(0),c]);
 const canSynthetic=b.length===2&&b[1]===1,syntheticResult=canSynthetic?syntheticDivision(a,-b[0]):null;
 return <section className="am-lab" aria-labelledby={id+'title'}>
 <div className="am-heading"><div><span className="eyebrow">ALGEBRA · POLYNOMIAL STUDIO</span><h2 id={id+'title'}>{mode==='multiply'?'Every term meets every term.':mode==='divide'?'Divide. Multiply. Subtract. Repeat.':'Factor first. Preserve the restrictions.'}</h2></div><button className="button light small" onClick={()=>{setIndex(0);setCustom(null);reset();}}>Reset</button></div>
 <nav className="am-preset-row" aria-label="Polynomial operations">{([['multiply','Multiplication'],['divide','Long division'],['rational','Rational expressions']] as const).map(([m,t])=><button key={m} className="button light" aria-pressed={mode===m} onClick={()=>selectMode(m)}>{t}</button>)}</nav>
 {mode==='rational'?<RationalLab/>:<>
 <p>{mode==='multiply'?'The distributive property applies to polynomials of any length. Multiply coefficients, add exponents, then combine only terms with the same power.':'Arrange each polynomial in descending powers. Include zero placeholders. Each subtraction removes the leading term; stop when the remainder has smaller degree than the divisor.'}</p>
 <div className="am-preset-row">{examples.map((e,i)=><button className="button light small" key={e.title} aria-pressed={!custom&&index===i} onClick={()=>{setIndex(i);setCustom(null);reset();}}>{e.title}</button>)}</div>
 <div className="am-equation"><span className="am-original">({polyText(a)})</span> {mode==='multiply'?'×':'÷'} <span className="am-middle">({polyText(b)})</span></div>
 <CoefficientEditor key={mode+':'+index+':'+a.join()+':'+b.join()} a={a} b={b} onApply={(x,y)=>{setCustom({a:trimPoly(x),b:trimPoly(y)});reset();}}/>
 {mode==='multiply'?<>
 <p className="am-note">This multiplication grid organizes signed terms. With negative coefficients it is an algebraic grid, not a rectangle with negative side lengths. FOIL is the four-cell special case for two binomials.</p>
 <div className="am-table-wrap"><table className="am-product-grid"><caption>Click a product cell or use the step buttons</caption><thead><tr><th scope="col">×</th>{columnPowers.map(j=><th className="am-middle" scope="col" key={j}>{term(b[j],j)}</th>)}</tr></thead><tbody>{rowPowers.map((i,row)=><tr key={i}><th scope="row" className="am-original">{term(a[i],i)}</th>{columnPowers.map((j,col)=>{const position=row*b.length+col,shown=position<revealed;return <td key={j} className={'am-power-'+((i+j)%4)}><button aria-label={'Multiply '+term(a[i],i)+' by '+term(b[j],j)} aria-pressed={position===revealed-1} onClick={()=>{setRevealed(position+1);setFeedback('');}}><small>({term(a[i],i)})({term(b[j],j)})</small><strong>{shown?term(a[i]*b[j],i+j):'?'}</strong></button></td>;})}</tr>)}</tbody></table></div>
 <div className="am-rule" aria-live="polite"><b>Cell {Math.min(revealed,cells.length)} of {cells.length}:</b> multiply coefficients ({a[current.i]})({b[current.j]}) = {current.value}; add exponents {current.i} + {current.j} = {current.power}. Result: <b>{term(current.value,current.power)}</b>.</div>
 <div className="am-preset-row"><button className="button light" disabled={revealed<=1} onClick={()=>{setRevealed(revealed-1);setFeedback('');}}>Previous product</button><button className="button light" disabled={allShown} onClick={()=>{setRevealed(revealed+1);setFeedback('');}}>Next product</button><button className="button light" onClick={()=>setRevealed(cells.length)}>Show all products</button></div>
 <h3>Collect like powers</h3><div className="am-collect">{Array.from({length:a.length+b.length-1},(_,k)=>a.length+b.length-2-k).map(power=>{const matching=cells.map((c,i)=>({...c,position:i})).filter(c=>c.power===power),shown=matching.filter(c=>c.position<revealed);return <div key={power} className={'am-power-'+power%4}><b>{power===0?'Constants':term(1,power)+' terms'}</b><span>{shown.length?shown.map(c=>'('+c.value+')').join(' + '):'?'}</span><strong>{matching.length===shown.length?'= '+term(shown.reduce((s,c)=>s+c.value,0),power):'Keep distributing…'}</strong></div>;})}</div>
 <div className="am-result">{allShown?<><span>Complete product</span><b>{polyText(product)}</b></>:<span>Reveal all {cells.length} products to complete the polynomial.</span>}</div>
 <form className="am-predict" onSubmit={e=>{e.preventDefault();const power=product.length>1?1:0;setFeedback(parseAnswer(guess)===null?'Enter a numeric coefficient.':isCorrect(guess,product[power])?'Correct. You combined every contribution with that power.':'Try again: find all cells with that power and add their signed coefficients.');}}><label htmlFor={id+'coefficient'}>Predict the {product.length>1?'coefficient of x':'constant term'} in the full product.</label><div className="am-preset-row"><input id={id+'coefficient'} value={guess} onChange={e=>setGuess(e.target.value)}/><button className="button light">Check coefficient</button></div><p role="status">{feedback}</p></form>
 <p className="am-note"><b>Watch the distinction:</b> x² · x³ = x⁵, but 2x² + 3x² = 5x². The square (x − 4)² contains a middle term: x² − 8x + 16.</p>
 </>:<>
 <div className="am-rule">Dividend = divisor × quotient + remainder</div>
 <p className="am-note">Coefficient alignment: {a.slice().reverse().map((c,i)=>'('+c+')x^'+(a.length-1-i)).join(' + ')}. Keep the 0 coefficients when setting up division.</p>
 {active?<div className="am-division-work" aria-live="polite">
 <p>Round {activeIndex+1} of {division.steps.length} · Current polynomial: <b>{polyText(active.before)}</b></p>
 <ol><li><b>Divide the leading terms.</b><div className="am-equation">{term(active.before[active.before.length-1],active.before.length-1)} ÷ {term(b[b.length-1],b.length-1)} = <span className="am-original">{polyText(active.term)}</span></div></li>
 <li><b>Multiply the entire divisor.</b><div className="am-equation">{phase>=1||divisionComplete?<>{polyText(active.term)}({polyText(b)}) = <span className="am-middle">{polyText(active.product)}</span></>:'Reveal the next step.'}</div></li>
 <li><b>Subtract the entire product.</b><div className="am-equation">{phase>=2||divisionComplete?<><span>{polyText(active.before)}</span> − (<span className="am-middle">{polyText(active.product)}</span>) = <span className="am-final">{polyText(active.after)}</span></>:'Keep parentheses around every term you subtract.'}</div></li></ol>
 <p>{phase===2||divisionComplete?'All lower powers are included in the new polynomial. Repeat if its degree is at least the divisor’s degree.':'Keep each term in its power column. Subtracting a negative term adds its opposite.'}</p>
 </div>:<p>The dividend already has lower degree than the divisor (or is zero): quotient 0, remainder {polyText(a)}.</p>}
 <div className="am-preset-row"><button className="button light" disabled={revealed<=1} onClick={()=>setRevealed(revealed-1)}>Previous step</button><button className="button light" disabled={divisionComplete} onClick={()=>setRevealed(revealed+1)}>Next step</button><button className="button light" onClick={()=>setRevealed(divisionTotal)}>Reveal result</button></div>
 {divisionComplete&&<div className="am-result"><span>Quotient: {polyText(division.quotient)} · Remainder: {polyText(division.remainder)}</span><b>{polyText(a)} = ({polyText(b)})({polyText(division.quotient)}) + ({polyText(division.remainder)})</b><p>As a rational expression: quotient + remainder / divisor, with the original divisor ≠ 0.</p></div>}
 <details className="am-details"><summary>See every subtraction aligned by powers</summary><div className="am-table-wrap"><table><thead><tr><th>Round / row</th>{Array.from({length:a.length},(_,i)=><th key={i}>{term(1,a.length-1-i)}</th>)}</tr></thead><tbody>{division.steps.flatMap((s,i)=>[['Before',s.before],['Subtract this entire row',s.product],['After subtraction',s.after]].map(([label,row],r)=><tr key={i+'-'+r}><th>{i+1}. {label as string}</th>{Array.from({length:a.length},(_,k)=><td key={k}>{(row as number[])[a.length-1-k]||0}</td>)}</tr>))}</tbody></table></div></details>
 <button className="button light" aria-expanded={synthetic} onClick={()=>setSynthetic(!synthetic)}>Connect to synthetic division</button>
 {synthetic&&<div className="am-division-work">{canSynthetic&&syntheticResult?<><h3>Dividing by x − c: use c = {-b[0]}</h3><p>Bring down the first coefficient. Multiply by c, add in the next column, and repeat. Zero placeholders stay in the top row.</p><div className="am-table-wrap"><table><thead><tr><th>c = {-b[0]}</th>{syntheticResult.top.map((n,i)=><th key={i}>{n}</th>)}</tr></thead><tbody><tr><th>Multiply by c</th>{syntheticResult.products.map((n,i)=><td key={i}>{i===0?'—':n}</td>)}</tr><tr><th>Add</th>{syntheticResult.sums.map((n,i)=><td key={i} className={i===syntheticResult.sums.length-1?'am-middle':'am-final'}>{n}</td>)}</tr></tbody></table></div><p>The last number is the remainder, {syntheticResult.remainder}. The preceding numbers give quotient {polyText(syntheticResult.quotient)}.</p></>:<p>This simple synthetic scheme requires a monic linear divisor x − c. Use the long-division method above for this divisor.</p>}</div>}
 </>}
 <p className="am-note">These are exploration examples. Custom division results may be rounded to 10 decimal places. Use the lesson’s guided steps and independent practice to record progress.</p>
 </>}
 </section>;
}
