import {parseAnswer} from './curriculum';

export type ParentFamily='reciprocal'|'reciprocal-square'|'quadratic';
export type Transform={family:ParentFamily;a:number;b:number;h:number;k:number};
export type GraphStep={title:string;math:string;why:string};
export type GraphExample={
 id:string;family:'rational'|'quadratic';name:string;level:'Foundation'|'Developing'|'Challenge';
 numerator:string;denominator?:string;shift?:string;n:number[];d:number[];
 reduced:string;excluded:number[];va:number[];ha?:number;holes:[number,number][];
 zeros:number[];zeroText?:string;yIntercept:number|null;vertex?:[number,number];axis?:number;
 end?:{label:string;coefficients:number[]};range:string;rangeWhy:string;rangeMath:string;
 rangeContains:(y:number)=>boolean;steps:GraphStep[];samples:number[];
};
export const showNumber=(n:number)=>Math.abs(n)<1e-10?'0':Number(n.toFixed(3)).toString().replace('-','−');
export const pair=(p:[number,number])=>'('+p.map(showNumber).join(', ')+')';
export const polyValue=(c:number[],x:number)=>c.reduceRight((v,a)=>v*x+a,0);
export const graphExampleValue=(e:GraphExample,x:number)=>e.excluded.some(t=>Math.abs(t-x)<1e-10)?NaN:polyValue(e.n,x)/polyValue(e.d,x);
export const parentValue=(family:ParentFamily,x:number)=>family==='quadratic'?x*x:family==='reciprocal'?1/x:1/(x*x);
export const transformedValue=(t:Transform,x:number)=>t.a*parentValue(t.family,t.b*(x-t.h))+t.k;
export const transformedPoint=(t:Transform,u:number):[number,number]=>[t.h+u/t.b,t.a*parentValue(t.family,u)+t.k];
export const shiftTerm=(h:number)=>h===0?'x':h>0?'(x − '+showNumber(h)+')':'(x + '+showNumber(-h)+')';
export const outsideTerm=(k:number)=>k===0?'':k>0?' + '+showNumber(k):' − '+showNumber(-k);
export function transformFormula(t:Transform){
 const input=t.b===1?shiftTerm(t.h):'['+showNumber(t.b)+'·'+shiftTerm(t.h)+']';
 return t.family==='quadratic'?{top:(t.a===1?'':showNumber(t.a)+'·')+input+'²'+outsideTerm(t.k)}:{top:showNumber(t.a),bottom:input+(t.family==='reciprocal-square'?'²':''),shift:outsideTerm(t.k)};
}
export function transformFacts(t:Transform){
 const rational=t.family!=='quadratic',square=t.family==='reciprocal-square',A=t.a*t.b*t.b;
 let zeros:number[]=[];
 if(t.family==='reciprocal'&&t.k!==0)zeros=[t.h-t.a/(t.b*t.k)];
 if(square&&t.k!==0&&-t.a/t.k>0){const d=Math.sqrt(-t.a/t.k)/Math.abs(t.b);zeros=[t.h-d,t.h+d];}
 if(!rational&&-t.k/A>=0){const d=Math.sqrt(-t.k/A);zeros=d===0?[t.h]:[t.h-d,t.h+d];}
 return {excluded:rational?[t.h]:[],va:rational?[t.h]:[],ha:rational?t.k:undefined,zeros,
  yIntercept:rational&&t.h===0?null:transformedValue(t,0),
  range:t.family==='reciprocal'?'All real y except '+showNumber(t.k):rational?(t.a>0?'('+showNumber(t.k)+', ∞)':'(−∞, '+showNumber(t.k)+')'):(t.a>0?'['+showNumber(t.k)+', ∞)':'(−∞, '+showNumber(t.k)+']'),
  vertex:rational?undefined:[t.h,t.k] as [number,number]};
}

