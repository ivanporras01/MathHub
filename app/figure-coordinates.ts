import {parseAnswer} from './curriculum';
import type {Point} from './transformation-model';

export type CoordinateDraft=[string,string][];
export type FigureInputResult={ok:true;points:Point[]}|{ok:false;message:string;errors:Record<string,string>};
export const coordinateDraft=(points:Point[]):CoordinateDraft=>points.map(([x,y])=>[String(x),String(y)]);
const cross=(a:Point,b:Point,c:Point)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const EPS=1e-10;
function intersects(a:Point,b:Point,c:Point,d:Point){
 const on=(p:Point,q:Point,r:Point)=>Math.abs(cross(p,q,r))<EPS&&r[0]>=Math.min(p[0],q[0])-EPS&&r[0]<=Math.max(p[0],q[0])+EPS&&r[1]>=Math.min(p[1],q[1])-EPS&&r[1]<=Math.max(p[1],q[1])+EPS;
 const abC=cross(a,b,c),abD=cross(a,b,d),cdA=cross(c,d,a),cdB=cross(c,d,b);
 return ((abC>EPS&&abD< -EPS||abC< -EPS&&abD>EPS)&&(cdA>EPS&&cdB< -EPS||cdA< -EPS&&cdB>EPS))||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);
}
/** Validate the complete draft before replacing the last drawn figure. */
export function readFigureCoordinates(draft:CoordinateDraft):FigureInputResult{
 const fail=(message:string,errors:Record<string,string>={}):FigureInputResult=>({ok:false,message,errors});
 if(draft.length!==1&&(draft.length<3||draft.length>8))return fail('Choose one point or a polygon with 3–8 vertices.');
 const errors:Record<string,string>={},points:Point[]=[];
 draft.forEach((row,i)=>{
  const point:Point=[0,0];
  row.forEach((raw,axis)=>{
   const value=raw.includes(',')?null:parseAnswer(raw),name=`${draft.length===1?'P':String.fromCharCode(65+i)} ${axis===0?'x':'y'}`;
   if(value===null)errors[`${i}-${axis}`]=`Enter ${name} as a number, decimal, or fraction (for example, −2, 1.5, or 1/2).`;
   else if(Math.abs(value)>50)errors[`${i}-${axis}`]=`${name} must be between −50 and 50.`;
   else point[axis]=value===0?0:value;
  });
  points.push(point);
 });
 if(Object.keys(errors).length)return fail('Check the highlighted coordinates. Your last drawn figure has been kept.',errors);
 if(points.length===1)return{ok:true,points};
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)if(Math.hypot(points[i][0]-points[j][0],points[i][1]-points[j][1])<EPS)return fail(`Vertices ${String.fromCharCode(65+i)} and ${String.fromCharCode(65+j)} repeat the same point. Enter each vertex once; the last vertex connects to the first automatically.`);
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
  if(j===i+1||i===0&&j===points.length-1)continue;
  if(intersects(points[i],points[(i+1)%points.length],points[j],points[(j+1)%points.length]))return fail('The polygon edges cross or overlap. Enter the vertices in order around its boundary.');
 }
 const area2=points.reduce((sum,p,i)=>sum+p[0]*points[(i+1)%points.length][1]-p[1]*points[(i+1)%points.length][0],0);
 if(Math.abs(area2)<EPS)return fail('These vertices lie on a line. Move at least one vertex to make a polygon with area.');
 return{ok:true,points};
}
