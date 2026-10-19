import assert from 'node:assert/strict';
const normalize=s=>(s||'').replaceAll('−','-');
const nums=s=>normalize(s).replace(/-\s+(?=\d)/g,'-').match(/-?\d+(?:\.\d+)?/g)?.map(Number)||[];
const compare=(a,s,b)=>s==='<'?a<b:s==='>'?a>b:s==='≤'?a<=b:a>=b;
function lines(expression){return normalize(expression).split(';').map(part=>{const m=part.trim().match(/^y ([<>≤≥]) (-?\d+)x ([+-]) (\d+)$/);assert.ok(m,part);return {op:m[1],m:Number(m[2]),b:Number(m[4])*(m[3]==='-'?-1:1)};});}
export function inequalityOracle(q){
 const p=nums(q.prompt),e=nums(q.expression);
 if(q.prompt.includes('boundary is x = k')||q.prompt==='The solution is x < k. What is k?')return (e[2]-e[1])/e[0]||0;
 const qs=lines(q.expression);
 if(q.prompt.includes('boundary line'))return qs[0].m*p[0]+qs[0].b;
 if(q.prompt.includes('INTEGER')){
  // Independently enumerate candidate integers instead of using endpoint formulas.
  let total=0;for(let y=-100;y<=100;y++)if(qs.every(c=>compare(y,c.op,c.m*p[0]+c.b)))total++;return total;
 }
 return qs.every(c=>compare(p[1],c.op,c.m*p[0]+c.b))?1:0;
}
