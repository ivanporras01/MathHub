import {verifyCoursework} from './verify-coursework.mjs';
import {inequalityOracle} from './inequalities-oracle.mjs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
const require = createRequire(realpathSync(new URL('../node_modules/wrangler/package.json',import.meta.url)));
const {Miniflare} = require('miniflare');
const fixtureCode = 'TEST-ONLY-CODE-1234';
const mf = new Miniflare({
  modules:true,scriptPath:new URL('../work/worker/worker.js',import.meta.url).pathname,
  compatibilityDate:'2026-05-15',
  durableObjects:{CLASSROOM:{className:'MathClassroom',useSQLite:true}},
  bindings:{TEACHER_CODE_SHA256:createHash('sha256').update(fixtureCode.replaceAll('-','')).digest('hex')},
  serviceBindings:{ASSETS:()=>new Response('MathHub')},
});
async function call(action,body,cookie='',extra={}) {
  const response=await mf.dispatchFetch('https://math.test/api/'+action,{
    method:body===undefined?'GET':'POST',
    headers:{...(body===undefined?{}:{'Content-Type':'application/json',Origin:'https://math.test'}),...(cookie?{Cookie:cookie}:{}),...extra},
    body:body===undefined?undefined:JSON.stringify(body),
  });
  return {status:response.status,data:await response.json(),cookie:response.headers.get('Set-Cookie')?.split(';')[0]};
}
try {
  assert.equal((await call('health')).data.ok,true);
  assert.equal((await call('teacher')).status,401);
  assert.equal((await call('teacher',undefined,'',{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'teacher@example.test'})).status,401);
  const student=await call('join',{firstName:' Test ',lastName:' Student ',grade:7});
  assert.equal(student.status,200);
  await call('lesson',{topicId:'7-equations',stage:'learn'},student.cookie);
  const q=await call('question',{topicId:'7-equations'},student.cookie);
  assert.equal(q.status,200);
  const n=q.data.question.expression.replaceAll('−','-').match(/-?\d+(?:\.\d+)?/g).map(Number);
  const result=await call('answer',{questionId:q.data.question.id,answer:String((n[2]-n[1])/n[0])},student.cookie);
  assert.equal(result.data.correct,true);
  const inequality=await call('question',{topicId:'9-inequalities'},student.cookie);
  assert.equal(inequality.status,200);
  const inequalityResult=await call('answer',{questionId:inequality.data.question.id,answer:String(inequalityOracle(inequality.data.question))},student.cookie);
  assert.equal(inequalityResult.data.correct,true);
  await call('logout',{},student.cookie);
  assert.equal((await call('session',undefined,student.cookie)).data.student,null);
  const restored=await call('join',{firstName:'TEST',lastName:'student',grade:6});
  assert.equal(restored.data.student.id,student.data.student.id);
  assert.equal(restored.data.progress['7-equations'].correct,1);
  assert.equal(restored.data.progress['7-equations'].learned,true);
  await call('activity',{topicId:'7-equations',stage:'practice',grade:7},restored.cookie);
  const teacher=await call('teacher-login',{code:fixtureCode});
  assert.equal(teacher.status,200);
  const roster=await call('teacher',undefined,teacher.cookie);
  assert.equal(roster.status,200);
  assert.equal(roster.data.students.length,1);
  assert.equal(roster.data.students[0].currentTopic,'7-equations');
  const privateInfo={studentId:student.data.student.id,schoolGrade:'8',schoolName:'Test School',email:'guardian@example.test',emailType:'guardian'};
  assert.equal((await call('student-profile',privateInfo,teacher.cookie)).status,200);
  assert.equal((await call('teacher',undefined,teacher.cookie)).data.students[0].schoolGrade,'8');
  assert.equal((await call('teacher',undefined,teacher.cookie)).data.students[0].email,'guardian@example.test');
  const sessionAfterEdit=await call('session',undefined,restored.cookie);
  assert.equal(sessionAfterEdit.data.student.email,undefined);
  assert.equal(sessionAfterEdit.data.student.grade,7);
  assert.equal(sessionAfterEdit.data.progress['7-equations'].correct,1);
  assert.equal((await call('join',{firstName:'Test',lastName:'Student',mode:'new',schoolGrade:'6',schoolName:'Wrong'})).status,409);
  const support=await call('support');
  assert.equal(support.data.paypalUrl,'https://www.paypal.com/ncp/payment/VDP5WQJ3E5W9G');
  assert.equal(support.data.enabled,true);
  assert.equal((await call('support-settings',{...support.data,enabled:false},restored.cookie)).status,401);
  assert.equal((await call('support-settings',{...support.data,enabled:false},teacher.cookie)).status,200);
  assert.equal((await call('support')).data.enabled,false);
  assert.equal((await call('teacher-support',undefined,teacher.cookie)).data.paypalUrl,support.data.paypalUrl);
  assert.equal((await call('remove-student',{studentId:student.data.student.id},restored.cookie)).status,401);
  assert.equal((await call('remove-student',{studentId:student.data.student.id},teacher.cookie)).status,200);
  assert.equal((await call('teacher',undefined,teacher.cookie)).data.students.length,0);
  assert.equal((await call('session',undefined,restored.cookie)).data.student,null);
  await verifyCoursework(call,teacher.cookie);
  await call('teacher-logout',{},teacher.cookie);
  assert.equal((await call('teacher',undefined,teacher.cookie)).status,401);
  console.log('PASS: deployed Worker bundle with real Cloudflare SQLite Durable Object: registration, returning student, scoring, saved progress, protected dashboard, activity, private school profiles, PayPal settings, removal, and logout.');
} finally {await mf.dispose();}
