CREATE TABLE `support_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 0 NOT NULL,
	`paypal_url` text DEFAULT '' NOT NULL,
	`monthly_url` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `students` ADD `school_grade` text;--> statement-breakpoint
ALTER TABLE `students` ADD `school_name` text;--> statement-breakpoint
ALTER TABLE `students` ADD `email` text;--> statement-breakpoint
ALTER TABLE `students` ADD `email_type` text;
--> statement-breakpoint
INSERT INTO support_settings (id,enabled,paypal_url,monthly_url,updated_at) VALUES (1,1,'https://www.paypal.com/ncp/payment/VDP5WQJ3E5W9G','',CAST(strftime('%s','now') AS INTEGER)*1000);
