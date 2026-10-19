import type {Grade} from './curriculum';
import type {Progress,ProgressMap} from './ui';

export type Classroom={id:string;name:string;course:Grade;joinCode:string;archived:boolean;studentIds:string[]};
export type Assignment={id:string;classId:string;className:string;title:string;instructions:string;dueAt:number|null;goal:number;topicIds:string[];archived:boolean;createdAt:number};
export type Work={progress:ProgressMap;startedAt:number|null;completedAt:number|null;updatedAt:number|null};
export type StudentAssignment=Assignment&Work;
export type AssignmentOverview=Assignment&{studentCount:number;startedCount:number;completedCount:number;helpCount:number};
export type AssignmentReport={assignment:Assignment;students:(Work&{id:string;enrolled:boolean})[]};
export type CourseworkOverview={classes:Classroom[];assignments:AssignmentOverview[]};
export type StudentCoursework={classes:Pick<Classroom,'id'|'name'|'course'>[];assignments:StudentAssignment[]};

export function taskTopicDone(p:Progress|undefined,goal:number){return !!p?.learned&&!!p?.guided&&(p?.independent||0)>=goal;}
export function taskTopicPercent(p:Progress|undefined,goal:number){return Math.min(100,(p?.learned?10:0)+(p?.guided?15:0)+Math.min(goal,p?.independent||0)/goal*75);}
export function taskSummary(task:Assignment,work:Partial<Work>,now=Date.now()){
 const progress=work.progress||{},done=task.topicIds.filter(id=>taskTopicDone(progress[id],task.goal)).length;
 const complete=task.topicIds.length>0&&done===task.topicIds.length;
 const percent=task.topicIds.length?Math.round(task.topicIds.reduce((n,id)=>n+taskTopicPercent(progress[id],task.goal),0)/task.topicIds.length):0;
 const status=complete?(task.dueAt&&work.completedAt&&work.completedAt>task.dueAt?'Completed late':'Completed'):task.dueAt&&now>task.dueAt?'Overdue':work.startedAt?'In progress':'Not started';
 return {done,complete,percent,status};
}
export function dueLabel(time:number|null){return time?new Date(time).toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'No due date';}
