import {useId} from 'react';
export type GraphPoint={x:number;y:number;label?:string;open?:boolean};
export function sampleGraph(fn:(x:number)=>number,xmin:number,xmax:number,breaks:number[]=[],samples=800){
 const cuts=[xmin,...breaks.filter(n=>n>xmin&&n<xmax).sort((a,b)=>a-b),xmax];
 return cuts.slice(0,-1).map((start,i)=>Array.from({length:samples+1},(_,j)=>{
  const end=cuts[i+1],epsilon=(xmax-xmin)*1e-6,x=(i>0?start+epsilon:start)+(end-start-(i>0?epsilon:0)-(i<cuts.length-2?epsilon:0))*j/samples;
  return [x,fn(x)] as [number,number];
 }).filter(p=>p.every(Number.isFinite)));
}
export default function FunctionGraph({fn,breaks=[],points=[],vertical,verticals=[],horizontal,parentFn,parentBreaks=[],asymptoteFn,symmetry,showCurve=true,title,xmin=-10,xmax=10,ymin=-10,ymax=10}:{fn:(x:number)=>number;breaks?:number[];points?:GraphPoint[];vertical?:number;verticals?:number[];horizontal?:number;parentFn?:(x:number)=>number;parentBreaks?:number[];asymptoteFn?:(x:number)=>number;symmetry?:number;showCurve?:boolean;title:string;xmin?:number;xmax?:number;ymin?:number;ymax?:number}){
 const id=useId().replaceAll(':',''),size=520,pad=38,span=size-pad*2,X=(x:number)=>pad+(x-xmin)/(xmax-xmin)*span,Y=(y:number)=>size-pad-(y-ymin)/(ymax-ymin)*span;
 const step=(xmax-xmin)>24?4:2,xs=Array.from({length:Math.floor((xmax-xmin)/step)+1},(_,i)=>xmin+i*step),ys=Array.from({length:Math.floor((ymax-ymin)/step)+1},(_,i)=>ymin+i*step);
 const makePaths=(f:(x:number)=>number,cuts:number[]=[])=>sampleGraph(f,xmin,xmax,cuts).map(segment=>{let drawing=false;return segment.map(([x,y])=>{if(y<ymin-1||y>ymax+1){drawing=false;return '';}const next=(drawing?'L':'M')+X(x).toFixed(2)+' '+Y(y).toFixed(2);drawing=true;return next;}).join(' ');});
 const paths=makePaths(fn,breaks),poles=[...new Set([...verticals,...(vertical===undefined?[]:[vertical])])];
 const visiblePoints=points.filter(p=>p.x>=xmin&&p.x<=xmax&&p.y>=ymin&&p.y<=ymax);
 const boxes:{x:number;y:number;w:number;h:number}[]=[];
 const labels=visiblePoints.map(p=>{
  const width=(p.label?.length||0)*7.1,height=16;
  const candidates=[[9,-12,0],[9,21,0],[-9,-12,1],[-9,21,1],[9,-34,0],[-9,-34,1],[9,40,0],[-9,40,1]];
  const chosen=candidates.find(([dx,dy,end])=>{const x=X(p.x)+dx-(end?width:0),y=Y(p.y)+dy-height;return x>=pad+2&&x+width<=size-pad-2&&y>=pad+2&&y+height<=size-pad-2&&!boxes.some(b=>x<b.x+b.w+4&&x+width+4>b.x&&y<b.y+b.h+3&&y+height+3>b.y);})||[p.x>xmax-4?-10:9,p.y>ymax-2?20:-12,p.x>xmax-4?1:0];
  const [dx,dy,end]=chosen;
  if(p.label)boxes.push({x:X(p.x)+dx-(end?width:0),y:Y(p.y)+dy-height,w:width,h:height});
  return {x:X(p.x)+dx,y:Y(p.y)+dy,anchor:end?'end' as const:'start' as const};
 });
 return <svg viewBox={'0 0 '+size+' '+size} className="am-function-graph" role="img" aria-labelledby={id+'title'}><title id={id+'title'}>{title}</title><defs><clipPath id={id+'clip'}><rect x={pad} y={pad} width={span} height={span}/></clipPath></defs>
 <rect x={pad} y={pad} width={span} height={span} className="am-graph-paper"/>
 {xs.map(x=><g key={'x'+x}><path d={'M'+X(x)+' '+pad+'V'+(size-pad)} className="am-grid"/>{x!==0&&<text x={X(x)} y={Y(0)+17} textAnchor="middle">{x}</text>}</g>)}
 {ys.map(y=><g key={'y'+y}><path d={'M'+pad+' '+Y(y)+'H'+(size-pad)} className="am-grid"/>{y!==0&&<text x={X(0)-8} y={Y(y)+4} textAnchor="end">{y}</text>}</g>)}
 <path d={'M'+pad+' '+Y(0)+'H'+(size-pad)+'M'+X(0)+' '+pad+'V'+(size-pad)} className="am-axis"/><text x={size-pad+12} y={Y(0)+4}>x</text><text x={X(0)-4} y={pad-13}>y</text>
 <g clipPath={'url(#'+id+'clip)'}>{poles.map(x=><path key={x} d={'M'+X(x)+' '+pad+'V'+(size-pad)} className="am-graph-asymptote"/>)}{horizontal!==undefined&&<path d={'M'+pad+' '+Y(horizontal)+'H'+(size-pad)} className="am-graph-asymptote"/>}
 {symmetry!==undefined&&<path d={'M'+X(symmetry)+' '+pad+'V'+(size-pad)} className="fs-symmetry-line"/>}
 {asymptoteFn&&makePaths(asymptoteFn).map((d,i)=><path key={'a'+i} d={d} className="am-graph-asymptote"/>)}
 {parentFn&&makePaths(parentFn,parentBreaks).map((d,i)=><path key={'p'+i} d={d} className="fs-parent-curve"/>)}
 {showCurve&&paths.map((d,i)=><path key={i} d={d} className="am-graph-curve"/>)}
 {visiblePoints.map((p,i)=><g key={i}><circle cx={X(p.x)} cy={Y(p.y)} r={p.open?6:4.5} className={p.open?'am-graph-hole':'am-graph-point'}/>{p.label&&<text className="am-graph-label" x={labels[i].x} y={labels[i].y} textAnchor={labels[i].anchor}>{p.label}</text>}</g>)}</g></svg>;
}
