CREATE TABLE `assignment_progress` (
	`assignment_id` text NOT NULL,
	`student_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`learned` integer DEFAULT 0 NOT NULL,
	`guided` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`assignment_id`, `student_id`, `topic_id`),
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assignment_topics` (
	`assignment_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`position` integer NOT NULL,
	PRIMARY KEY(`assignment_id`, `topic_id`),
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assignment_work` (
	`assignment_id` text NOT NULL,
	`student_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`assignment_id`, `student_id`),
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`title` text NOT NULL,
	`instructions` text DEFAULT '' NOT NULL,
	`due_at` integer,
	`goal` integer DEFAULT 5 NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assignments_class` ON `assignments` (`class_id`,`archived`);--> statement-breakpoint
CREATE TABLE `class_members` (
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`joined_at` integer NOT NULL,
	PRIMARY KEY(`class_id`, `student_id`),
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `class_members_student` ON `class_members` (`student_id`,`active`);--> statement-breakpoint
CREATE TABLE `classrooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`course` integer NOT NULL,
	`join_code` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classrooms_join_code_unique` ON `classrooms` (`join_code`);--> statement-breakpoint
ALTER TABLE `questions` ADD `assignment_id` text REFERENCES assignments(id);--> statement-breakpoint
CREATE INDEX `questions_assignment_student` ON `questions` (`assignment_id`,`student_id`,`topic_id`);--> statement-breakpoint
ALTER TABLE `students` ADD `help_assignment_id` text;