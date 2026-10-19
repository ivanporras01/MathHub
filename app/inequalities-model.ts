export type InequalitySign='<'|'≤'|'>'|'≥';
export type Point=[number,number];
export type LinearInequality={axis:'x'|'y';m:number;b:number;sign:InequalitySign};
export const SIGNS:InequalitySign[]=['<','≤','>','≥'];
export const EPS=1e-9;
export const inclusive=(s:InequalitySign)=>s==='≤'||s==='≥';
export const greater=(s:InequalitySign)=>s==='>'||s==='≥';
export const reverseSign=(s:InequalitySign):InequalitySign=>({'<':'>','≤':'≥','>':'<','≥':'≤'} as const)[s];
export function compare(left:number,sign:InequalitySign,right:number){const d=left-right;return sign==='<'?d<-EPS:sign==='>'?d>EPS:sign==='≤'?d<=EPS:d>=-EPS;}
export function numberText(n:number):string{
 if(Math.abs(n)<EPS)return '0';
 for(let d=1;d<=512;d++){const numerator=Math.round(n*d);if(Math.abs(n-numerator/d)<EPS)return `${numerator<0?'−':''}${Math.abs(numerator)}${d===1?'':`/${d}`}`;}
 return String(Number(n.toFixed(4))).replace('-','−');
}
export function linearText(m:number,b:number){const term=m===0?'':m===1?'x':m===-1?'−x':`${numberText(m)}x`;return !term?numberText(b):b===0?term:`${term} ${b<0?'−':'+'} ${numberText(Math.abs(b))}`;}
export const inequalityText=(q:LinearInequality)=>`${q.axis} ${q.sign} ${q.axis==='x'?numberText(q.b):linearText(q.m,q.b)}`;
export const boundaryText=(q:LinearInequality)=>`${q.axis} = ${q.axis==='x'?numberText(q.b):linearText(q.m,q.b)}`;
export const values=(q:LinearInequality,[x,y]:Point):[number,number]=>q.axis==='x'?[x,q.b]:[y,q.m*x+q.b];
export function satisfies(q:LinearInequality,p:Point){const [left,right]=values(q,p);return compare(left,q.sign,right);}
export const satisfiesAll=(rules:LinearInequality[],p:Point)=>rules.every(q=>satisfies(q,p));
export const shadeDirection=(q:LinearInequality)=>q.axis==='x'?(greater(q.sign)?'right':'left'):(greater(q.sign)?'above':'below');
// Normalize to ax + by <= c. Strictness is retained independently of the drawing.
export function normal(q:LinearInequality){const k=greater(q.sign)?-1:1;return {a:k*(q.axis==='x'?1:-q.m),b:k*(q.axis==='x'?0:1),c:k*q.b,strict:!inclusive(q.sign)};}
export function clipHalfPlane(polygon:Point[],q:LinearInequality):Point[]{
 const {a,b,c}=normal(q),distance=([x,y]:Point)=>c-a*x-b*y,out:Point[]=[];
 for(let i=0;i<polygon.length;i++){
  const p=polygon[i],next=polygon[(i+1)%polygon.length],dp=distance(p),dn=distance(next),inside=dp>=-EPS,nextInside=dn>=-EPS;
  if(inside)out.push(p);
  if(inside!==nextInside){const t=dp/(dp-dn);out.push([p[0]+t*(next[0]-p[0]),p[1]+t*(next[1]-p[1])]);}
 }
 return out.filter((p,i)=>!i||Math.hypot(p[0]-out[i-1][0],p[1]-out[i-1][1])>EPS);
}
export function regionPolygon(rules:LinearInequality[],extent:number):Point[]{return rules.reduce((p,q)=>clipHalfPlane(p,q),[[-extent,-extent],[extent,-extent],[extent,extent],[-extent,extent]] as Point[]);}
export function boundarySegment(q:LinearInequality,extent:number):Point[]{
 if(q.axis==='x')return Math.abs(q.b)<=extent?[[q.b,-extent],[q.b,extent]]:[];
 const candidates:Point[]=[[-extent,-q.m*extent+q.b],[extent,q.m*extent+q.b]];
 if(q.m!==0)candidates.push([(-extent-q.b)/q.m,-extent],[(extent-q.b)/q.m,extent]);
 return candidates.filter(([x,y])=>Math.abs(x)<=extent+EPS&&Math.abs(y)<=extent+EPS).filter((p,i,all)=>all.findIndex(t=>Math.hypot(p[0]-t[0],p[1]-t[1])<EPS)===i).slice(0,2);
}
type Bound={a:number;c:number;strict:boolean};
function interval(conditions:Bound[]){
 let lo=-Infinity,hi=Infinity,loStrict=false,hiStrict=false;
 for(const {a,c,strict} of conditions){
  if(Math.abs(a)<EPS){if(c<-EPS||(Math.abs(c)<EPS&&strict))return null;continue;}
  const end=c/a;
  if(a>0){if(end<hi-EPS){hi=end;hiStrict=strict;}else if(Math.abs(end-hi)<EPS)hiStrict||=strict;}
  else{if(end>lo+EPS){lo=end;loStrict=strict;}else if(Math.abs(end-lo)<EPS)loStrict||=strict;}
 }
 if(lo>hi+EPS||(Math.abs(lo-hi)<EPS&&(loStrict||hiStrict)))return null;
 const single=Math.abs(lo-hi)<EPS;
 const value=single?lo:!Number.isFinite(lo)&&!Number.isFinite(hi)?0:!Number.isFinite(lo)?hi-1:!Number.isFinite(hi)?lo+1:(lo+hi)/2;
 return {value,single};
}
// Fourier–Motzkin elimination handles unbounded regions, vertical constraints,
// coincident boundaries, strict comparisons, and line/point solution sets.
export function feasibleSet(rules:LinearInequality[]):{kind:'empty'|'region'|'line'|'point';point:Point|null}{
 const normalized=rules.map(normal),lower=normalized.filter(q=>q.b<-EPS),upper=normalized.filter(q=>q.b>EPS);
 const xConditions:Bound[]=normalized.filter(q=>Math.abs(q.b)<EPS).map(q=>({a:q.a,c:q.c,strict:q.strict}));
 for(const l of lower)for(const u of upper)xConditions.push({a:-l.a/l.b+u.a/u.b,c:u.c/u.b-l.c/l.b,strict:l.strict||u.strict});
 const x=interval(xConditions);if(!x)return {kind:'empty',point:null};
 const y=interval(normalized.filter(q=>Math.abs(q.b)>=EPS).map(q=>({a:q.b,c:q.c-q.a*x.value,strict:q.strict})));
 if(!y)return {kind:'empty',point:null};
 const point:Point=[x.value,y.value];
 return {kind:x.single&&y.single?'point':x.single||y.single?'line':'region',point};
}
export function graphExtent(rules:LinearInequality[],point:Point){
 const witness=feasibleSet(rules).point;
 const needed=Math.max(6,...rules.map(q=>Math.abs(q.b)+1),...point.map(Math.abs),...(witness?witness.map(n=>Math.abs(n)+1):[]));
 const tick=Math.max(1,Math.ceil(needed/6));return {extent:tick*6,tick};
}
export const PLANE_PRESETS:{label:string;rule:LinearInequality;point:Point}[]=[
 {label:'Above a dashed line',rule:{axis:'y',m:2,b:1,sign:'>'},point:[0,2]},
 {label:'Include the boundary',rule:{axis:'y',m:2,b:1,sign:'≥'},point:[0,1]},
 {label:'Below a falling line',rule:{axis:'y',m:-1,b:2,sign:'≤'},point:[0,0]},
 {label:'Vertical boundary',rule:{axis:'x',m:0,b:2,sign:'<'},point:[1,0]},
];
export const SYSTEM_PRESETS:{id:string;label:string;rules:LinearInequality[];point:Point;note:string}[]=[
 {id:'overlap',label:'Two half-planes',rules:[{axis:'y',m:1,b:-1,sign:'≥'},{axis:'y',m:-1,b:3,sign:'<'}],point:[0,1],note:'An ordered pair must satisfy BOTH inequalities. The dashed upper boundary is excluded.'},
 {id:'triangle',label:'Three constraints',rules:[{axis:'x',m:0,b:0,sign:'≥'},{axis:'y',m:0,b:0,sign:'≥'},{axis:'y',m:-1,b:6,sign:'≤'}],point:[2,2],note:'x ≥ 0, y ≥ 0, and x + y ≤ 6 form a closed triangle. Nonnegative quantities stay in the first quadrant.'},
 {id:'strip',label:'Parallel strip',rules:[{axis:'y',m:0,b:1,sign:'>'},{axis:'y',m:0,b:4,sign:'≤'}],point:[0,2],note:'The strip extends forever left and right. Its lower boundary is excluded; its upper boundary is included.'},
 {id:'none',label:'No common solutions',rules:[{axis:'y',m:1,b:2,sign:'>'},{axis:'y',m:1,b:-1,sign:'≤'}],point:[0,0],note:'A y-value cannot be above x + 2 and at or below x − 1 at the same time.'},
 {id:'line',label:'Only a boundary',rules:[{axis:'y',m:1,b:1,sign:'≥'},{axis:'y',m:1,b:1,sign:'≤'}],point:[0,1],note:'Both inclusive inequalities force equality. The solution is the entire line y = x + 1, not a shaded area.'},
 {id:'strict',label:'Strict boundary clash',rules:[{axis:'y',m:1,b:1,sign:'>'},{axis:'y',m:1,b:1,sign:'≤'}],point:[0,1],note:'These regions touch, but the first inequality excludes the shared boundary. There is no solution.'},
];
