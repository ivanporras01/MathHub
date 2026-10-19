import {seeded,question as Q,step as S} from './question-utils';
import {SIGNS,compare,inclusive,reverseSign,numberText,type InequalitySign} from './inequalities-model';
import type {Question} from './curriculum';
const expression=(m:number,b:number,sign:InequalitySign)=>`y ${sign} ${m}x ${b<0?'−':'+'} ${Math.abs(b)}`;

export function buildInequalityQuestion(seed:number,level=1):Question{
 const r=seeded(seed<0?-seed-1:seed),variant=r(0,4),m=r(-3,3),b=r(-5,5),x=r(-3,3),sign=SIGNS[r(0,3)];
 if(variant===0){
  const a=(r(0,1)?-1:1)*r(2,level>1?7:4),k=r(-6,6),c=a*k+b,solved=a<0?reverseSign(sign):sign;
  return Q(`Solve the inequality. The boundary is x = k. What is k?`,k,'Undo addition, then divide by the coefficient. Reverse the comparison only when dividing by a negative.',[
   S('Undo the constant','Subtract the signed constant from both sides.',`${a}x ${sign} ${c} − (${b}) = ${a*k}`,'What is the new right-hand value?',a*k),
   S('Divide and interpret',a<0?'A negative divisor reverses the sign.':'A positive divisor preserves the sign.',`x ${solved} ${k}`,'What is the boundary k?',k),
   S('Include or exclude the endpoint',inclusive(solved)?'Equality is allowed: use a filled circle.':'Equality is excluded: use an open circle.',`${k} ${solved} ${k} is ${inclusive(solved)?'true':'false'}`,'Is the endpoint included? Enter 1 for yes or 0 for no.',inclusive(solved)?1:0),
  ],`${a}x ${b<0?'−':'+'} ${Math.abs(b)} ${sign} ${c}`,undefined,'Enter the boundary only. Write the full solved inequality in your work.');
 }
 const boundary=m*x+b;
 if(variant===1)return Q(`For this inequality, find the boundary line’s y-coordinate when x = ${x}.`,boundary,'Replace the inequality with equality to locate the boundary. Then substitute x.',[
  S('Use the boundary equation','The boundary replaces the comparison with =.',`y = ${m}x ${b<0?'−':'+'} ${Math.abs(b)}`,'What is the y-intercept?',b),
  S('Evaluate at the given x','Multiply the slope by the x-coordinate, then add the intercept.',`y = ${m}(${x}) + (${b}) = ${boundary}`,'What is the boundary y-coordinate?',boundary),
  S('Choose the line style',inclusive(sign)?'The comparison includes equality, so use a solid line.':'The comparison excludes equality, so use a dashed line.',`${inclusive(sign)?'Solid':'Dashed'} boundary`,'Is the boundary included? Enter 1 for yes or 0 for no.',inclusive(sign)?1:0),
 ],expression(m,b,sign),undefined,'A boundary point may be excluded from the solution. This question asks for its y-coordinate, not whether it is included.');
 if(variant===2){
  const y=boundary+r(-2,2),works=compare(y,sign,boundary);
  return Q(`Does (${x}, ${y}) satisfy this inequality? Enter 1 for yes or 0 for no.`,works?1:0,'Substitute both coordinates. If the two sides are equal, only ≤ or ≥ accepts the point.',[
   S('Evaluate the right side','Use the given x-coordinate.',`${m}(${x}) + (${b}) = ${boundary}`,'What is the right-hand value?',boundary),
   S('Compare with y','Use the given y-coordinate on the left.',`${y} ${sign} ${boundary} is ${works?'true':'false'}`,'Does the comparison hold? Enter 1 for yes or 0 for no.',works?1:0),
  ],expression(m,b,sign),undefined,'The answer describes the entire ordered pair, not just one coordinate.');
 }
 const m2=r(-3,3),b2=r(-5,5);
 if(variant===3){
  const sign2=SIGNS[r(0,3)],y=r(-6,6),rhs2=m2*x+b2,first=compare(y,sign,boundary),second=compare(y,sign2,rhs2);
  return Q(`Is (${x}, ${y}) a solution of this SYSTEM? Enter 1 for yes or 0 for no.`,first&&second?1:0,'A system means AND. Substitute the ordered pair into both inequalities; both must be true.',[
   S('Check the first inequality','Substitute x and compare the result with y.',`${y} ${sign} ${m}(${x}) + (${b}) = ${boundary}`,'What is the first right-hand value?',boundary),
   S('Check the second inequality','Use the SAME ordered pair in the other inequality.',`${y} ${sign2} ${m2}(${x}) + (${b2}) = ${rhs2}`,'What is the second right-hand value?',rhs2),
   S('Require both conditions','One true comparison cannot compensate for a false comparison.',`First: ${first?'true':'false'}. Second: ${second?'true':'false'}. Both: ${first&&second?'true':'false'}.`,'Does the point satisfy BOTH? Enter 1 for yes or 0 for no.',first&&second?1:0),
  ],`${expression(m,b,sign)}; ${expression(m2,b2,sign2)}`,undefined,'Check each comparison, including whether equality is allowed.');
 }
 const lowerSign:InequalitySign=r(0,1)?'>':'≥',upperSign:InequalitySign=r(0,1)?'<':'≤',lower=boundary,upper=m2*x+b2,min=inclusive(lowerSign)?Math.ceil(lower):Math.floor(lower)+1,max=inclusive(upperSign)?Math.floor(upper):Math.ceil(upper)-1,count=Math.max(0,max-min+1);
 return Q(`For this system, how many INTEGER y-values work when x = ${x}?`,count,'Find the lower and upper bounds at the given x. Remove strict endpoints, then count the integers that meet both conditions.',[
  S('Find the lower bound','Substitute x into the first boundary.',`y ${lowerSign} ${m}(${x}) + (${b}) = ${lower}`,'What is the lower boundary value?',lower),
  S('Find the upper bound','Substitute the same x into the second boundary.',`y ${upperSign} ${m2}(${x}) + (${b2}) = ${upper}`,'What is the upper boundary value?',upper),
  S('Count the common integers','Strict signs exclude their boundary. If the first allowed integer exceeds the last, the count is zero.',count?`Integers from ${min} through ${max}: ${numberText(count)} values.`:`No integer can be at least ${min} AND at most ${max}. Count = 0.`,'How many integer y-values satisfy BOTH inequalities?',count),
 ],`${expression(m,b,lowerSign)}; ${expression(m2,b2,upperSign)}`,undefined,'Enter a count, not a y-coordinate. Zero is possible.');
}
