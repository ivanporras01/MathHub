'use client';
import {useId,useState} from 'react';
import PolynomialLab from './polynomial-lab';
import PolynomialAddSubtract from './polynomial-add-subtract';
import PolynomialWorksheet from './polynomial-worksheet';
import RationalLab from './rational-lab';
import {OPERATION_LABELS,type PolynomialOperation} from './polynomial-operations-model';
import './advanced-math-labs.css';

export default function PolynomialOperationsLab({initialOperation='divide',preferFractions=false}:{initialOperation?:PolynomialOperation;preferFractions?:boolean}){
 const [operation,setOperation]=useState<PolynomialOperation>(initialOperation),id=useId();
 const ordinary=<div id={id+'polynomials'} className="am-section-anchor">{operation==='add'||operation==='subtract'?<PolynomialAddSubtract key={operation} subtract={operation==='subtract'}/>:<PolynomialLab key={operation} initialMode={operation} hideNavigation/>}</div>;
 const worksheet=<div id={id+'worksheet'} className="am-section-anchor"><PolynomialWorksheet key={operation} operation={operation}/></div>;
 return <div className="am-operations">
 <section className="am-lab am-operation-menu" aria-labelledby={id+'title'}><span className="eyebrow">OPERATIONS WITH POLYNOMIALS</span><h2 id={id+'title'}>Four operations. Every step explained.</h2><p>Work with ordinary polynomials, then apply the same ideas to algebraic fractions. The original worksheet is included below with all 13 problems and complete solutions.</p>
 <nav className="am-operation-buttons" aria-label="Choose a polynomial operation">{(['divide','multiply','add','subtract'] as const).map(op=><button key={op} className="button light" aria-pressed={operation===op} onClick={()=>setOperation(op)}><span aria-hidden="true">{({divide:'÷',multiply:'×',add:'+',subtract:'−'})[op]}</span>{OPERATION_LABELS[op]}</button>)}</nav>
 <div className="am-preset-row"><a href={'#'+id+'worksheet'}>Original worksheet & solutions</a><a href={'#'+id+'polynomials'}>{operation==='divide'?'Long & synthetic division':'Ordinary polynomials'}</a><a href={'#'+id+'fractions'}>Extra fraction practice</a><a href={'/?topic='+({divide:'10-division',multiply:'10-multiplication',add:'10-addition',subtract:'10-subtraction'})[operation]}>Open this operation’s scored lesson</a></div></section>
 {operation==='divide'||preferFractions?<>{worksheet}{ordinary}</>:<>{ordinary}{worksheet}</>}
 <section id={id+'fractions'} className="am-lab am-section-anchor"><span className="eyebrow">EXTRA ALGEBRAIC FRACTIONS</span><h2>{OPERATION_LABELS[operation]} with rational expressions</h2><RationalLab key={operation} initialOperation={operation} showOperationPicker={false}/></section>
 </div>;
}
