-- Administrador: subtipo de Persona del modelo de dominio, con clave
-- primaria compartida (idPersona es PK y FK a Persona).

-- CreateTable
CREATE TABLE `Administrador` (
    `idPersona` INTEGER NOT NULL,

    PRIMARY KEY (`idPersona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrar datos: la persona de cada usuario ADMINISTRADOR pasa a ser Administrador
INSERT INTO `Administrador` (`idPersona`)
SELECT `personaId` FROM `Usuario` WHERE `rol` = 'ADMINISTRADOR';

-- AddForeignKey
ALTER TABLE `Administrador` ADD CONSTRAINT `Administrador_idPersona_fkey` FOREIGN KEY (`idPersona`) REFERENCES `Persona`(`idPersona`) ON DELETE CASCADE ON UPDATE CASCADE;
