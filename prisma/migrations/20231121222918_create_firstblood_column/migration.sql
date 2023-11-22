-- AlterTable
ALTER TABLE `challenge` ADD COLUMN `firstBloodUserId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Challenge` ADD CONSTRAINT `Challenge_firstBloodUserId_fkey` FOREIGN KEY (`firstBloodUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
