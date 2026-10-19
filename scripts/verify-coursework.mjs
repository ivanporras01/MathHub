import assert from 'node:assert/strict';

// Shared API contract exercised against both adapters and the real SQLite Worker.
// All identities and classes here exist only in disposable local test databases.
export async function verifyCoursework(call,teacherCookie){
 const teacher=(action,body)=>call(action,body,teacherCookie);
 const ok=async(action,body,cookie)=>{const r=await call(action,body,cookie);assert.equal(r.status,200,`${action}: ${JSON.stringify(r.data)}`);return r.data;};
 const createClass=async(name)=>{const r=await ok('class-create',{name,course:7},teacherCookie);return (await teacher('teacher-coursework')).data.classes.find(c=>c.id===r.classId);};
 const room=await createClass('Verification · Equations'),otherRoom=await createClass('Verification · Other class');
 assert.match(room.joinCode,/^MH[A-Z2-9]{8}$/);
 assert.notEqual(room.joinCode,otherRoom.joinCode);
 assert.equal((await call('teacher-coursework')).status,401);
 assert.equal((await call('class-create',{name:'Unauthorized',course:7})).status,401);
 assert.equal((await teacher('class-create',{name:'',course:7})).status,400);
 assert.equal((await teacher('class-create',{name:'Wrong course',course:100})).status,400);
 assert.equal((await call('class-create',{name:'Cross-site',course:7},teacherCookie,{Origin:'https://evil.test'})).status,403);
 const person={firstName:'Coursework',lastName:'Learner',mode:'new',schoolGrade:'7',schoolName:'Test School',email:'fixture@example.test',emailType:'student',grade:7};
 assert.equal((await call('join',{...person,classCode:'BAD'})).status,400);
 assert.equal((await call('join',{firstName:person.firstName,lastName:person.lastName,mode:'returning'})).status,404,'invalid code must not create a profile');
 const student=await call('join',{...person,classCode:room.joinCode.toLowerCase()});assert.equal(student.status,200);
 const outsider=await call('join',{firstName:'Coursework',lastName:'Outsider',grade:7});assert.equal(outsider.status,200);
 const ck=student.cookie,id=student.data.student.id,foreign=outsider.cookie,foreignId=outsider.data.student.id;
 const mine=()=>ok('assignments',undefined,ck);
 assert.equal((await mine()).classes[0].id,room.id);
 assert.equal((await mine()).classes[0].joinCode,undefined);
 assert.deepEqual((await mine()).assignments,[]);
 assert.equal((await call('teacher-coursework',undefined,ck)).status,401);
 assert.equal((await call('class-members',{classId:room.id,studentIds:[foreignId],enroll:true},ck)).status,401);
 assert.equal((await teacher('class-members',{classId:room.id,studentIds:[id,'missing'],enroll:false})).status,400);
 assert.equal((await mine()).classes.length,1,'invalid member batch cannot partly unenroll');
 await ok('class-join',{classCode:room.joinCode},ck);
 assert.equal((await mine()).classes.length,1,'joining again is idempotent');

 const topicId='7-equations';
 const next=async(assignmentId,extra={})=>{
  const r=await ok('question',{topicId,assignmentId,fresh:true,...extra},ck);
  const q=r.question;assert.equal(q.answer,undefined);assert.equal(q.steps,undefined);
  const n=q.expression.replaceAll('−','-').match(/-?\d+(?:\.\d+)?/g).map(Number);
  return {questionId:q.id,assignmentId,answer:String((n[2]-n[1])/n[0])};
 };
 for(const stage of ['learn','guided'])await ok('lesson',{topicId,stage},ck);
 for(let i=0;i<5;i++)assert.equal((await ok('answer',await next(),ck)).independent,true);
 assert.equal((await ok('session',undefined,ck)).progress[topicId].independent,5);
 const createTask=async(title,classId=room.id,topics=[topicId],goal=2)=>{
  const r=await ok('assignment-create',{classId,title,instructions:'Show your reasoning.',goal,topicIds:topics,dueAt:Date.now()-60000},teacherCookie);return r.assignmentId;
 };
 assert.equal((await teacher('assignment-create',{classId:room.id,title:'Invalid',goal:0,topicIds:[topicId]})).status,400);
 assert.equal((await teacher('assignment-create',{classId:room.id,title:'Invalid',goal:2,topicIds:['missing']})).status,400);
 const a=await createTask('Verification Task A'),b=await createTask('Verification Task B'),hidden=await createTask('Other class task',otherRoom.id);
 assert.deepEqual((await mine()).assignments.map(a=>a.id).sort(),[a,b].sort());
 assert.deepEqual((await ok('assignments',undefined,foreign)).assignments,[]);
 assert.equal((await call('assignment-start',{assignmentId:a,topicId},foreign)).status,404);
 assert.equal((await call('assignment-start',{assignmentId:hidden,topicId},ck)).status,404);
 assert.equal((await call('assignment-start',{assignmentId:a,topicId:'6-order'},ck)).status,400);
 assert.equal((await call('assignment-start',{assignmentId:[]},ck)).status,400);
 const started=await ok('assignment-start',{assignmentId:a,topicId},ck);
 assert.deepEqual(started.assignmentProgress,{},'previous free-practice mastery never completes a new assignment');
 assert.equal((await call(`teacher-assignment?id=${a}`,undefined,ck)).status,401);
 const report=async()=>await ok(`teacher-assignment?id=${a}`,undefined,teacherCookie);
 assert.equal((await report()).students.length,1);
 assert.equal((await report()).students[0].id,id);
 assert.equal((await report()).students[0].completedAt,null);

 const qa=await next(a),qb=await next(b),qfree=await next();
 assert.equal(new Set([qa.questionId,qb.questionId,qfree.questionId]).size,3);
 assert.equal((await ok('question',{assignmentId:a,topicId},ck)).question.id,qa.questionId);
 assert.equal((await ok('question',{assignmentId:b,topicId},ck)).question.id,qb.questionId);
 assert.equal((await ok('question',{topicId},ck)).question.id,qfree.questionId);
 for(const action of ['answer','hint','solution']){
  assert.equal((await call(action,{...qa,assignmentId:b},ck)).status,400,action+' cannot transfer credit to another task');
  assert.equal((await call(action,{...qa,assignmentId:null},ck)).status,400);
  assert.equal((await call(action,qa,foreign)).status,404);
 }
 let result=await ok('answer',qa,ck);assert.equal(result.independent,true);assert.equal(result.assignmentProgress[topicId].independent,1);
 result=await ok('answer',qa,ck);assert.equal(result.assignmentProgress[topicId].independent,1,'duplicate answers do not earn credit');
 assert.equal((await report()).students[0].completedAt,null,'Learn, Guided, and the full goal are required');
 const hinted=await next(a);await ok('hint',hinted,ck);result=await ok('answer',hinted,ck);assert.equal(result.independent,false);
 const retry=await next(a);assert.equal((await ok('answer',{...retry,answer:String(Number(retry.answer)+1)},ck)).correct,false);assert.equal((await ok('answer',retry,ck)).independent,false);
 const revealed=await next(a);await ok('solution',revealed,ck);assert.equal((await call('answer',revealed,ck)).status,400);
 result=await ok('answer',await next(a),ck);assert.equal(result.assignmentProgress[topicId].independent,2);
 assert.equal((await report()).students[0].completedAt,null);
 for(const stage of ['learn','guided'])await ok('lesson',{assignmentId:a,topicId,stage},ck);
 const completed=(await report()).students[0];assert.ok(completed.completedAt);assert.equal(completed.progress[topicId].independent,2);assert.equal(completed.progress[topicId].hints,1);assert.equal(completed.progress[topicId].attempts,5);
 assert.equal((await mine()).assignments.find(t=>t.id===b).progress[topicId].independent,0);
 assert.equal((await ok('session',undefined,ck)).progress[topicId].independent,7,'assignment practice still contributes to lifetime progress');
 await ok('assignment-start',{assignmentId:a,topicId},ck);assert.equal((await report()).students[0].completedAt,completed.completedAt,'completion timestamp is stable');
 const ownList=JSON.stringify(await mine());assert.ok(!ownList.includes(foreignId)&&!ownList.includes('fixture@example.test')&&!ownList.includes(room.joinCode),'student task lists contain no peer or contact data');

 await ok('help',{assignmentId:a,topicId,requested:true},ck);
 const waiting=(await teacher('teacher')).data.students.find(s=>s.id===id);
 assert.equal(waiting.helpAssignmentId,a);assert.equal(waiting.helpAssignmentTitle,'Verification Task A');assert.equal(waiting.helpClassName,room.name);
 assert.equal((await teacher('teacher-coursework')).data.assignments.find(t=>t.id===a).helpCount,1);
 await ok('resolve-help',{studentId:id},teacherCookie);
 const helped=(await ok('session',undefined,ck)).student;assert.equal(helped.helpRequested,false);assert.equal(helped.helpAssignmentId,null);
 await ok('assignment-update',{assignmentId:a,title:'Updated task',instructions:'Updated instructions',dueAt:null,goal:20,topicIds:['6-order']},teacherCookie);
 const updated=(await report()).assignment;assert.equal(updated.title,'Updated task');assert.equal(updated.goal,2);assert.deepEqual(updated.topicIds,[topicId]);assert.equal(updated.dueAt,null);

 const pending=await next(a);
 await ok('assignment-archive',{assignmentId:a,archived:true},teacherCookie);
 for(const [action,body] of [['assignment-start',{assignmentId:a,topicId}],['question',{assignmentId:a,topicId}],['lesson',{assignmentId:a,topicId,stage:'learn'}],['answer',pending],['hint',pending],['solution',pending],['help',{assignmentId:a,topicId,requested:true}]])assert.equal((await call(action,body,ck)).status,404,action+' cannot modify closed work');
 const closed=(await mine()).assignments.find(t=>t.id===a);assert.equal(closed.archived,true);assert.equal(closed.completedAt,completed.completedAt,'closed results remain readable');
 await ok('assignment-archive',{assignmentId:a,archived:false},teacherCookie);
 await ok('class-members',{classId:room.id,studentIds:[id],enroll:false},teacherCookie);
 assert.equal((await mine()).assignments.length,0);
 assert.equal((await call('answer',pending,ck)).status,404);
 assert.equal((await report()).students[0].enrolled,false,'former member results remain visible to teacher');
 await ok('class-join',{classCode:room.joinCode},ck);
 assert.equal((await mine()).assignments.find(t=>t.id===a).completedAt,completed.completedAt);
 await ok('class-members',{classId:room.id,studentIds:[foreignId],enroll:true},teacherCookie);
 assert.equal((await ok('assignments',undefined,foreign)).assignments.length,2,'students added later receive existing class assignments');
 assert.equal((await report()).students.length,2);
 assert.equal((await report()).students.find(s=>s.id===foreignId).startedAt,null);
 await ok('class-archive',{classId:room.id,archived:true},teacherCookie);
 assert.equal((await mine()).classes.length,0);assert.equal((await mine()).assignments.length,0);
 assert.equal((await call('class-join',{classCode:room.joinCode},foreign)).status,400);
 assert.equal((await call('assignment-start',{assignmentId:a,topicId},ck)).status,404);
 await ok('class-archive',{classId:room.id,archived:false},teacherCookie);
 assert.equal((await mine()).assignments.find(t=>t.id===a).completedAt,completed.completedAt);
 const resumed=await call('join',{firstName:person.firstName,lastName:person.lastName,mode:'returning',classCode:room.joinCode});assert.equal(resumed.data.student.id,id);
 assert.equal((await ok('assignments',undefined,resumed.cookie)).assignments.find(t=>t.id===a).completedAt,completed.completedAt);

 await ok('remove-student',{studentId:id},teacherCookie);
 assert.equal((await call('assignments',undefined,resumed.cookie)).status,401);
 assert.equal((await report()).students.length,1);assert.equal((await report()).students[0].id,foreignId);
 assert.equal((await ok('assignments',undefined,foreign)).assignments.length,2,'removing a student preserves other students and their assignments');
 await ok('remove-student',{studentId:foreignId},teacherCookie);
 console.log('PASS: classes, enrollment, assignment isolation, first-try goals, due dates, help context, protected reports, closed results, archive/reopen, returning students, and removal.');
}
