'use client';
import {useId,useState} from 'react';
import {parseAnswer} from './curriculum';
type RationalExample={title:string;left:[string,string];right:[string,string];operation:string;excluded:number[];steps:[string,string][];result:[string,string];evaluate:(x:number)=>number;check:(x:number)=>number};
export const RATIONAL_EXAMPLES:RationalExample[]=[
 {title:'Multiply',left:['x² − 9','x² − x − 6'],right:['x − 2','x + 3'],operation:'×',excluded:[3,-2,-3],
 steps:[['Factor each polynomial','x² − 9 = (x − 3)(x + 3); x² − x − 6 = (x − 3)(x + 2).'],['Multiply numerators and denominators','[(x − 3)(x + 3)(x − 2)] / [(x − 3)(x + 2)(x + 3)].'],['Cancel common factors','The factors x − 3 and x + 3 cancel. Entire factors cancel; individual terms in a sum do not.'],['Keep original restrictions','x cannot be 3, −2, or −3, even though some factors disappear.']],
 result:['x − 2','x + 2'],evaluate:x=>(x*x-9)/(x*x-x-6)*(x-2)/(x+3),check:x=>(x-2)/(x+2)},
 {title:'Divide',left:['x² − 9','x² − x − 6'],right:['x + 3','x − 2'],operation:'÷',excluded:[3,-2,2,-3],
 steps:[['Record every restriction','Original denominators exclude x = 3, −2, 2. The divisor must also be nonzero, excluding x = −3.'],['Multiply by the reciprocal of the divisor','[(x² − 9)/(x² − x − 6)] × [(x − 2)/(x + 3)]. Invert only the second fraction.'],['Factor, then cancel common factors','[(x − 3)(x + 3)(x − 2)] / [(x − 3)(x + 2)(x + 3)] = (x − 2)/(x + 2).'],['Preserve all four restrictions','The simplified formula does not restore excluded inputs: x ≠ 3, −2, 2, −3.']],
 result:['x − 2','x + 2'],evaluate:x=>((x*x-9)/(x*x-x-6))/((x+3)/(x-2)),check:x=>(x-2)/(x+2)},
 {title:'Add',left:['2','x − 1'],right:['3','x + 1'],operation:'+',excluded:[1,-1],
 steps:[['Find the least common denominator','LCD = (x − 1)(x + 1); x ≠ 1, −1.'],['Multiply each fraction by a form of 1','2(x + 1)/[(x − 1)(x + 1)] + 3(x − 1)/[(x − 1)(x + 1)].'],['Add the complete numerators','2(x + 1) + 3(x − 1) = 2x + 2 + 3x − 3 = 5x − 1.'],['Keep one common denominator','(5x − 1)/(x² − 1), with x ≠ 1, −1.']],
 result:['5x − 1','x² − 1'],evaluate:x=>2/(x-1)+3/(x+1),check:x=>(5*x-1)/(x*x-1)},
 {title:'Subtract',left:['x + 2','x − 1'],right:['3','x + 1'],operation:'−',excluded:[1,-1],
 steps:[['Find the least common denominator','LCD = (x − 1)(x + 1); x ≠ 1, −1.'],['Rewrite using the common denominator','[(x + 2)(x + 1) − 3(x − 1)] / [(x − 1)(x + 1)].'],['Distribute the subtraction to every term','x² + 3x + 2 − (3x − 3) = x² + 3x + 2 − 3x + 3 = x² + 5.'],['Simplify without cancelling terms','(x² + 5)/(x² − 1), with x ≠ 1, −1. The x² terms are not common factors.']],
 result:['x² + 5','x² − 1'],evaluate:x=>(x+2)/(x-1)-3/(x+1),check:x=>(x*x+5)/(x*x-1)}
];
function Fraction({parts}:{parts:[string,string]}){return <span className="am-fraction" aria-label={'('+parts[0]+') divided by ('+parts[1]+')'}><span>{parts[0]}</span><span>{parts[1]}</span></span>;}
export default function RationalLab(){
 const [index,setIndex]=useState(0),[step,setStep]=useState(0),[input,setInput]=useState('0'),[feedback,setFeedback]=useState(''),id=useId(),e=RATIONAL_EXAMPLES[index];
 return <div>
 <p>A rational expression is a quotient of polynomials. Start by identifying where the original expression is undefined. Division also requires the entire divisor to be nonzero.</p>
 <div className="am-preset-row">{RATIONAL_EXAMPLES.map((v,i)=><button className="button light" key={v.title} aria-pressed={index===i} onClick={()=>{setIndex(i);setStep(0);setFeedback('');}}>{v.title}</button>)}</div>
 <div className="am-equation"><span className="am-original"><Fraction parts={e.left}/></span> {e.operation} <span className="am-middle"><Fraction parts={e.right}/></span></div>
 <div className="am-rule">Original restrictions: x ≠ {e.excluded.join(', ')}.</div>
 <ol className="am-rational-steps">{e.steps.slice(0,step+1).map(([title,body],i)=><li key={title}><span className="am-step-number">{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
 {(index===0||index===1)&&step>=2&&<div className="am-factor-cancellation" aria-label="Cancel the common factors x minus 3 and x plus 3, keeping their exclusions.">
 <span className="am-fraction"><span><del>(x − 3)</del><del>(x + 3)</del><b>(x − 2)</b></span><span><del>(x − 3)</del><b>(x + 2)</b><del>(x + 3)</del></span></span><p>Each cancelled factor divided by itself equals 1 only where that factor is nonzero.</p></div>}
 <div className="am-preset-row"><button className="button light" disabled={step===0} onClick={()=>setStep(step-1)}>Previous step</button><button className="button light" disabled={step===3} onClick={()=>setStep(step+1)}>Next step</button><button className="button light" onClick={()=>setStep(3)}>Show full solution</button></div>
 {step===3&&<div className="am-result"><span>Simplified expression, with its original domain</span><b><Fraction parts={e.result}/></b><span>x ≠ {e.excluded.join(', ')}</span></div>}
 <form className="am-predict" onSubmit={event=>{event.preventDefault();const x=parseAnswer(input);if(x===null||Math.abs(x)>50){setFeedback('Enter a value between −50 and 50.');return;}if(e.excluded.some(n=>Math.abs(n-x)<1e-8)){setFeedback('x = '+x+' is excluded by the ORIGINAL expression. Cancelling factors cannot restore this input.');return;}setFeedback('At x = '+x+', original ≈ '+e.evaluate(x).toFixed(6)+' and simplified ≈ '+e.check(x).toFixed(6)+'. This numerical check supports the algebraic steps; one input alone does not prove an identity.');}}>
 <label htmlFor={id+'input'}>Test a value of x. Try an excluded value too.</label><div className="am-preset-row"><input id={id+'input'} value={input} onChange={event=>setInput(event.target.value)}/><button className="button light">Compare values</button></div><p role="status">{feedback}</p></form>
 <p className="am-note"><b>Remember:</b> factor before cancelling; use a common denominator for addition or subtraction; invert only the divisor for division; preserve every original exclusion.</p>
 </div>;
}
