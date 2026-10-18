import {schema} from './schema';

// Additive migrations run transactionally once; the classroom ID and existing rows stay intact.
export const registrationAndSupportSchema = "CREATE TABLE `support_settings` (\n\t`id` integer PRIMARY KEY NOT NULL,\n\t`enabled` integer DEFAULT 0 NOT NULL,\n\t`paypal_url` text DEFAULT '' NOT NULL,\n\t`monthly_url` text DEFAULT '' NOT NULL,\n\t`updated_at` integer NOT NULL\n);\n\nALTER TABLE `students` ADD `school_grade` text;\nALTER TABLE `students` ADD `school_name` text;\nALTER TABLE `students` ADD `email` text;\nALTER TABLE `students` ADD `email_type` text;\n\nINSERT INTO support_settings (id,enabled,paypal_url,monthly_url,updated_at) VALUES (1,1,'https://www.paypal.com/ncp/payment/VDP5WQJ3E5W9G','',CAST(strftime('%s','now') AS INTEGER)*1000);\n";
export function migrateClassroom(storage:Pick<DurableObjectStorage,'sql'|'transactionSync'>){
 storage.transactionSync(()=>{
  storage.sql.exec('CREATE TABLE IF NOT EXISTS schema_versions (version INTEGER PRIMARY KEY)');
  for(const [version,sql] of [[1,schema],[2,registrationAndSupportSchema]] as const){
   if(storage.sql.exec('SELECT version FROM schema_versions WHERE version=?',version).toArray().length)continue;
   for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))storage.sql.exec(statement);
   storage.sql.exec('INSERT INTO schema_versions(version) VALUES (?)',version);
  }
 });
}
