-- CreateTable
CREATE TABLE `Socio` (
    `idSocio` INTEGER NOT NULL AUTO_INCREMENT,
    `DNI` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `fecha_baja` DATETIME(3) NULL,
    `fecha_nac` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idSocio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
