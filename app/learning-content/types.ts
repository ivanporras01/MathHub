export type LearningCheck = {
  question: string;
  options: [string, string][];
  correct: number;
};
export type LearningContent = {
  goal: string;
  ready: string;
  vocabulary: [string, string][];
  reasoning: [string, string][];
  example: { question: string; steps: [string, string][] };
  check: LearningCheck;
  investigate: [string, string];
};
// Every entry is authored for its topic; there is deliberately no generic fallback.
export function lesson(goal:string,ready:string,vocabulary:[string,string][],reasoning:[string,string][],question:string,steps:[string,string][],check:LearningCheck,investigate:[string,string]):LearningContent {
  return {goal,ready,vocabulary,reasoning,example:{question,steps},check,investigate};
}
