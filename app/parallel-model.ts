export type PairKind='corresponding'|'alternate-interior'|'alternate-exterior'|'same-side-interior'|'vertical'|'linear';
export const ANGLE_PAIRS:Record<PairKind,{label:string;pairs:[string,string][];rule:string;why:string;parallelOnly:boolean;sum:boolean}>={
 corresponding:{label:'Corresponding',pairs:[['a','e'],['b','f'],['c','g'],['d','h']],rule:'Matching corners are equal when the lines are parallel.',why:'A translation along the transversal carries one intersection to the other when the crossed lines are parallel, preserving corresponding angle measures.',parallelOnly:true,sum:false},
 'alternate-interior':{label:'Alternate interior',pairs:[['c','e'],['d','f']],rule:'Inside the two lines, on opposite sides of the transversal: equal for parallel lines.',why:'A corresponding angle equals its partner for parallel lines. Its vertical opposite has the same measure, giving the alternate interior relationship.',parallelOnly:true,sum:false},
 'alternate-exterior':{label:'Alternate exterior',pairs:[['a','g'],['b','h']],rule:'Outside the two lines, on opposite sides of the transversal: equal for parallel lines.',why:'Combine corresponding-angle equality with vertical-angle equality. The parallel condition is needed to connect the two intersections.',parallelOnly:true,sum:false},
 'same-side-interior':{label:'Same-side interior',pairs:[['c','f'],['d','e']],rule:'Inside the two lines, on the same side of the transversal: supplementary for parallel lines.',why:'One angle equals the corresponding angle at the other intersection; that angle and the interior partner form a 180° linear pair.',parallelOnly:true,sum:true},
 vertical:{label:'Vertical angles',pairs:[['a','c'],['b','d'],['e','g'],['f','h']],rule:'Opposite angles at one intersection are always equal.',why:'Each is supplementary to the same neighboring angle. Subtract that neighbor from 180° to obtain equal measures. Parallel lines are not required.',parallelOnly:false,sum:false},
 linear:{label:'Linear pairs',pairs:[['a','b'],['b','c'],['c','d'],['d','a'],['e','f'],['f','g'],['g','h'],['h','e']],rule:'Adjacent angles on a straight line always sum to 180°.',why:'The noncommon sides form opposite rays, making a straight angle. Parallel lines are not required.',parallelOnly:false,sum:true},
};
export function angleMeasures(theta:number,tilt:number):Record<string,number>{
 const lower=theta-tilt;
 return {a:theta,b:180-theta,c:theta,d:180-theta,e:lower,f:180-lower,g:lower,h:180-lower};
}
export function parallelIntersections(theta:number,tilt:number){
 const t=theta*Math.PI/180,p=tilt*Math.PI/180;
 const s=-70/(Math.sin(t)-Math.cos(t)*Math.tan(p));
 return [[300+70*Math.cos(t)/Math.sin(t),130],[300+s*Math.cos(t),200-s*Math.sin(t)]] as [number,number][];
}
