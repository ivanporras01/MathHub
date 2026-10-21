export type RadicalConfig={root:'square'|'cube';a:number;h:number;k:number;direction:1|-1};
export const RADICAL_PRESETS:{title:string;config:RadicalConfig}[]=[
 {title:'Parent square root',config:{root:'square',a:1,h:0,k:0,direction:1}},
 {title:'Right 2, up 1',config:{root:'square',a:1,h:2,k:1,direction:1}},
 {title:'Reflect and stretch',config:{root:'square',a:-2,h:-3,k:4,direction:1}},
 {title:'A graph opening left',config:{root:'square',a:1,h:2,k:-1,direction:-1}},
 {title:'Cube-root comparison',config:{root:'cube',a:1,h:1,k:2,direction:1}}
];
export function radicalValue(c:RadicalConfig,x:number){const input=c.direction*(x-c.h);return c.root==='square'?(input<0?NaN:c.a*Math.sqrt(input)+c.k):c.a*Math.cbrt(input)+c.k;}
export function radicalPoints(c:RadicalConfig){return (c.root==='square'?[0,1,4,9]:[-8,-1,0,1,8]).map(u=>({u,v:c.root==='square'?Math.sqrt(u):Math.cbrt(u),x:c.h+c.direction*u,y:c.k+c.a*(c.root==='square'?Math.sqrt(u):Math.cbrt(u))}));}
export function radicalDomain(c:RadicalConfig){return c.root==='cube'?'All real numbers':`x ${c.direction===1?'≥':'≤'} ${c.h}`;}
export function radicalRange(c:RadicalConfig){return c.root==='cube'?'All real numbers':`y ${c.a>0?'≥':'≤'} ${c.k}`;}
export function radicalFormula(c:RadicalConfig){const inner=c.h===0?'x':`x ${c.h>0?'−':'+'} ${Math.abs(c.h)}`,a=c.a===1?'':c.a===-1?'−':String(c.a),outside=c.k===0?'':` ${c.k>0?'+':'−'} ${Math.abs(c.k)}`;return `f(x) = ${a}${c.root==='square'?'√':'∛'}(${c.direction===-1?'−('+inner+')':inner})${outside}`;}
