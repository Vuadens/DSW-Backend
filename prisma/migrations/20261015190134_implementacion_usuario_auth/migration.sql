/*
  Warnings:

  - A unique constraint covering the columns `[socioId]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profesorId]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `profesor` ADD COLUMN `supervisorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `profesorId` INTEGER NULL,
    ADD COLUMN `socioId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_socioId_key` ON `Usuario`(`socioId`);

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_profesorId_key` ON `Usuario`(`profesorId`);

-- AddForeignKey
ALTER TABLE `Profesor` ADD CONSTRAINT `Profesor_supervisorId_fkey` FOREIGN KEY (`supervisorId`) REFERENCES `Profesor`(`idProfesor`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Socio`(`idSocio`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_profesorId_fkey` FOREIGN KEY (`profesorId`) REFERENCES `Profesor`(`idProfesor`) ON DELETE SET NULL ON UPDATE CASCADE;
