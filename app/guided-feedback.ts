import {parseAnswer,type Topic} from './curriculum';

export function guideMathAttempt(topic:Topic, answer:string, attempts:number){
 const value=parseAnswer(answer);
 if(value===null) return {title:'Check the answer format',tip:'Enter a number, fraction, mixed number, or decimal. Include units only if the question asks for them.',step:'Rewrite the answer as a number and check again.'};
 const rule=topic.rules[Math.min(attempts-1,topic.rules.length-1)]||topic.idea;
 return {
  title:attempts>1?'Let’s change the approach':'Find the first step',
  tip:attempts>1?topic.mistake:rule,
  step:attempts>1?'Read the hint, then try a fresh calculation. The answer can still count as correct practice.':'Write down the quantities in the question and identify the operation before calculating.'
 };
}
