/*
  Warnings:

  - Added the required column `showAt` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Challenge` ADD COLUMN `image` VARCHAR(255) NULL,
    ADD COLUMN `showAt` DATETIME(3) NOT NULL,
    ADD COLUMN `url` VARCHAR(255) NOT NULL;
