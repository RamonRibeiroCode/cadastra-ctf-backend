-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NULL,
    `points` INTEGER NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `challenge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(255) NULL,
    `url` VARCHAR(255) NOT NULL,
    `firstBloodUserId` INTEGER NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD', 'INSANE') NOT NULL DEFAULT 'EASY',
    `releaseAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `flag` VARCHAR(255) NOT NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD', 'INSANE') NOT NULL DEFAULT 'EASY',
    `points` INTEGER NOT NULL,
    `challengeId` INTEGER NOT NULL,

    UNIQUE INDEX `flag_flag_key`(`flag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity` (
    `userId` INTEGER NOT NULL,
    `flagId` INTEGER NOT NULL,
    `executionTime` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`, `flagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scoreboard` (
    `userId` INTEGER NOT NULL,
    `challengeId` INTEGER NOT NULL,
    `executionTime` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `challengeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `challenge` ADD CONSTRAINT `challenge_firstBloodUserId_fkey` FOREIGN KEY (`firstBloodUserId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flag` ADD CONSTRAINT `flag_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity` ADD CONSTRAINT `activity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity` ADD CONSTRAINT `activity_flagId_fkey` FOREIGN KEY (`flagId`) REFERENCES `flag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scoreboard` ADD CONSTRAINT `scoreboard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scoreboard` ADD CONSTRAINT `scoreboard_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
