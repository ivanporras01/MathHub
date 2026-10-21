'use client';
import {useId,useState} from 'react';
import {parseAnswer} from './curriculum';
import {polyText,valueAt} from './advanced-math-model';
import {combinePolynomials,SUM_DIFFERENCE_EXAMPLES} from './polynomial-operations-model';

export default function PolynomialAddSubtract({subtract=false}:{subtract?:boolean}){
 const [index,setIndex]=useState(0),[custom,setCustom]=useState<{a:number[];b:number[]}|null>(null),[left,setLeft]=useState('3, -2, 5'),[right,setRight]=useState('1, 4, -7'),[error,setError]=useState(''),[guess,setGuess]=useState(''),[feedback,setFeedback]=useState(''),id=useId();
 const {a,b}=custom||SUM_DIFFERENCE_EXAMPLES[index],result=combinePolynomials(a,b,subtract),adjusted=b.map(n=>subtract?-n:n),powers=Array.from({length:Math.max(a.length,b.length)},(_,i)=>Math.max(a.length,b.length)-1-i);
 const parse=(s:string)=>{const values=s.split(',').map(parseAnswer);return values.length<=5&&values.every(n=>n!==null&&Number.isInteger(n)&&Math.abs(n)<=30)?(values as number[]).reverse():null;};
 const clear=()=>{setGuess('');setFeedback('');setError('');};
 return <section className="am-lab" aria-labelledby={id+'title'}>
 <span className="eyebrow">POLYNOMIAL {subtract?'SUBTRACTION':'ADDITION'}</span><h2 id={id+'title'}>{subtract?'Change every sign. Then combine.':'Line up the powers. Add the coefficients.'}</h2>
 <p>{subtract?'Subtracting Q means adding its opposite, −Q. The minus sign changes EVERY term of the second polynomial.':'Like terms have the same variable and exponent. Add their coefficients and keep the exponent unchanged.'}</p>
 <div className="am-preset-row">{SUM_DIFFERENCE_EXAMPLES.map((e,i)=><button className="button light small" aria-pressed={!custom&&index===i} key={e.title} onClick={()=>{setIndex(i);setCustom(null);setLeft([...e.a].reverse().join(', '));setRight([...e.b].reverse().join(', '));clear();}}>{e.title}</button>)}</div>
 <div className="am-equation"><span className="am-original">({polyText(a)})</span> {subtract?'−':'+'} <span className="am-middle">({polyText(b)})</span></div>
 <ol className="am-rational-steps">
 <li><span className="am-step-number">1</span><div><h3>Align matching powers</h3><p>Put x³ under x³, x² under x², x under x, and constants together. Use 0 when a power is missing.</p></div></li>
 <li><span className="am-step-number">2</span><div><h3>{subtract?'Distribute −1 to the entire second polynomial':'Remove parentheses without changing signs'}</h3><div className="am-equation">{subtract?'−':'+'}({polyText(b)}) = {polyText(adjusted)}</div><p>{subtract?'Negative × positive is negative; negative × negative is positive. For example, −(−7) = +7.':'Adding a polynomial keeps each coefficient and its sign.'}</p></div></li>
 <li><span className="am-step-number">3</span><div><h3>Add the signed coefficients in each column</h3><p>The powers label the columns; they do not change when you add or subtract.</p></div></li>
 </ol>
 <div className="am-table-wrap"><table><caption>Coefficient alignment, including zero placeholders</caption><thead><tr><th scope="col">Row</th>{powers.map(p=><th scope="col" key={p}>{p?polyText([...Array(p).fill(0),1]):'Constant'}</th>)}</tr></thead><tbody>
 <tr><th scope="row">First polynomial</th>{powers.map(p=><td className="am-original" key={p}>{a[p]||0}</td>)}</tr>
 <tr><th scope="row">{subtract?'Opposite of second polynomial':'Second polynomial'}</th>{powers.map(p=><td className="am-middle" key={p}>{adjusted[p]||0}</td>)}</tr>
 <tr><th scope="row">Add each column</th>{powers.map(p=><td key={p}>{a[p]||0} + ({adjusted[p]||0}) = <b>{result[p]||0}</b></td>)}</tr>
 </tbody></table></div>
 <div className="am-result"><span>4. Write the simplified polynomial in descending powers</span><b>{polyText(result)}</b><p>Omit zero terms. If every coefficient cancels, the result is 0.</p></div>
 <p className="am-rule">Check at x = 2: ({valueAt(a,2)}) {subtract?'−':'+'} ({valueAt(b,2)}) = {valueAt(result,2)}. Substituting into the simplified result gives {valueAt(result,2)} too.</p>
 <details className="am-details"><summary>Try your own polynomials</summary><p>Enter up to five integer coefficients from highest power to constant. Include zeros. Example: 3, 0, 2, −4 means 3x³ + 2x − 4.</p><form onSubmit={event=>{event.preventDefault();const x=parse(left),y=parse(right);if(!x||!y){setError('Use 1–5 integers from −30 to 30 in each field, separated by commas.');return;}setCustom({a:x,b:y});clear();setError('Your polynomials are loaded.');}}><div className="am-two-columns"><label>First polynomial<input value={left} onChange={e=>setLeft(e.target.value)}/></label><label>Second polynomial<input value={right} onChange={e=>setRight(e.target.value)}/></label></div><button className="button light">Load polynomials</button><p role="status">{error}</p></form></details>
 <form className="am-predict" onSubmit={event=>{event.preventDefault();const n=parseAnswer(guess);setFeedback(n===null?'Enter a numeric coefficient.':n===(result[1]||0)?'Correct! You combined the signed coefficients of x.':'Try again. Use the x column only, and apply the operation to the second coefficient.');}}><label htmlFor={id+'guess'}>Your turn: what is the coefficient of x?</label><div className="am-preset-row"><input id={id+'guess'} value={guess} onChange={e=>setGuess(e.target.value)}/><button className="button light">Check answer</button></div><p role="status">{feedback}</p></form>
 <p className="am-note">These explorations do not record a score. Use guided practice and independent practice in the lesson to record progress.</p>
 </section>;
}
