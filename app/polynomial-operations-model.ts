import {clean,trimPoly} from './advanced-math-model';
export type PolynomialOperation='divide'|'multiply'|'add'|'subtract';
export const OPERATION_LABELS={divide:'Division',multiply:'Multiplication',add:'Addition',subtract:'Subtraction'};
export function combinePolynomials(a:number[],b:number[],subtract=false){
 return trimPoly(Array.from({length:Math.max(a.length,b.length)},(_,i)=>clean((a[i]||0)+(subtract?-1:1)*(b[i]||0))));
}
export const SUM_DIFFERENCE_EXAMPLES=[
 {title:'Different signs',a:[5,-2,3],b:[-7,4,1]},
 {title:'Missing powers',a:[-4,2,0,3],b:[5,0,-2,1]},
 {title:'Subtracting negatives',a:[7,-3,2],b:[-8,-5,-4]},
 {title:'Terms that cancel',a:[-2,5,3],b:[2,-5,-3]}
];
