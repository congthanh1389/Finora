CREATE TABLE `accounts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `name` varchar(120) NOT NULL,
  `type` enum('cash','bank','e_wallet','credit_card','other') NOT NULL DEFAULT 'cash',
  `currency` varchar(3) NOT NULL DEFAULT 'VND',
  `openingBalance` decimal(18,2) NOT NULL DEFAULT 0,
  `isArchived` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `categories` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int,
  `name` varchar(120) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `parentId` int,
  `icon` varchar(80),
  `isSystem` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);

CREATE TABLE `transactions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `accountId` int NOT NULL,
  `categoryId` int,
  `type` enum('income','expense','transfer') NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `transactionDate` timestamp NOT NULL DEFAULT (now()),
  `note` text,
  `transferAccountId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