// Restricted arithmetic parser: no eval, expressions, or executable input.
export function readNumberList(raw:string):number[]|null{
 const s=raw.trim();if(/^(none|no|∅)$/i.test(s))return [];
 if(!s||s.length>120)return null;
 const content=s.startsWith('(')&&s.endsWith(')')?s.slice(1,-1):s;
 const parts=content.split(',').map(p=>parseAnswer(p));
 return parts.some(p=>p===null)?null:parts as number[];
}
export function sameNumbers(raw:string,expected:number[],ordered=false){
 const actual=readNumberList(raw);if(actual===null||actual.length!==expected.length)return false;
 const a=ordered?actual:[...actual].sort((x,y)=>x-y),b=ordered?expected:[...expected].sort((x,y)=>x-y);
 return a.every((v,i)=>Math.abs(v-b[i])<=.0011);
}
export function sameHoles(raw:string,expected:[number,number][]){
 if(expected.length===0)return sameNumbers(raw,[]);
 const parts=raw.split(';');if(parts.length!==expected.length)return false;
 const actual=parts.map(readNumberList);if(actual.some(p=>!p||p.length!==2))return false;
 const a=(actual as number[][]).sort((x,y)=>x[0]-y[0]),b=[...expected].sort((x,y)=>x[0]-y[0]);
 return a.every((p,i)=>p.every((v,j)=>Math.abs(v-b[i][j])<=.0011));
}
export const RATIONAL_METHOD:GraphStep[]=[
 {title:'Keep the original domain',math:'Q(x) ≠ 0',why:'For f(x) = P(x)/Q(x), solve the original denominator equation Q(x) = 0. Exclude every real solution, including values that disappear when you simplify.'},
 {title:'Factor completely, then simplify',math:'Common factors may cancel; individual terms may not.',why:'After cancellation, an excluded input is a hole only if the reduced formula has a finite value there. If a denominator factor remains at that input, it is a vertical asymptote instead.'},
 {title:'Find vertical asymptotes (VA)',math:'Reduced denominator = 0',why:'After all common factors are removed, each real denominator zero is a VA. Sample on both sides. Odd multiplicity gives opposite infinite directions; even multiplicity gives the same direction on both sides.'},
 {title:'Find end behavior',math:'Compare degrees, or divide: P/Q = S + R/Q',why:'Lower numerator degree: HA y = 0. Equal degrees: HA is the ratio of leading coefficients. Larger numerator degree: no HA; polynomial division gives an oblique line when the degree difference is 1, or a higher-degree polynomial guide otherwise.'},
 {title:'Find intercepts',math:'x-intercepts: P(x) = 0 with Q(x) ≠ 0. y-intercept: f(0), if defined.',why:'Intercepts are actual points on the graph. A cancelled zero is not automatically an x-intercept. An excluded x = 0 means there is no y-intercept.'},
 {title:'Prove the range',math:'Solve y = f(x) for allowed real x.',why:'The range contains exactly the outputs that at least one allowed input reaches. Transformations, discriminants, and inequalities can establish it. An HA can be crossed, and a hole’s y-value may still be reached somewhere else.'},
 {title:'Plot each branch',math:'Restrictions → guides → points → smooth curves',why:'Choose points in every interval separated by VAs and holes. Use a sign chart and values close to each VA. Mark holes with open circles. Do not draw a curve across an excluded vertical line. A finite viewing window is not the domain or range.'},
];
export const QUADRATIC_METHOD:GraphStep[]=[
 {title:'Recognize a quadratic',math:'f(x) = ax² + bx + c, a ≠ 0',why:'A quadratic is a polynomial of degree 2. Its graph is a parabola. Every real x is allowed; it has no holes or vertical or horizontal asymptotes.'},
 {title:'Find the vertex',math:'h = −b/(2a), k = f(h); f(x) = a(x − h)² + k',why:'The vertex is (h, k). The vertical line x = h is the axis of symmetry. Completing the square connects standard form with vertex form.'},
 {title:'Decide direction and width',math:'a > 0: opens up. a < 0: opens down.',why:'Relative to y = x², |a| > 1 makes a narrower parabola and 0 < |a| < 1 makes a wider parabola. The vertex is a minimum when it opens up and a maximum when it opens down.'},
 {title:'Find the intercepts',math:'y-intercept: (0, c). x = [−b ± √(b² − 4ac)]/(2a)',why:'Factor, take square roots, or use the quadratic formula. A positive discriminant gives two distinct real roots, zero gives a repeated root, and a negative discriminant gives no real x-intercepts.'},
 {title:'State the domain and range',math:'Domain: (−∞, ∞). Range: [k, ∞) or (−∞, k].',why:'Every real input is allowed. The square is nonnegative, so the output cannot pass beyond the vertex’s minimum or maximum. Include k with a square bracket because the vertex belongs to the graph.'},
 {title:'Plot symmetric pairs',math:'f(h − d) = f(h + d)',why:'Start at the vertex. Move equal distances left and right, calculate both outputs, then connect the points with a smooth parabola. Continue the arms beyond the viewing window.'},
];
