/*
  Warnings:

  - You are about to drop the column `classGroupId` on the `subject` table. All the data in the column will be lost.
  - You are about to drop the `classgroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `Subject_classGroupId_fkey`;

-- AlterTable
ALTER TABLE `subject` DROP COLUMN `classGroupId`;

-- DropTable
DROP TABLE `classgroup`;
