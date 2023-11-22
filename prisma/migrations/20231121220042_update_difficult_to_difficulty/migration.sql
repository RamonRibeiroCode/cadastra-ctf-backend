/*
  Warnings:

  - You are about to drop the column `difficult` on the `challenge` table. All the data in the column will be lost.
  - You are about to drop the column `difficult` on the `flag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `challenge` DROP COLUMN `difficult`,
    ADD COLUMN `difficulty` ENUM('EASY', 'MEDIUM', 'HARD', 'INSANE') NOT NULL DEFAULT 'EASY';

-- AlterTable
ALTER TABLE `flag` DROP COLUMN `difficult`,
    ADD COLUMN `difficulty` ENUM('EASY', 'MEDIUM', 'HARD', 'INSANE') NOT NULL DEFAULT 'EASY';
