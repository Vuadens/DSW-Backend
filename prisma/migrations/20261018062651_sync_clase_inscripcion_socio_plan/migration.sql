/*
  Warnings:

  - Added the required column `planId` to the `Socio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `socio` ADD COLUMN `planId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Clase` (
    `idClase` INTEGER NOT NULL AUTO_INCREMENT,
    `diaSemana` ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') NOT NULL,
    `horaDesde` VARCHAR(5) NOT NULL,
    `horaHasta` VARCHAR(5) NOT NULL,
    `cupo` INTEGER NOT NULL,
    `idActividad` INTEGER NOT NULL,
    `idProfesor` INTEGER NOT NULL,

    INDEX `Clase_idActividad_idx`(`idActividad`),
    INDEX `Clase_idProfesor_idx`(`idProfesor`),
    INDEX `Clase_diaSemana_idx`(`diaSemana`),
    PRIMARY KEY (`idClase`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inscripcion` (
    `idInscripcion` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaInscripcion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `idSocio` INTEGER NOT NULL,
    `idClase` INTEGER NOT NULL,

    INDEX `Inscripcion_idSocio_idx`(`idSocio`),
    INDEX `Inscripcion_idClase_idx`(`idClase`),
    UNIQUE INDEX `Inscripcion_idSocio_idClase_key`(`idSocio`, `idClase`),
    PRIMARY KEY (`idInscripcion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Socio` ADD CONSTRAINT `Socio_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`idPlan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Clase` ADD CONSTRAINT `Clase_idActividad_fkey` FOREIGN KEY (`idActividad`) REFERENCES `Actividad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Clase` ADD CONSTRAINT `Clase_idProfesor_fkey` FOREIGN KEY (`idProfesor`) REFERENCES `Profesor`(`idProfesor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_idSocio_fkey` FOREIGN KEY (`idSocio`) REFERENCES `Socio`(`idSocio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_idClase_fkey` FOREIGN KEY (`idClase`) REFERENCES `Clase`(`idClase`) ON DELETE RESTRICT ON UPDATE CASCADE;
