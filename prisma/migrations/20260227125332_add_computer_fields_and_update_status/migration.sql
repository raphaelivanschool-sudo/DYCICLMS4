/*
  Warnings:

  - You are about to alter the column `status` on the `computer` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(2))`.

*/
-- DropForeignKey
ALTER TABLE `computer` DROP FOREIGN KEY `Computer_laboratoryId_fkey`;

-- AlterTable
ALTER TABLE `computer` ADD COLUMN `isLocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `seatNumber` INTEGER NULL,
    MODIFY `status` ENUM('ONLINE', 'OFFLINE', 'IN_USE', 'IDLE', 'MAINTENANCE') NOT NULL DEFAULT 'OFFLINE';

-- AddForeignKey
ALTER TABLE `Computer` ADD CONSTRAINT `Computer_laboratoryId_fkey` FOREIGN KEY (`laboratoryId`) REFERENCES `Laboratory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
