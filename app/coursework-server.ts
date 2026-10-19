import {COURSE_IDS,topicById,type Grade} from './curriculum';
import {taskSummary,type Assignment,type Work,type AssignmentOverview} from './coursework';
import type {ProgressMap} from './ui';

export class CourseworkError extends Error{constructor(message:string,public status=400){super(message);}}
export function assignmentId(value:unknown):string|null{
 if(value===undefined||value===null||value==='')return null;
 if(typeof value!=='string'||!/^[-a-zA-Z0-9]{1,80}$/.test(value))throw new CourseworkError('Choose a valid assignment.');
 return value;
}
export function createCourseworkStore(DB:Pick<D1Database,'prepare'|'batch'>){
 const clean=(value:unknown)=>typeof value==='string'?value.normalize('NFKC').trim():'';
 const text=(value:unknown,max:number,label:string,required=true)=>{const valueText=clean(value);if((required&&!valueText)||valueText.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(valueText))throw new CourseworkError(`Enter ${label}, up to ${max} characters.`);return valueText;};
 const rows=async(sql:string,...args:(string|number|null)[])=> (await DB.prepare(sql).bind(...args).all<any>()).results;
 const emptyWork=():Work=>({progress:{},startedAt:null,completedAt:null,updatedAt:null});
 function due(value:unknown){if(value===undefined||value===null||value==='')return null;if(typeof value!=='number'||!Number.isSafeInteger(value)||value<946684800000||value>4102444800000)throw new CourseworkError('Choose a valid due date and time.');return value;}
 async function findClass(id:unknown,allowArchived=false){const value=assignmentId(id);const c=await DB.prepare('SELECT * FROM classrooms WHERE id=?').bind(value).first<any>();if(!c||(!allowArchived&&c.archived))throw new CourseworkError('This class is not available.',404);return c;}
 async function getAssignment(id:unknown):Promise<Assignment>{
  const value=assignmentId(id),a=await DB.prepare('SELECT a.*,c.name class_name FROM assignments a JOIN classrooms c ON c.id=a.class_id WHERE a.id=?').bind(value).first<any>();
  if(!a)throw new CourseworkError('This assignment is not available.',404);
  const topics=await rows('SELECT topic_id FROM assignment_topics WHERE assignment_id=? ORDER BY position',a.id);
  return {id:a.id,classId:a.class_id,className:a.class_name,title:a.title,instructions:a.instructions,dueAt:a.due_at,goal:a.goal,topicIds:topics.map(t=>t.topic_id),archived:!!a.archived,createdAt:a.created_at};
 }
 async function access(studentId:string,id:unknown,topicId?:string){
  const aid=assignmentId(id);if(!aid)return null;
  const allowed=await DB.prepare('SELECT a.id FROM assignments a JOIN classrooms c ON c.id=a.class_id JOIN class_members m ON m.class_id=c.id AND m.student_id=? AND m.active=1 WHERE a.id=? AND a.archived=0 AND c.archived=0').bind(studentId,aid).first();
  if(!allowed)throw new CourseworkError('This assignment is closed or not assigned to your class. Return to My assignments.',404);
  const a=await getAssignment(aid);
  if(topicId&&!a.topicIds.includes(topicId))throw new CourseworkError('This topic is not part of the assignment.');
  return a;
 }
 async function classFromCode(value:unknown){
  if(value===undefined||value===null||value==='')return null;
  if(typeof value!=='string')throw new CourseworkError('Enter a valid class code.');
  const code=value.toUpperCase().replace(/[\s-]/g,'');
  if(!/^MH[A-Z2-9]{8}$/.test(code))throw new CourseworkError('Check the class code provided by Mr. Porras.');
  const c=await DB.prepare('SELECT id,name FROM classrooms WHERE join_code=? AND archived=0').bind(code).first<any>();
  if(!c)throw new CourseworkError('That class code is not available. Check it with Mr. Porras.');
  return c;
 }
 async function enroll(studentId:string,classId:string){await DB.prepare('INSERT INTO class_members(class_id,student_id,active,joined_at) VALUES(?,?,1,?) ON CONFLICT(class_id,student_id) DO UPDATE SET active=1').bind(classId,studentId,Date.now()).run();}
 async function start(studentId:string,id:string){const now=Date.now();await DB.prepare('INSERT INTO assignment_work(assignment_id,student_id,started_at,updated_at) VALUES(?,?,?,?) ON CONFLICT(assignment_id,student_id) DO UPDATE SET updated_at=excluded.updated_at').bind(id,studentId,now,now).run();}
 async function allWork(id:string,studentId?:string):Promise<Record<string,Work>>{
  const params=studentId?[id,studentId]:[id],filter=studentId?' AND student_id=?':'';
  const result=await DB.batch([
   DB.prepare('SELECT * FROM assignment_work WHERE assignment_id=?'+filter).bind(...params),
   DB.prepare('SELECT * FROM assignment_progress WHERE assignment_id=?'+filter).bind(...params),
   DB.prepare('SELECT student_id,topic_id,SUM(attempts) attempts,SUM(correct) correct,SUM(independent) independent,SUM(hint_used) hints,MAX(updated_at) updated_at FROM questions WHERE assignment_id=?'+filter+' GROUP BY student_id,topic_id').bind(...params),
  ]);
  const work:Record<string,Work>={};
  for(const row of result[0].results as any[])work[row.student_id]={progress:{},startedAt:row.started_at,completedAt:row.completed_at,updatedAt:row.updated_at};
  for(const row of result[1].results as any[]){const w=work[row.student_id]??=emptyWork();w.progress[row.topic_id]={learned:!!row.learned,guided:!!row.guided,attempts:0,correct:0,independent:0,hints:0,updatedAt:row.updated_at};}
  for(const row of result[2].results as any[]){const w=work[row.student_id]??=emptyWork();w.progress[row.topic_id]={learned:false,guided:false,...w.progress[row.topic_id],attempts:row.attempts||0,correct:row.correct||0,independent:row.independent||0,hints:row.hints||0,updatedAt:row.updated_at};}
  return work;
 }
 async function sync(studentId:string,a:Assignment|null):Promise<ProgressMap|undefined>{
  if(!a)return undefined;
  await start(studentId,a.id);
  const w=(await allWork(a.id,studentId))[studentId]||emptyWork();
  if(taskSummary(a,w).complete&&!w.completedAt)await DB.prepare('UPDATE assignment_work SET completed_at=? WHERE assignment_id=? AND student_id=? AND completed_at IS NULL').bind(Date.now(),a.id,studentId).run();
  return w.progress;
 }
 async function studentOverview(studentId:string){
  const classes=await rows('SELECT c.id,c.name,c.course FROM classrooms c JOIN class_members m ON m.class_id=c.id WHERE m.student_id=? AND m.active=1 AND c.archived=0 ORDER BY c.name',studentId);
  const assigned=await rows('SELECT a.id FROM assignments a JOIN classrooms c ON c.id=a.class_id JOIN class_members m ON m.class_id=c.id WHERE m.student_id=? AND m.active=1 AND c.archived=0 ORDER BY a.due_at IS NULL,a.due_at,a.created_at DESC',studentId);
  const assignments=[];
  for(const item of assigned){const a=await getAssignment(item.id);const work=(await allWork(a.id,studentId))[studentId]||emptyWork();assignments.push({...a,...work});}
  return {classes,assignments};
 }
 async function teacherOverview(){
  const classes=await rows('SELECT * FROM classrooms ORDER BY archived,name'),members=await rows('SELECT class_id,student_id FROM class_members WHERE active=1'),list=await rows('SELECT a.*,c.name class_name FROM assignments a JOIN classrooms c ON c.id=a.class_id ORDER BY a.archived,a.created_at DESC');
  const topics=await rows('SELECT * FROM assignment_topics ORDER BY position');
  const counts=await rows('SELECT w.assignment_id,COUNT(*) started_count,SUM(CASE WHEN w.completed_at IS NOT NULL THEN 1 ELSE 0 END) completed_count FROM assignment_work w JOIN assignments a ON a.id=w.assignment_id JOIN class_members m ON m.class_id=a.class_id AND m.student_id=w.student_id AND m.active=1 GROUP BY w.assignment_id');
  const help=await rows('SELECT help_assignment_id,COUNT(*) n FROM students WHERE help_requested=1 AND help_assignment_id IS NOT NULL GROUP BY help_assignment_id');
  const assignments:AssignmentOverview[]=list.map(a=>{const count=counts.find(c=>c.assignment_id===a.id);return {id:a.id,classId:a.class_id,className:a.class_name,title:a.title,instructions:a.instructions,dueAt:a.due_at,goal:a.goal,topicIds:topics.filter(t=>t.assignment_id===a.id).map(t=>t.topic_id),archived:!!a.archived,createdAt:a.created_at,studentCount:members.filter(m=>m.class_id===a.class_id).length,startedCount:count?.started_count||0,completedCount:count?.completed_count||0,helpCount:help.find(h=>h.help_assignment_id===a.id)?.n||0};});
  return {classes:classes.map(c=>({id:c.id,name:c.name,course:c.course,joinCode:c.join_code,archived:!!c.archived,studentIds:members.filter(m=>m.class_id===c.id).map(m=>m.student_id)})),assignments};
 }
 async function report(id:unknown){
  const a=await getAssignment(id),members=await rows('SELECT student_id,active FROM class_members WHERE class_id=?',a.classId),work=await allWork(a.id);
  return {assignment:a,students:members.filter(m=>m.active||work[m.student_id]).map(m=>({id:m.student_id,enrolled:!!m.active,...(work[m.student_id]||emptyWork())}))};
 }
 async function teacherAction(action:string,body:any){
  const now=Date.now();
  if(action==='class-create'){
   const name=text(body.name,100,'a class name');if(!COURSE_IDS.includes(body.course))throw new CourseworkError('Choose a course for this class.');
   const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',code='MH'+Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>alphabet[n%32]).join(''),id=crypto.randomUUID();
   await DB.prepare('INSERT INTO classrooms(id,name,course,join_code,created_at) VALUES(?,?,?,?,?)').bind(id,name,body.course,code,now).run();return {ok:true,classId:id};
  }
  if(action==='class-update'){
   const c=await findClass(body.classId,true),name=text(body.name,100,'a class name');if(!COURSE_IDS.includes(body.course))throw new CourseworkError('Choose a course.');
   await DB.prepare('UPDATE classrooms SET name=?,course=? WHERE id=?').bind(name,body.course,c.id).run();return {ok:true};
  }
  if(action==='class-archive'){
   const c=await findClass(body.classId,true);if(typeof body.archived!=='boolean')throw new CourseworkError('Choose whether to archive this class.');
   await DB.prepare('UPDATE classrooms SET archived=? WHERE id=?').bind(body.archived?1:0,c.id).run();return {ok:true};
  }
  if(action==='class-members'){
   const c=await findClass(body.classId);
   if(!Array.isArray(body.studentIds)||!body.studentIds.length||body.studentIds.length>250||body.studentIds.some((s:unknown)=>typeof s!=='string'||s.length>80)||typeof body.enroll!=='boolean')throw new CourseworkError('Choose between 1 and 250 registered students.');
   const ids=[...new Set(body.studentIds)] as string[],found=await rows(`SELECT id FROM students WHERE id IN (${ids.map(()=>'?').join(',')})`,...ids);
   if(found.length!==ids.length)throw new CourseworkError('A selected student is no longer available. Refresh the roster.');
   await DB.batch(ids.map(id=>body.enroll?DB.prepare('INSERT INTO class_members(class_id,student_id,active,joined_at) VALUES(?,?,1,?) ON CONFLICT(class_id,student_id) DO UPDATE SET active=1').bind(c.id,id,now):DB.prepare('UPDATE class_members SET active=0 WHERE class_id=? AND student_id=?').bind(c.id,id)));
   return {ok:true};
  }
  if(action==='assignment-create'){
   const c=await findClass(body.classId),title=text(body.title,120,'an assignment title'),instructions=text(body.instructions,1500,'instructions',false),dueAt=due(body.dueAt);
   if(!Number.isInteger(body.goal)||body.goal<1||body.goal>20)throw new CourseworkError('Choose 1–20 independent answers per topic.');
   if(!Array.isArray(body.topicIds)||!body.topicIds.length||body.topicIds.length>72||body.topicIds.some((t:unknown)=>typeof t!=='string'||!topicById(t)))throw new CourseworkError('Choose at least one valid topic.');
   const topicIds=[...new Set(body.topicIds)] as string[],id=crypto.randomUUID();
   await DB.batch([DB.prepare('INSERT INTO assignments(id,class_id,title,instructions,due_at,goal,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,c.id,title,instructions,dueAt,body.goal,now),...topicIds.map((topic,i)=>DB.prepare('INSERT INTO assignment_topics(assignment_id,topic_id,position) VALUES(?,?,?)').bind(id,topic,i))]);
   return {ok:true,assignmentId:id};
  }
  if(action==='assignment-update'){
   const a=await getAssignment(body.assignmentId),title=text(body.title,120,'an assignment title'),instructions=text(body.instructions,1500,'instructions',false),dueAt=due(body.dueAt);
   await DB.prepare('UPDATE assignments SET title=?,instructions=?,due_at=? WHERE id=?').bind(title,instructions,dueAt,a.id).run();return {ok:true};
  }
  if(action==='assignment-archive'){
   const a=await getAssignment(body.assignmentId);if(typeof body.archived!=='boolean')throw new CourseworkError('Choose whether to archive this assignment.');
   await DB.prepare('UPDATE assignments SET archived=? WHERE id=?').bind(body.archived?1:0,a.id).run();return {ok:true};
  }
  throw new CourseworkError('Action not found.',404);
 }
 return {access,getAssignment,classFromCode,enroll,start,sync,allWork,studentOverview,teacherOverview,report,teacherAction};
}
