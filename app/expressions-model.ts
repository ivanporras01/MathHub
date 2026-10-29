import {seeded,question as Q,step as S} from './question-utils';
import type {Question} from './curriculum';

export type Rational={n:number;d:number};
export type TermKind='x²'|'xy'|'x'|'y'|'';
export type Term={kind:'term';coefficient:Rational;variable:TermKind};
export type Expression=Term|{kind:'sum';items:Expression[]}|{kind:'scale';factor:Rational;expression:Expression};
export type ExpressionStep={title:string;property:string;why:string;math:string;terms?:Term[]};
export const TERM_ORDER:TermKind[]=['x²','xy','x','y',''];
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;
export function rational(n:number,d=1):Rational{if(!Number.isInteger(n)||!Number.isInteger(d)||d===0)throw new Error('Invalid fraction');if(d<0){n=-n;d=-d;}const g=gcd(Math.abs(n),d);return{n:n/g||0,d:d/g};}
export const add=(a:Rational,b:Rational)=>rational(a.n*b.d+b.n*a.d,a.d*b.d);
export const multiply=(a:Rational,b:Rational)=>rational(a.n*b.n,a.d*b.d);
export const numeric=(a:Rational)=>a.n/a.d;
export const rationalText=(a:Rational)=>`${a.n<0?'−':''}${Math.abs(a.n)}${a.d===1?'':`/${a.d}`}`;
export const term=(n:number,variable:TermKind='',d=1):Term=>({kind:'term',coefficient:rational(n,d),variable});
export const sum=(...items:Expression[]):Expression=>({kind:'sum',items});
export const scale=(n:number,expression:Expression,d=1):Expression=>({kind:'scale',factor:rational(n,d),expression});
export function termText(t:Term,absolute=false){const c=absolute?{...t.coefficient,n:Math.abs(t.coefficient.n)}:t.coefficient;if(!t.variable)return rationalText(c);if(c.n===0)return`0${t.variable}`;if(c.d===1&&Math.abs(c.n)===1)return`${c.n<0?'−':''}${t.variable}`;return`${c.d===1?rationalText(c):`(${rationalText(c)})`}${t.variable}`;}
export function formatTerms(terms:Term[]){return terms.map((t,i)=>`${i?(t.coefficient.n<0?' − ':' + '):(t.coefficient.n<0?'−':'')}${termText(t,true)}`).join('')||'0';}
export function formatExpression(expr:Expression):string{
 if(expr.kind==='term')return termText(expr);
 if(expr.kind==='sum')return expr.items.map((item,i)=>{const text=formatExpression(item);return i?(text.startsWith('−')?` − ${text.slice(1)}`:` + ${text}`):text;}).join('');
 const {factor}=expr,inside=formatExpression(expr.expression),nested=expr.expression.kind==='sum'&&expr.expression.items.some(x=>x.kind==='scale');
 const absolute=rational(Math.abs(factor.n),factor.d),factorText=absolute.n===absolute.d?'':absolute.d===1?rationalText(absolute):`(${rationalText(absolute)})`;
 return `${factor.n<0?'−':''}${factorText}${nested?'[':'('}${inside}${nested?']':')'}`;
}
export function expand(expr:Expression,factor=rational(1)):Term[]{
 if(expr.kind==='term')return[{...expr,coefficient:multiply(factor,expr.coefficient)}];
 if(expr.kind==='sum')return expr.items.flatMap(x=>expand(x,factor));
 return expand(expr.expression,multiply(factor,expr.factor));
}
export function coefficients(terms:Term[]):Record<TermKind,Rational>{
 const result=Object.fromEntries(TERM_ORDER.map(k=>[k,rational(0)])) as Record<TermKind,Rational>;
 for(const t of terms)result[t.variable]=add(result[t.variable],t.coefficient);
 return result;
}
export const polynomial=(c:Record<TermKind,Rational>)=>formatTerms(TERM_ORDER.filter(k=>c[k].n!==0).map(variable=>({kind:'term',variable,coefficient:c[variable]})));
export function evaluateExpression(expr:Expression,x:number,y=0):number{
 if(expr.kind==='sum')return expr.items.reduce((a,e)=>a+evaluateExpression(e,x,y),0);
 if(expr.kind==='scale')return numeric(expr.factor)*evaluateExpression(expr.expression,x,y);
 return numeric(expr.coefficient)*({'x²':x*x,xy:x*y,x,y,'':1}[expr.variable]);
}
export function evaluateExact(expr:Expression,x:number,y=0):Rational{
 if(expr.kind==='sum')return expr.items.reduce((a,e)=>add(a,evaluateExact(e,x,y)),rational(0));
 if(expr.kind==='scale')return multiply(expr.factor,evaluateExact(expr.expression,x,y));
 return multiply(expr.coefficient,rational({'x²':x*x,xy:x*y,x,y,'':1}[expr.variable]));
}
function expandOnce(expr:Expression):{expression:Expression;factor:Rational}|null{
 if(expr.kind==='term')return null;
 if(expr.kind==='sum'){
  for(let i=0;i<expr.items.length;i++){const next=expandOnce(expr.items[i]);if(next){const items=[...expr.items];items.splice(i,1,...(next.expression.kind==='sum'?next.expression.items:[next.expression]));return{expression:sum(...items),factor:next.factor};}}
  return null;
 }
 const inner=expandOnce(expr.expression);
 if(inner)return{expression:{...expr,expression:inner.expression},factor:inner.factor};
 return{expression:sum(...expand(expr)),factor:expr.factor};
}
export function groupedText(terms:Term[]){return TERM_ORDER.map(k=>terms.filter(t=>t.variable===k)).filter(g=>g.length).map(g=>`(${formatTerms(g)})`).join(' + ');}
export function expressionSteps(expression:Expression):ExpressionStep[]{
 const steps:ExpressionStep[]=[{title:'Read the expression',property:'Understand the task',why:'Simplify means rewrite the same quantity more clearly. There is no equation to solve for x. Keep every sign attached to its term.',math:formatExpression(expression)}];
 let current=expression,next;
 while((next=expandOnce(current))){current=next.expression;steps.push({title:`Distribute the factor ${rationalText(next.factor)}`,property:'Distributive property',why:`Multiply EVERY term inside this group by ${rationalText(next.factor)}. Start with the innermost groups. A minus in front of parentheses means multiply by −1.`,math:formatExpression(current)});}
 const terms=expand(expression),ordered=TERM_ORDER.flatMap(k=>terms.filter(t=>t.variable===k)),c=coefficients(terms);
 steps.push({title:'Move matching terms together',property:'Commutative property of addition',why:'Rewrite subtraction as adding a signed term. Change the order, carrying each sign with its term. The variables AND their exponents must match.',math:formatTerms(ordered),terms:ordered});
 steps.push({title:'Regroup without changing the order',property:'Associative property of addition',why:'Put each family of like terms in its own group. Group x² with x², x with x, y with y, and constants with constants.',math:groupedText(ordered),terms:ordered});
 const factored=TERM_ORDER.map(k=>({k,group:ordered.filter(t=>t.variable===k)})).filter(({group})=>group.length).map(({k,group})=>`(${formatTerms(group.map(t=>({...t,variable:''})))})${k}`).join(' + ');
 steps.push({title:'Factor out the shared variable part',property:'Distributive property in reverse',why:'Each variable family has its own coefficient calculation. Add the signed coefficients inside each group; keep the shared variable part outside.',math:factored});
 steps.push({title:'Combine coefficients, keep the variable part',property:'Distributive property in reverse',why:'For example, 3x + 2x = (3 + 2)x = 5x. Do not add exponents when adding like terms. Omit terms whose coefficient is zero.',math:polynomial(c),terms:TERM_ORDER.filter(k=>c[k].n!==0).map(variable=>({kind:'term',variable,coefficient:c[variable]}))});
 return steps;
}
export const EXPRESSION_LEVELS=[
 {level:1,label:'Like terms',focus:'Signed terms, reordering, and grouping'},
 {level:2,label:'Distribution',focus:'Multiply every term, then combine'},
 {level:3,label:'Negative groups',focus:'Distribute −1 and other negative factors'},
 {level:4,label:'Two variables',focus:'Keep x-terms and y-terms separate'},
 {level:5,label:'Powers',focus:'Distinguish x² from x'},
 {level:6,label:'Fractions',focus:'Use exact fractional coefficients'},
 {level:7,label:'Nested groups',focus:'Work from the inside outward'},
];
export function generateExpression(level:number,seed=71):Expression{
 const r=seeded(seed),a=r(2,5),b=r(2,6),c=r(2,5),d=r(1,4);
 switch(level){
  case 1:return sum(term(a,'x'),term(b),term(c,'x'),term(-d-3));
  case 2:return sum(scale(a,sum(term(2,'x'),term(-b))),term(c,'x'),term(d+3));
  case 3:return sum(scale(-1,sum(term(a,'x'),term(-b))),scale(-c,sum(term(1,'x'),term(d))),term(2,'x'));
  case 4:return sum(scale(2,sum(term(a,'x'),term(-b,'y'))),scale(c,sum(term(1,'x'),term(2,'y'))),term(-d));
  case 5:return sum(scale(-2,sum(term(a,'x²'),term(-b,'x'),term(d))),scale(3,sum(term(1,'x²'),term(1,'x'),term(-c))));
  case 6:return sum(scale(1,sum(term(2*a+1,'x'),term(-b)),2),scale(-1,sum(term(c,'x'),term(d)),3));
  case 7:return sum(scale(2,sum(scale(a,sum(term(1,'x'),term(-b))),scale(-1,sum(term(1,'x'),term(d))))),term(c,'x'));
  default:throw new Error('Choose a level from 1 through 7.');
 }
}
export function buildExpressionQuestion(seed:number,level=1):Question{
 const normalized=seed<0?-seed-1:seed,r=seeded(normalized),difficulty=level<=1?r(2,3):level===2?r(4,5):r(6,7);
 const expression=generateExpression(difficulty,normalized),terms=expand(expression),c=coefficients(terms);
 const candidates=TERM_ORDER.filter(k=>k!==''&&terms.some(t=>t.variable===k));
 const target=candidates[r(0,candidates.length-1)],matches=terms.filter(t=>t.variable===target),first=matches[0];
 return Q(`Simplify completely. Enter the coefficient of ${target}.`,numeric(c[target]),'Distribute every factor, keep the signs, then group only matching variables and exponents.',[
  S('Distribute every factor','Expand from the innermost parentheses outward. Multiply every term, including constants.',formatTerms(terms),`What is the signed coefficient of the FIRST ${target}-term after expanding?`,numeric(first.coefficient)),
  S('Reorder and group like terms','Use the commutative property to reorder and the associative property to group. Keep each signed term intact.',groupedText(terms),`How many ${target}-terms appear after expanding, before combining?`,matches.length),
  S('Combine the requested coefficients','Like terms share the entire variable part. Add their coefficients; do not add their exponents.',`${matches.map(t=>`(${rationalText(t.coefficient)})`).join(' + ')} = ${rationalText(c[target])}`,`What is the coefficient of ${target}?`,numeric(c[target])),
  S('Write the complete simplified expression','This is the FINAL simplified expression after collecting terms. If every term cancels, the final answer is zero.',`Final simplified expression = ${polynomial(c)}`,'What is the constant term in the simplified expression? Enter 0 if there is none.',numeric(c[''])),
 ],formatExpression(expression),undefined,'Write the whole simplified expression in your work. Enter only the requested coefficient here; exact fractions are accepted.');
}

// Existing stored questions use unsigned seeds. Preserve their original content and scoring.
export function legacyExpressionQuestion(seed:number,level=1):Question{
 const r=seeded(seed),a=r(2,level>1?9:5),b=r(2,7),c=r(1,5),v=r(0,2),k=v===0?-b:b,d=c+2;
 return Q('Simplify. Enter the coefficient of x.',a+k,'Combine x-terms. Keep the constant separate.',[
  S('Identify like terms','Keep each sign with its term.',`${a}x and ${k}x`,'What is the signed coefficient of the second x-term?',k),
  S('Combine coefficients','Only matching variable parts combine.',`${a} + (${k}) = ${a+k}; result: ${a+k}x − ${d}`,'What is the coefficient of x?',a+k),
 ],`${a}x ${k<0?'−':'+'} ${Math.abs(k)}x − ${d}`);
}
