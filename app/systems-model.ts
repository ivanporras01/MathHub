export type LinearSystem = {m1:number;b1:number;m2:number;b2:number};
export type Method = 'graphing'|'substitution'|'elimination';
export type Fraction = {n:number;d:number};
export type SystemSolution = {kind:'one';x:Fraction;y:Fraction}|{kind:'none'|'infinite'};
export type SolvingStep = {title:string;why:string;math:string[];cancelY?:boolean;columns?:{label:string;first:string;second:string;result:string;why:string}[];checkpoint?:{question:string;options:string[];correct:number;why:string}};

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
  title:'Verify BOTH original equations',why:'Substitute the SAME x into both original equations. Both must give the SAME y. Only then is the ordered pair a solution.',
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
  {title:'Set the y-expressions equal and collect like terms',why:'Both expressions equal the same y, so they are equal to each other. Move terms by doing the same operation on BOTH sides. Combine x-terms with x-terms and constants with constants.',math:[`${linearExpression(s.m1,s.b1)} = ${linearExpression(s.m2,s.b2)}`,`(${numberText(s.m1)} − (${numberText(s.m2)}))x = ${numberText(s.b2)} − (${numberText(s.b1)})`,reduced]},
 ]:[
  {title:'Align the x-terms, y-terms, and constants',why:'Rewrite each equation in Ax + By = C form. Put x under x and y under y, and keep every negative sign. Plan to eliminate one variable by ADDING opposite coefficients.',math:[`Equation 1: ${standardEquation(-s.m1,1,s.b1)}`,`Equation 2: ${standardEquation(-s.m2,1,s.b2)}`]},
  {title:'Multiply the ENTIRE second equation by −1',why:'Both equations contain +y. To eliminate y by addition we need +y and −y. Multiply EACH term, including the number on the right, by −1. Multiplying both sides by the same nonzero number preserves the equation.',math:[`Equation 2 before: ${standardEquation(-s.m2,1,s.b2)}`,`(−1) × every term in Equation 2`,`Equation 2 after: ${standardEquation(s.m2,-1,-s.b2)}`,`Equation 1 stays: ${standardEquation(-s.m1,1,s.b1)`]},
  {title:'Add matching columns to eliminate y',why:'Add x with x, y with y, and the right-side numbers together. Since +y and −y are opposites, they add to 0y. The y-variable disappears; the remaining equation contains x only.',math:[`Equation 1: ${standardEquation(-s.m1,1,s.b1)}`,`Scaled Equation 2: ${standardEquation(s.m2,-1,-s.b2)}`,`Combined equation: ${reduced}`],cancelY:true,columns:[
 {label:'x-terms',first:`${numberText(-s.m1)}x`,second:`${numberText(s.m2)}x`,result:`${numberText(coefficient)}x`,why:'Add the signed x-coefficients.'},
 {label:'y-terms',first:'+y',second:'−y',result:'0y',why:'Opposites cancel each other.'},
 {label:'right sides',first:numberText(s.b1),second:numberText(-s.b2),result:numberText(constant),why:'Add numbers on the right.'}
 ],checkpoint:{question:'What do +y and −y add up to?',options:['2y','0','−2y'],correct:1,why:'A positive y and a negative y have equal magnitude and opposite signs. Their sum is zero.'}},
 ];
 if(one){
  steps.push({title:'Solve for x: divide BOTH sides',why:`Only one variable remains in ${reduced}. Divide both sides by ${numberText(coefficient)}, preserving equality. Remember negative ÷ negative = positive, and keep exact fractions.`,math:[reduced,`x = (${numberText(constant)}) ÷ (${numberText(coefficient)})`,`x = ${fractionText(solution.x)}`]});
  steps.push({title:'Substitute x into the ORIGINAL equation to find y',why:'A system answer is an ordered pair (x, y). Replace x in Equation 1 with the x-value you just found and calculate y.',math:[`Original Equation 1: ${eq1}`,`Use x = ${fractionText(solution.x)}`,`y = ${substitutionCheck(s.m1,s.b1,solution.x)}`,`(x, y) = ${resultText(solution)}`]});
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
