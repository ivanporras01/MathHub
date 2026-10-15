export type Point=[number,number];
export type Transform='reflect-x'|'reflect-y'|'rotate-90'|'rotate-180'|'rotate-270'|'translate'|'dilate';
export type RotationDirection='ccw'|'cw';
export type TransformOptions={dx:number;dy:number;scale:number;direction?:RotationDirection};
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
export function transformPoint([x,y]:Point,mode:Transform,{dx,dy,scale,direction='ccw'}:TransformOptions):Point{
 switch(mode){case'reflect-x':return[x,-y];case'reflect-y':return[-x,y];case'rotate-90':return direction==='cw'?[y,-x]:[-y,x];case'rotate-180':return[-x,-y];case'rotate-270':return direction==='cw'?[-y,x]:[y,-x];case'translate':return[x+dx,y+dy];case'dilate':return[x*scale,y*scale];}
}
export function transformationRule(mode:Transform,o:TransformOptions){
 switch(mode){case'reflect-x':return'(x, y) → (x, −y)';case'reflect-y':return'(x, y) → (−x, y)';case'rotate-90':return o.direction==='cw'?'(x, y) → (y, −x)':'(x, y) → (−y, x)';case'rotate-180':return'(x, y) → (−x, −y)';case'rotate-270':return o.direction==='cw'?'(x, y) → (−y, x)':'(x, y) → (y, −x)';case'translate':return`(x, y) → (x + (${o.dx}), y + (${o.dy}))`;case'dilate':return`(x, y) → (${o.scale}x, ${o.scale}y)`;}
}
export function rotationTrace([x,y]:Point,degrees:number,direction:RotationDirection):Point[]{
 const total=degrees*Math.PI/180*(direction==='cw'?-1:1);
 return Array.from({length:61},(_,i)=>{const a=total*i/60;return[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];});
}
// Place coordinate callouts within the SVG, preferring empty areas around each vertex.
export function placeVertexLabels(items:{text:string;x:number;y:number;image:boolean}[]){
 const boxes:{x:number;y:number;width:number;height:number}[]=[];
 return items.map(item=>{
  const width=Math.min(190,item.text.length*6.4+12),height=23;
  const offsets=item.image?[[14,16],[14,-40],[-width-14,16],[-width-14,-40],[14,40],[-width-14,-64],[30,-12],[-width-30,-12]]:[[-width-14,-40],[-width-14,16],[14,-40],[14,16],[-width-14,-64],[14,40],[-width-30,-12],[30,-12]];
  const candidates=offsets.map(([dx,dy])=>({x:Math.max(5,Math.min(555-width,item.x+dx)),y:Math.max(5,Math.min(555-height,item.y+dy)),width,height}));
  const overlap=(a:typeof candidates[number],b:typeof candidates[number])=>Math.max(0,Math.min(a.x+a.width+3,b.x+b.width+3)-Math.max(a.x-3,b.x-3))*Math.max(0,Math.min(a.y+a.height+3,b.y+b.height+3)-Math.max(a.y-3,b.y-3));
  const cost=(box:typeof candidates[number])=>boxes.reduce((n,b)=>n+overlap(box,b),0)*100+items.reduce((n,p)=>n+(p.x>box.x-7&&p.x<box.x+width+7&&p.y>box.y-7&&p.y<box.y+height+7?10000:0),0);
  const best=candidates.reduce((a,b)=>cost(b)<cost(a)?b:a);boxes.push(best);return{...item,anchorX:item.x,anchorY:item.y,...best};
 });
}
export function graphExtent(points:Point[]){return Math.max(6,Math.ceil(Math.max(...points.flat().map(Math.abs)))+1);}
export function coordinate(n:number){return Math.abs(n)<.000001?'0':String(Number(n.toFixed(2)));}
