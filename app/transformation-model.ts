export type Point=[number,number];
export type Transform='reflect-x'|'reflect-y'|'rotate-90'|'rotate-180'|'rotate-270'|'translate'|'dilate';
export type TransformOptions={dx:number;dy:number;scale:number};
export const TRANSFORMS:{id:Transform;label:string}[]=[
 {id:'reflect-x',label:'Reflect x'},{id:'reflect-y',label:'Reflect y'},
 {id:'rotate-90',label:'Rotate 90°'},{id:'rotate-180',label:'Rotate 180°'},
 {id:'rotate-270',label:'Rotate 270°'},{id:'translate',label:'Translate'},{id:'dilate',label:'Dilate'}
];
const regular=(n:number):Point[]=>Array.from({length:n},(_,i)=>[3*Math.cos(Math.PI/2+2*Math.PI*i/n),3*Math.sin(Math.PI/2+2*Math.PI*i/n)]);
export const FIGURES:{id:string;label:string;points:Point[]}[]=[
 {id:'point',label:'Point',points:[[2,1]]},
 {id:'triangle',label:'Triangle',points:[[1,1],[4,1],[2,4]]},
 {id:'rectangle',label:'Rectangle',points:[[1,1],[4,1],[4,3],[1,3]]},
 {id:'square',label:'Square',points:[[1,1],[3,1],[3,3],[1,3]]},
 {id:'pentagon',label:'Pentagon',points:regular(5)},
 {id:'hexagon',label:'Hexagon',points:regular(6)}
];
export function transformPoint([x,y]:Point,mode:Transform,{dx,dy,scale}:TransformOptions):Point{
 switch(mode){case'reflect-x':return[x,-y];case'reflect-y':return[-x,y];case'rotate-90':return[-y,x];case'rotate-180':return[-x,-y];case'rotate-270':return[y,-x];case'translate':return[x+dx,y+dy];case'dilate':return[x*scale,y*scale];}
}
export function transformationRule(mode:Transform,o:TransformOptions){
 switch(mode){case'reflect-x':return'(x, y) → (x, −y)';case'reflect-y':return'(x, y) → (−x, y)';case'rotate-90':return'(x, y) → (−y, x)';case'rotate-180':return'(x, y) → (−x, −y)';case'rotate-270':return'(x, y) → (y, −x)';case'translate':return`(x, y) → (x + (${o.dx}), y + (${o.dy}))`;case'dilate':return`(x, y) → (${o.scale}x, ${o.scale}y)`;}
}
export function graphExtent(points:Point[]){return Math.max(6,Math.ceil(Math.max(...points.flat().map(Math.abs)))+1);}
export function coordinate(n:number){return Math.abs(n)<.000001?'0':String(Number(n.toFixed(2)));}
