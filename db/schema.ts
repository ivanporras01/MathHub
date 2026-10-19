import { sqliteTable, text, integer, uniqueIndex, index, primaryKey } from 'drizzle-orm/sqlite-core';
export const students = sqliteTable('students', {
 id:text('id').primaryKey(), nameKey:text('name_key').notNull().unique(), firstName:text('first_name').notNull(),lastName:text('last_name').notNull(),grade:integer('grade').notNull().default(6),schoolGrade:text('school_grade'),schoolName:text('school_name'),email:text('email'),emailType:text('email_type'), currentTopic:text('current_topic'),currentStage:text('current_stage').notNull().default('explore'),helpRequested:integer('help_requested').notNull().default(0),helpTopic:text('help_topic'),helpAssignmentId:text('help_assignment_id'),joinedAt:integer('joined_at').notNull(),lastSeen:integer('last_seen').notNull()
});
export const sessions = sqliteTable('sessions', {tokenHash:text('token_hash').primaryKey(),studentId:text('student_id').notNull().references(()=>students.id),expiresAt:integer('expires_at').notNull()},t=>[index('sessions_student').on(t.studentId)]);
export const teacherSessions = sqliteTable('teacher_sessions', {tokenHash:text('token_hash').primaryKey(),codeHash:text('code_hash').notNull(),expiresAt:integer('expires_at').notNull()},t=>[index('teacher_sessions_expiry').on(t.expiresAt)]);
export const teacherLoginAttempts = sqliteTable('teacher_login_attempts', {bucketKey:text('bucket_key').primaryKey(),windowStart:integer('window_start').notNull(),attempts:integer('attempts').notNull()},t=>[index('teacher_login_attempts_window').on(t.windowStart)]);
export const progress = sqliteTable('progress', {id:text('id').primaryKey(),studentId:text('student_id').notNull().references(()=>students.id),topicId:text('topic_id').notNull(),learned:integer('learned').notNull().default(0),guided:integer('guided').notNull().default(0),updatedAt:integer('updated_at').notNull()},t=>[uniqueIndex('progress_student_topic').on(t.studentId,t.topicId)]);
export const questions = sqliteTable('questions', {id:text('id').primaryKey(),studentId:text('student_id').notNull().references(()=>students.id),topicId:text('topic_id').notNull(),assignmentId:text('assignment_id').references(()=>assignments.id),seed:integer('seed').notNull(),level:integer('level').notNull(),attempts:integer('attempts').notNull().default(0),hintUsed:integer('hint_used').notNull().default(0),revealed:integer('revealed').notNull().default(0),correct:integer('correct').notNull().default(0),independent:integer('independent').notNull().default(0),lastAnswer:text('last_answer'),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()},t=>[index('questions_student_topic').on(t.studentId,t.topicId),index('questions_assignment_student').on(t.assignmentId,t.studentId,t.topicId)]);

export const supportSettings = sqliteTable('support_settings', {id:integer('id').primaryKey(),enabled:integer('enabled').notNull().default(0),paypalUrl:text('paypal_url').notNull().default(''),monthlyUrl:text('monthly_url').notNull().default(''),updatedAt:integer('updated_at').notNull()});

export const classrooms=sqliteTable('classrooms',{
 id:text('id').primaryKey(),name:text('name').notNull(),course:integer('course').notNull(),joinCode:text('join_code').notNull().unique(),archived:integer('archived').notNull().default(0),createdAt:integer('created_at').notNull()
});
export const classMembers=sqliteTable('class_members',{
 classId:text('class_id').notNull().references(()=>classrooms.id),studentId:text('student_id').notNull().references(()=>students.id),active:integer('active').notNull().default(1),joinedAt:integer('joined_at').notNull()
},t=>[primaryKey({columns:[t.classId,t.studentId]}),index('class_members_student').on(t.studentId,t.active)]);
export const assignments=sqliteTable('assignments',{
 id:text('id').primaryKey(),classId:text('class_id').notNull().references(()=>classrooms.id),title:text('title').notNull(),instructions:text('instructions').notNull().default(''),dueAt:integer('due_at'),goal:integer('goal').notNull().default(5),archived:integer('archived').notNull().default(0),createdAt:integer('created_at').notNull()
},t=>[index('assignments_class').on(t.classId,t.archived)]);
export const assignmentTopics=sqliteTable('assignment_topics',{
 assignmentId:text('assignment_id').notNull().references(()=>assignments.id),topicId:text('topic_id').notNull(),position:integer('position').notNull()
},t=>[primaryKey({columns:[t.assignmentId,t.topicId]})]);
export const assignmentProgress=sqliteTable('assignment_progress',{
 assignmentId:text('assignment_id').notNull().references(()=>assignments.id),studentId:text('student_id').notNull().references(()=>students.id),topicId:text('topic_id').notNull(),learned:integer('learned').notNull().default(0),guided:integer('guided').notNull().default(0),updatedAt:integer('updated_at').notNull()
},t=>[primaryKey({columns:[t.assignmentId,t.studentId,t.topicId]})]);
export const assignmentWork=sqliteTable('assignment_work',{
 assignmentId:text('assignment_id').notNull().references(()=>assignments.id),studentId:text('student_id').notNull().references(()=>students.id),startedAt:integer('started_at').notNull(),completedAt:integer('completed_at'),updatedAt:integer('updated_at').notNull()
},t=>[primaryKey({columns:[t.assignmentId,t.studentId]})]);
