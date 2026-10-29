-- CreateTable
CREATE TABLE `Cuota` (
    `idCuota` INTEGER NOT NULL AUTO_INCREMENT,
    `mesAnio` DATETIME(3) NOT NULL,
    `fechaPago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `valor` DECIMAL(65, 30) NOT NULL,
    `socioId` INTEGER NOT NULL,

    UNIQUE INDEX `Cuota_socioId_mesAnio_key`(`socioId`, `mesAnio`),
    PRIMARY KEY (`idCuota`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cuota` ADD CONSTRAINT `Cuota_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Socio`(`idSocio`) ON DELETE RESTRICT ON UPDATE CASCADE;
