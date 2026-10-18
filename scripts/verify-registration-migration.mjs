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
const {migrateClassroom,registrationAndSupportSchema}=await import(new URL('migrations.mjs',out));
assert.equal(registrationAndSupportSchema,(await readFile(new URL('../drizzle/0003_student_profiles_and_support.sql',import.meta.url),'utf8')).replaceAll('--> statement-breakpoint',''));
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
assert.equal(old.prepare('SELECT COUNT(*) n FROM schema_versions').get().n,2);
const fresh=new DatabaseSync(':memory:');migrateClassroom(liveStorage(fresh));migrateClassroom(liveStorage(fresh));
assert.equal(fresh.prepare('SELECT COUNT(*) n FROM schema_versions').get().n,2);
assert.equal(fresh.prepare('SELECT enabled FROM support_settings').get().enabled,1);
old.close();fresh.close();
console.log('PASS: fresh and existing classroom migrations, repeat startup, preserved identities/progress/sessions, and persistent PayPal settings.');
