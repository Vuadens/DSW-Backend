-- CreateTable
CREATE TABLE `Turno` (
    `idTurno` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NULL,
    `diaSemana` ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') NOT NULL,
    `horaDesde` VARCHAR(5) NOT NULL,
    `horaHasta` VARCHAR(5) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Turno_diaSemana_idx`(`diaSemana`),
    PRIMARY KEY (`idTurno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProfesorToTurno` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProfesorToTurno_AB_unique`(`A`, `B`),
    INDEX `_ProfesorToTurno_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ProfesorToTurno` ADD CONSTRAINT `_ProfesorToTurno_A_fkey` FOREIGN KEY (`A`) REFERENCES `Profesor`(`idProfesor`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProfesorToTurno` ADD CONSTRAINT `_ProfesorToTurno_B_fkey` FOREIGN KEY (`B`) REFERENCES `Turno`(`idTurno`) ON DELETE CASCADE ON UPDATE CASCADE;

