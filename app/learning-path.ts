import data from './learning-path-data.json';
import {TOPICS,type Grade,type Topic} from './curriculum';
/** Presentation-only sequence. Do NOT reorder TOPICS; its indices seed existing questions. */
export type CourseStage={id:string;title:string;summary:string;topics:Topic[];focusTopics:Topic[]};
const byId=new Map(TOPICS.map(t=>[t.id,t]));
export function courseStages(grade:Grade):CourseStage[]{
 const stages=data[String(grade) as keyof typeof data] as {id:string;title:string;summary:string;topics:string[];focus?:string[]}[];
 return stages.map(s=>({id:s.id,title:s.title,summary:s.summary,topics:s.topics.map(id=>byId.get(id)!),focusTopics:(s.focus||[]).map(id=>byId.get(id)!)}));
}
export function orderedCourseTopics(grade:Grade):Topic[]{return courseStages(grade).flatMap(s=>[...s.topics,...s.focusTopics]);}
