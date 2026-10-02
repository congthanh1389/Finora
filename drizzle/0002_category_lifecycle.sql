ALTER TABLE `categories` ADD `isArchived` int NOT NULL DEFAULT 0;
ALTER TABLE `categories` ADD `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;
