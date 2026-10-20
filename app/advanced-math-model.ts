import type {Point} from './transformation-model';
export type MirrorAxis='horizontal'|'vertical';
export type DivisionStep={power:number;coefficient:number;term:number[];product:number[];before:number[];after:number[]};
export type DivisionResult={quotient:number[];remainder:number[];steps:DivisionStep[]};

export const clean = (n:number) => Math.abs(n) < 1e-9 ? 0 : Number(n.toFixed(10));
export function trimPoly(p:number[]):number[] {
 const out=p.map(clean);
 while(out.length>1 && out[out.length-1]===0) out.pop();
 return out.length?out:[0];
}
export function polyText(p:number[], variable='x'):string {
 const terms:string[]=[];
 const superscript=(n:number)=>String(n).replace(/\d/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
 for(let power=p.length-1;power>=0;power--){
  const value=clean(p[power]); if(!value)continue;
  const magnitude=Math.abs(value), body=(power===0||magnitude!==1?String(magnitude):'')+(power?variable+(power>1?superscript(power):''):'');
  terms.push((terms.length?(value<0?' − ':' + '):(value<0?'−':''))+body);
 }
 return terms.join('')||'0';
}
export function multiplyPoly(a:number[],b:number[]):number[] {
 const out=Array(a.length+b.length-1).fill(0);
 a.forEach((x,i)=>b.forEach((y,j)=>{out[i+j]+=x*y;}));
 return trimPoly(out);
}
export function valueAt(p:number[],x:number):number{return p.reduceRight((sum,c)=>sum*x+c,0);}
export function dividePoly(dividend:number[],divisor:number[]):DivisionResult {
 const d=trimPoly(divisor); if(d.length===1&&d[0]===0)throw new Error('A divisor cannot be the zero polynomial.');
 let remainder=trimPoly(dividend);
 const quotient=Array(Math.max(1,remainder.length-d.length+1)).fill(0), steps:DivisionStep[]=[];
 for(let iteration=0;iteration<20&&remainder.length>=d.length&&remainder.some(n=>n!==0);iteration++){
  const power=remainder.length-d.length,coefficient=clean(remainder[remainder.length-1]/d[d.length-1]);
  const term=Array(power+1).fill(0);term[power]=coefficient;
  const product=multiplyPoly(d,term),before=[...remainder];
  quotient[power]+=coefficient;
  remainder=trimPoly(before.map((n,i)=>n-(product[i]||0)));
  steps.push({power,coefficient,term,product,before,after:[...remainder]});
 }
 return {quotient:trimPoly(quotient),remainder,steps};
}
export function syntheticDivision(p:number[],root:number){
 const top=[...p].reverse(),products=top.map(()=>0),sums=[top[0]];
 for(let i=1;i<top.length;i++){products[i]=clean(sums[i-1]*root);sums[i]=clean(top[i]+products[i]);}
 return {top,products,sums,quotient:trimPoly(sums.slice(0,-1).reverse()),remainder:sums[sums.length-1]};
}
export function reflectPoint(point:Point,axis:MirrorAxis,line:number):Point{
 return axis==='horizontal'?[point[0],clean(2*line-point[1])]:[clean(2*line-point[0]),point[1]];
}
export function composePoints(points:Point[],axis:MirrorAxis,line:number,dx:number,dy:number,reverse=false){
 const translation=(p:Point):Point=>[clean(p[0]+dx),clean(p[1]+dy)];
 const middle=points.map(p=>reverse?translation(p):reflectPoint(p,axis,line));
 const final=middle.map(p=>reverse?reflectPoint(p,axis,line):translation(p));
 return {middle,final};
}
export const MULTIPLICATION_EXAMPLES=[
 {title:'Binomial × binomial',a:[3,1],b:[-2,1]},
 {title:'Negative coefficients',a:[-3,2],b:[4,-1]},
 {title:'Binomial × trinomial',a:[-2,1],b:[3,2,1]},
 {title:'Difference of squares',a:[5,1],b:[-5,1]},
 {title:'Square a binomial',a:[-4,1],b:[-4,1]}
];
export const DIVISION_EXAMPLES=[
 {title:'An exact quotient',a:[6,5,1],b:[2,1]},
 {title:'A nonzero remainder',a:[7,5,1],b:[2,1]},
 {title:'Include the missing x² term',a:[-5,2,0,1],b:[-2,1]},
 {title:'A quadratic divisor',a:[2,-3,0,1],b:[-1,0,1]},
 {title:'A nonmonic divisor',a:[1,-3,2],b:[1,2]}
];
export const COMPOSITION_EXAMPLES:{title:string;axis:MirrorAxis;line:number;dx:number;dy:number}[]=[
 {title:'1. Reflect in m, then translate',axis:'horizontal',line:2,dx:-2,dy:0},
 {title:'2. Reflect in n, then translate',axis:'vertical',line:-1,dx:0,dy:-5},
 {title:'3. Reflect in the y-axis, then translate',axis:'vertical',line:0,dx:0,dy:2}
];
