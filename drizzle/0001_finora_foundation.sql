CREATE TABLE `wallets` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `name` varchar(120) NOT NULL,
  `type` enum('cash','bank','ewallet','credit_card','savings','investment','other_asset','receivable','payable') NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'VND',
  `openingBalance` bigint NOT NULL DEFAULT 0,
  `allowNegative` int NOT NULL DEFAULT 0,
  `isArchived` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
  CONSTRAINT `wallets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `name` varchar(120) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `parentId` int,
  `icon` varchar(64),
  `isArchived` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `categories_id` PRIMARY KEY(`id`),
  CONSTRAINT `categories_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `type` enum('income','expense','transfer') NOT NULL,
  `amount` bigint NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'VND',
  `walletId` int,
  `sourceWalletId` int,
  `destinationWalletId` int,
  `categoryId` int,
  `note` text,
  `occurredAt` timestamp NOT NULL DEFAULT (now()),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
  CONSTRAINT `transactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action,
  CONSTRAINT `transactions_walletId_wallets_id_fk` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE restrict ON UPDATE no action,
  CONSTRAINT `transactions_sourceWalletId_wallets_id_fk` FOREIGN KEY (`sourceWalletId`) REFERENCES `wallets`(`id`) ON DELETE restrict ON UPDATE no action,
  CONSTRAINT `transactions_destinationWalletId_wallets_id_fk` FOREIGN KEY (`destinationWalletId`) REFERENCES `wallets`(`id`) ON DELETE restrict ON UPDATE no action,
  CONSTRAINT `transactions_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE `budgets` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `categoryId` int,
  `walletId` int,
  `amount` bigint NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'VND',
  `periodStart` timestamp NOT NULL,
  `periodEnd` timestamp NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `budgets_id` PRIMARY KEY(`id`),
  CONSTRAINT `budgets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action,
  CONSTRAINT `budgets_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action,
  CONSTRAINT `budgets_walletId_wallets_id_fk` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE restrict ON UPDATE no action
);
