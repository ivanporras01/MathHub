export type LinearSystem = {m1:number;b1:number;m2:number;b2:number};
export type Method = 'graphing'|'substitution'|'elimination';
export type Fraction = {n:number;d:number};
export type SystemSolution = {kind:'one';x:Fraction;y:Fraction}|{kind:'none'|'infinite'};
export type SolvingStep = {title:string;why:string;math:string[];cancelY?:boolean};

export const SYSTEM_PRESETS = [
 {id:'crossing',label:'One solution',system:{m1:1,b1:1,m2:-1,b2:5}},
 {id:'parallel',label:'No solution',system:{m1:1,b1:1,m2:1,b2:-2}},
 {id:'same',label:'Infinitely many',system:{m1:1,b1:1,m2:1,b2:1}},
 {id:'fraction',label:'Fraction solution',system:{m1:2,b1:0,m2:-1,b2:1}},
] as const;

const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;
export function fraction(n:number,d=1):Fraction {
 if(!Number.isInteger(n)||!Number.isInteger(d)||d===0)throw new Error('Use integer coefficients and a nonzero denominator.');
 if(d<0){n=-n;d=-d;}
 const divisor=gcd(Math.abs(n),d);
 return {n:n/divisor||0,d:d/divisor};
}
export const value=(f:Fraction)=>f.n/f.d;
export const numberText=(n:number)=>String(n===0?0:n).replace('-', '−');
export const fractionText=(f:Fraction)=>f.d===1?numberText(f.n):`${numberText(f.n)}/${f.d}`;
export function linearExpression(m:number,b:number){
 const term=m===0?'':m===1?'x':m===-1?'−x':`${numberText(m)}x`;
 return !term?numberText(b):b===0?term:`${term} ${b<0?'−':'+'} ${Math.abs(b)}`;
}
export const lineEquation=(m:number,b:number)=>`y = ${linearExpression(m,b)}`;
export function standardEquation(a:number,y:number,c:number){
 const xTerm=linearExpression(a,0);
 const yTerm=y===1?'y':y===-1?'−y':`${numberText(y)}y`;
 return `${a===0?yTerm:`${xTerm} ${y<0?'−':'+'} ${Math.abs(y)===1?'':Math.abs(y)}y`} = ${numberText(c)}`;
}
export function solveSystem(s:LinearSystem):SystemSolution {
 if(s.m1===s.m2)return {kind:s.b1===s.b2?'infinite':'none'};
 return {kind:'one',x:fraction(s.b2-s.b1,s.m1-s.m2),y:fraction(s.m1*s.b2-s.m2*s.b1,s.m1-s.m2)};
}
export function resultText(solution:SystemSolution){
 return solution.kind==='one'?`(${fractionText(solution.x)}, ${fractionText(solution.y)})`:solution.kind==='none'?'No solution':'Infinitely many solutions';
}
export function substitutionCheck(m:number,b:number,x:Fraction){
 const result=fraction(m*x.n+b*x.d,x.d);
 return `${numberText(m)}(${fractionText(x)}) ${b<0?'−':'+'} ${Math.abs(b)} = ${fractionText(result)}`;
}
export function solvingSteps(s:LinearSystem,method:Method):SolvingStep[]{
 const solution=solveSystem(s),one=solution.kind==='one';
 const eq1=lineEquation(s.m1,s.b1),eq2=lineEquation(s.m2,s.b2);
 const conclusion:SolvingStep=one?{
  title:'Check both original equations',why:'The same ordered pair must satisfy BOTH equations. A point on just one line is not a system solution.',
  math:[`Line 1: ${substitutionCheck(s.m1,s.b1,solution.x)}`,`Line 2: ${substitutionCheck(s.m2,s.b2,solution.x)}`,`Both outputs equal y = ${fractionText(solution.y)}. Solution: ${resultText(solution)}.`]
 }:{title:solution.kind==='none'?'Recognize a contradiction':'Recognize an identity',
  why:solution.kind==='none'?'The slopes are equal but the intercepts differ. These parallel lines never meet; no ordered pair satisfies both equations.':'Both equations describe the same line. Every point on that line satisfies both equations; not every point in the plane does.',
  math:[solution.kind==='none'?'A false statement means no solution.':`All points (x, ${linearExpression(s.m1,s.b1)}) are solutions.`]};
 if(method==='graphing')return [
  {title:'Plot Line 1',why:'Use two different x-values, calculate y, and draw a straight line through the points. Line 1 is solid blue.',math:[eq1,`x = 0 → y = ${s.b1}: (0, ${s.b1})`,`x = 1 → y = ${s.m1+s.b1}: (1, ${s.m1+s.b1})`]},
  {title:'Plot Line 2 on the same axes',why:'Repeat for the second equation. Line 2 is dashed orange. Keep the same scale for both lines.',math:[eq2,`x = 0 → y = ${s.b2}: (0, ${s.b2})`,`x = 1 → y = ${s.m2+s.b2}: (1, ${s.m2+s.b2})`]},
  {title:'Read the intersection',why:one?'Read x first, then y. A graph may give an estimate; substitution or elimination confirms exact coordinates.':solution.kind==='none'?'Parallel, distinct lines have no intersection.':'The two lines lie exactly on top of each other. Blue and orange represent the same set of points.',math:[one?`Intersection: ${resultText(solution)}`:resultText(solution)]},
  conclusion,
 ];
 const coefficient=method==='substitution'?s.m1-s.m2:s.m2-s.m1;
 const constant=method==='substitution'?s.b2-s.b1:s.b1-s.b2;
 const reduced=`${numberText(coefficient)}x = ${numberText(constant)}`;
 const steps:SolvingStep[]=method==='substitution'?[
  {title:'Choose the expression to substitute',why:'Equation 1 already isolates y. Replace y in Equation 2 with that entire expression.',math:[`Equation 1: ${eq1}`,`Equation 2: ${eq2}`,`Replace y with (${linearExpression(s.m1,s.b1)}).`]},
  {title:'Substitute and collect like terms',why:`Both expressions equal the same y. Subtract (${numberText(s.m2)})x and (${numberText(s.b1)}) from both sides.`,math:[`${linearExpression(s.m1,s.b1)} = ${linearExpression(s.m2,s.b2)}`,`(${numberText(s.m1)} − (${numberText(s.m2)}))x = ${numberText(s.b2)} − (${numberText(s.b1)})`,reduced]},
 ]:[
  {title:'Line up x, y, and the constants',why:'Rewrite each equation in standard form Ax + By = C. Keep each sign with its term.',math:[`Equation 1: ${standardEquation(-s.m1,1,s.b1)}`,`Equation 2: ${standardEquation(-s.m2,1,s.b2)}`]},
  {title:'Make the y-coefficients opposites',why:'Multiply EVERY term of Equation 2, including its right side, by −1. Equation 1 stays the same.',math:[`Equation 1: ${standardEquation(-s.m1,1,s.b1)}`,`(−1) × Equation 2: ${standardEquation(s.m2,-1,-s.b2)}`]},
  {title:'Add the equations to eliminate y',why:'Add the left sides and add the right sides. The opposite y-terms cancel because y + (−y) = 0.',math:[`${standardEquation(-s.m1,1,s.b1)}`,`+ (${standardEquation(s.m2,-1,-s.b2)})`,`(${numberText(-s.m1)} + (${numberText(s.m2)}))x + 0y = ${numberText(s.b1)} + (${numberText(-s.b2)})`,reduced],cancelY:true},
 ];
 if(one){
  steps.push({title:'Solve for x',why:`Divide both sides by ${numberText(coefficient)}. Keep the exact fraction if it does not simplify to a whole number.`,math:[reduced,`x = (${numberText(constant)}) ÷ (${numberText(coefficient)}) = ${fractionText(solution.x)}`]});
  steps.push({title:'Substitute x to find y',why:'Use either ORIGINAL equation to find the other coordinate. Here we use Equation 1.',math:[eq1,`y = ${substitutionCheck(s.m1,s.b1,solution.x)}`,`(x, y) = ${resultText(solution)}`]});
 }else steps.push({title:'Look at what remains',why:'The x-terms also cancel. Do not divide by zero. Decide whether the remaining statement is true or false.',math:[`0 = ${numberText(constant)}`,solution.kind==='none'?'False → no solution':'True → infinitely many solutions']});
 return [...steps,conclusion];
}

export function graphScale(s:LinearSystem){
 const solution=solveSystem(s);
 const coordinates=[s.b1,s.b2,s.m1+s.b1,s.m2+s.b2,...(solution.kind==='one'?[value(solution.x),value(solution.y)]:[])];
 const needed=Math.max(6,...coordinates.map(n=>Math.abs(n)+2));
 const tick=[1,2,5,10,20].find(n=>needed/n<=7)??20;
 return {extent:Math.ceil(needed/tick)*tick,tick};
}
export function clippedLine(m:number,b:number,extent:number):[number,number][]{
 const points:[number,number][]=[];
 const add=(x:number,y:number)=>{if(Math.abs(x)<=extent+1e-8&&Math.abs(y)<=extent+1e-8&&!points.some(p=>Math.hypot(p[0]-x,p[1]-y)<1e-8))points.push([x,y]);};
 add(-extent,-m*extent+b);add(extent,m*extent+b);
 if(m!==0){add((-extent-b)/m,-extent);add((extent-b)/m,extent);}
 return points.slice(0,2);
}
