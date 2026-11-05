-- Cambio de plan programado: el socio elige un plan nuevo, que rige desde el mes siguiente.

-- AlterTable
ALTER TABLE `Socio` ADD COLUMN `planProximoId` INTEGER NULL,
    ADD COLUMN `planProximoDesde` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `Socio` ADD CONSTRAINT `Socio_planProximoId_fkey` FOREIGN KEY (`planProximoId`) REFERENCES `Plan`(`idPlan`) ON DELETE SET NULL ON UPDATE CASCADE;
