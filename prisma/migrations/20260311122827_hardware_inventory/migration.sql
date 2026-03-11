/*
  Warnings:

  - A unique constraint covering the columns `[ticketId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ticketId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedBy` INTEGER NULL,
    ADD COLUMN `rejectionReason` VARCHAR(191) NULL,
    ADD COLUMN `ticketId` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'PENDING_APPROVAL';

-- CreateTable
CREATE TABLE `HardwareInventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `deviceType` ENUM('MONITOR', 'CPU', 'KEYBOARD', 'MOUSE', 'HEADSET', 'WEBCAM', 'UPS', 'PRINTER', 'OTHER') NOT NULL,
    `model` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NOT NULL,
    `condition` ENUM('GOOD', 'FAIR', 'POOR', 'DAMAGED') NOT NULL DEFAULT 'GOOD',
    `status` ENUM('ACTIVE', 'INACTIVE', 'UNDER_REPAIR', 'MISSING') NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `laboratoryId` INTEGER NOT NULL,
    `assignedComputerId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HardwareInventory_serialNumber_key`(`serialNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Ticket_ticketId_key` ON `Ticket`(`ticketId`);

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HardwareInventory` ADD CONSTRAINT `HardwareInventory_laboratoryId_fkey` FOREIGN KEY (`laboratoryId`) REFERENCES `Laboratory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HardwareInventory` ADD CONSTRAINT `HardwareInventory_assignedComputerId_fkey` FOREIGN KEY (`assignedComputerId`) REFERENCES `Computer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
