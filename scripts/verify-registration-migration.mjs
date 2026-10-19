import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import ts from 'typescript';
const out=new URL('../work/migration-verification/',import.meta.url);
await mkdir(out,{recursive:true});
for(const name of ['schema','migrations']){
 const source=(await readFile(new URL(`../cloudflare/${name}.ts`,import.meta.url),'utf8')).replace("'./schema'","'./schema.mjs'");
 await writeFile(new URL(`${name}.mjs`,out),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
}
const {schema}=await import(new URL('schema.mjs',out));
const {migrateClassroom,registrationAndSupportSchema,classesAndAssignmentsSchema}=await import(new URL('migrations.mjs',out));
assert.equal(registrationAndSupportSchema,(await readFile(new URL('../drizzle/0003_student_profiles_and_support.sql',import.meta.url),'utf8')).replaceAll('--> statement-breakpoint',''));
assert.equal(classesAndAssignmentsSchema,(await readFile(new URL('../drizzle/0004_classes_and_assignments.sql',import.meta.url),'utf8')).replaceAll('--> statement-breakpoint',''));
function storage(sqlite){return {
 sql:{exec(sql,...params){return {toArray:()=>sqlite.prepare(sql).all(...params)};}},
 transactionSync(fn){sqlite.exec('BEGIN');try{const value=fn();sqlite.exec('COMMIT');return value;}catch(e){sqlite.exec('ROLLBACK');throw e;}},
};}
// A SQL cursor executes immediately in Cloudflare, even when toArray() is unused.
function liveStorage(sqlite){const wrapper=storage(sqlite);wrapper.sql.exec=(sql,...params)=>{const rows=sqlite.prepare(sql).all(...params);return {toArray:()=>rows};};return wrapper;}
const old=new DatabaseSync(':memory:');old.exec(schema);
old.exec("CREATE TABLE schema_versions(version INTEGER PRIMARY KEY); INSERT INTO schema_versions VALUES(1)");
old.prepare('INSERT INTO students(id,name_key,first_name,last_name,grade,joined_at,last_seen) VALUES(?,?,?,?,?,?,?)').run('legacy','legacy|learner','Legacy','Learner',11,1,2);
old.prepare('INSERT INTO progress(id,student_id,topic_id,learned,guided,updated_at) VALUES(?,?,?,?,?,?)').run('progress','legacy','11-transformations',1,1,3);
old.prepare('INSERT INTO sessions(token_hash,student_id,expires_at) VALUES(?,?,?)').run('session','legacy',9999999999999);
const beforeStudent={...old.prepare('SELECT * FROM students').get()},beforeProgress=old.prepare('SELECT * FROM progress').all(),beforeSessions=old.prepare('SELECT * FROM sessions').all();
migrateClassroom(liveStorage(old));
const after=old.prepare('SELECT * FROM students').get();
for(const [key,value] of Object.entries(beforeStudent))assert.equal(after[key],value);
for(const key of ['school_grade','school_name','email','email_type'])assert.equal(after[key],null);
assert.deepEqual(old.prepare('SELECT * FROM progress').all(),beforeProgress);
assert.deepEqual(old.prepare('SELECT * FROM sessions').all(),beforeSessions);
assert.equal(old.prepare('SELECT paypal_url FROM support_settings').get().paypal_url,'https://www.paypal.com/ncp/payment/VDP5WQJ3E5W9G');
old.exec('UPDATE support_settings SET enabled=0');
migrateClassroom(liveStorage(old));
assert.equal(old.prepare('SELECT enabled FROM support_settings').get().enabled,0,'restarts preserve teacher settings');
assert.equal(old.prepare('SELECT COUNT(*) n FROM students').get().n,1);
assert.equal(old.prepare('SELECT COUNT(*) n FROM schema_versions').get().n,3);
const fresh=new DatabaseSync(':memory:');migrateClassroom(liveStorage(fresh));migrateClassroom(liveStorage(fresh));
assert.equal(fresh.prepare('SELECT COUNT(*) n FROM schema_versions').get().n,3);
assert.equal(fresh.prepare('SELECT enabled FROM support_settings').get().enabled,1);
const current=new DatabaseSync(':memory:');current.exec('PRAGMA foreign_keys=ON');current.exec(schema);current.exec(registrationAndSupportSchema);
current.exec("CREATE TABLE schema_versions(version INTEGER PRIMARY KEY); INSERT INTO schema_versions VALUES(1),(2)");
current.prepare('INSERT INTO students(id,name_key,first_name,last_name,grade,school_grade,school_name,email,email_type,help_requested,help_topic,joined_at,last_seen) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').run('current','current|learner','Current','Learner',7,'8','Existing School','guardian@example.test','guardian',1,'7-equations',1,2);
current.prepare('INSERT INTO questions(id,student_id,topic_id,seed,level,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run('pending','current','7-equations',111,1,3,4);
current.exec('UPDATE support_settings SET enabled=0');
const profileBefore={...current.prepare('SELECT * FROM students').get()},questionBefore={...current.prepare('SELECT * FROM questions').get()};
migrateClassroom(liveStorage(current));
for(const [key,value] of Object.entries(profileBefore))assert.equal(current.prepare('SELECT * FROM students').get()[key],value);
for(const [key,value] of Object.entries(questionBefore))assert.equal(current.prepare('SELECT * FROM questions').get()[key],value);
assert.equal(current.prepare('SELECT assignment_id FROM questions').get().assignment_id,null,'existing questions remain free practice');
assert.equal(current.prepare('SELECT help_assignment_id FROM students').get().help_assignment_id,null,'old help requests remain attached to their original topic');
current.exec("INSERT INTO classrooms(id,name,course,join_code,created_at) VALUES('class','Preserved class',7,'MHABCDEFGH',1); INSERT INTO class_members VALUES('class','current',1,2); INSERT INTO assignments(id,class_id,title,goal,created_at) VALUES('task','class','Preserved task',2,3); INSERT INTO assignment_topics VALUES('task','7-equations',0); INSERT INTO assignment_progress VALUES('task','current','7-equations',1,1,4); INSERT INTO assignment_work VALUES('task','current',4,5,5)");
const persistentTables=['students','questions','support_settings','classrooms','class_members','assignments','assignment_topics','assignment_progress','assignment_work'];
const snapshots=persistentTables.map(t=>current.prepare(`SELECT * FROM ${t}`).all());
migrateClassroom(liveStorage(current));
persistentTables.forEach((t,i)=>assert.deepEqual(current.prepare(`SELECT * FROM ${t}`).all(),snapshots[i],t+' preserved across restart'));
assert.deepEqual(current.prepare('PRAGMA foreign_key_check').all(),[]);
old.close();fresh.close();current.close();
console.log('PASS: fresh, original, and version-2 migration; unchanged profiles/questions/progress/sessions; persistent PayPal, classes, enrollment, assignments, and completion after restart.');
