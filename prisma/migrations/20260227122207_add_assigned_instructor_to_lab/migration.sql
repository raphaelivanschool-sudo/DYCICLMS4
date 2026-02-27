-- AlterTable
ALTER TABLE `laboratory` ADD COLUMN `assignedInstructorId` INTEGER NULL,
    ADD COLUMN `location` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Laboratory` ADD CONSTRAINT `Laboratory_assignedInstructorId_fkey` FOREIGN KEY (`assignedInstructorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
