-- CreateTable
CREATE TABLE `Maquina` (
    `idMaquina` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `estado` ENUM('DISPONIBLE', 'REPARACION', 'INHABILITADA') NOT NULL DEFAULT 'DISPONIBLE',

    PRIMARY KEY (`idMaquina`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ClaseToMaquina` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ClaseToMaquina_AB_unique`(`A`, `B`),
    INDEX `_ClaseToMaquina_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ClaseToMaquina` ADD CONSTRAINT `_ClaseToMaquina_A_fkey` FOREIGN KEY (`A`) REFERENCES `Clase`(`idClase`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ClaseToMaquina` ADD CONSTRAINT `_ClaseToMaquina_B_fkey` FOREIGN KEY (`B`) REFERENCES `Maquina`(`idMaquina`) ON DELETE CASCADE ON UPDATE CASCADE;
