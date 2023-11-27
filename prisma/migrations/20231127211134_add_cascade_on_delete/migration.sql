-- DropForeignKey
ALTER TABLE `activity` DROP FOREIGN KEY `Activity_flagId_fkey`;

-- DropForeignKey
ALTER TABLE `activity` DROP FOREIGN KEY `Activity_userId_fkey`;

-- DropForeignKey
ALTER TABLE `challenge` DROP FOREIGN KEY `Challenge_firstBloodUserId_fkey`;

-- DropForeignKey
ALTER TABLE `flag` DROP FOREIGN KEY `Flag_challengeId_fkey`;

-- DropForeignKey
ALTER TABLE `scoreboard` DROP FOREIGN KEY `Scoreboard_challengeId_fkey`;

-- DropForeignKey
ALTER TABLE `scoreboard` DROP FOREIGN KEY `Scoreboard_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Challenge` ADD CONSTRAINT `Challenge_firstBloodUserId_fkey` FOREIGN KEY (`firstBloodUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flag` ADD CONSTRAINT `Flag_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `Challenge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_flagId_fkey` FOREIGN KEY (`flagId`) REFERENCES `Flag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scoreboard` ADD CONSTRAINT `Scoreboard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scoreboard` ADD CONSTRAINT `Scoreboard_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `Challenge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
