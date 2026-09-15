CREATE TABLE `Profesor` (
    `idProfesor` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idProfesor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
