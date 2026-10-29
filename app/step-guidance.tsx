import type {Step,Topic} from './curriculum';
import './step-guidance.css';

/** Explains the original questions without changing stored answers or question IDs. */
const generic=/^Follow the same operation on the numbers shown\.?$/i;
const stop=new Set(['the','and','with','for','from','your','this','that','then','into','each','both','step','value','values','numbers','number','find','write','work','using','use','give','take']);
const words=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(word=>word.length>2&&!stop.has(word));
export function connectedRule(topic:Topic,step:Step,index:number):string{
 const context=new Set(words(step.title+' '+step.text));
 const sorted=topic.rules.map((rule,i)=>({rule,i,score:words(rule).reduce((total,word)=>total+(context.has(word)?1:0),0)})).sort((a,b)=>b.score-a.score||a.i-b.i);
 return sorted[0]?.score?sorted[0].rule:topic.rules[Math.min(index,topic.rules.length-1)]||topic.idea;
}
export function clearStepReason(topic:Topic,step:Step,index:number):string{
 const text=step.text?.trim()||'';
 return text&&!generic.test(text)?text:connectedRule(topic,step,index);
}
export function StepGuidance({topic,step,index,showPitfall=false}:{topic:Topic;step:Step;index:number;showPitfall?:boolean}){
 const reason=clearStepReason(topic,step,index),rule=connectedRule(topic,step,index);
 return <div className="step-guidance" aria-label={'Explanation for '+step.title}>
  <div><span className="step-guide-heading"><b>WHY THIS STEP WORKS</b></span><p>{reason}</p></div>
  {reason!==rule&&<div><span className="step-guide-heading"><b>RULE TO REMEMBER</b></span><p>{rule}</p></div>}
  {showPitfall&&<div className="step-guide-pitfall"><span className="step-guide-heading"><b>AVOID THIS MISTAKE</b></span><p>{topic.mistake}</p></div>}
 </div>;
}
