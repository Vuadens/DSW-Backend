-- Reestructuración según el modelo de dominio: Persona como superclase de
-- Profesor y Socio, con clave primaria compartida (la PK de cada subtipo es
-- idPersona, que a su vez es FK a Persona). Usuario se vincula a Persona.
-- Se migran los datos existentes y se remapean las FKs que apuntaban a
-- idProfesor/idSocio para que apunten al idPersona correspondiente.

-- DropForeignKey
ALTER TABLE `Clase` DROP FOREIGN KEY `Clase_idProfesor_fkey`;

-- DropForeignKey
ALTER TABLE `Inscripcion` DROP FOREIGN KEY `Inscripcion_idSocio_fkey`;

-- DropForeignKey
ALTER TABLE `Usuario` DROP FOREIGN KEY `Usuario_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `Usuario` DROP FOREIGN KEY `Usuario_profesorId_fkey`;

-- DropForeignKey
ALTER TABLE `Cuota` DROP FOREIGN KEY `Cuota_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `_ProfesorToTurno` DROP FOREIGN KEY `_ProfesorToTurno_A_fkey`;

-- DropIndex
DROP INDEX `Usuario_socioId_key` ON `Usuario`;

-- DropIndex
DROP INDEX `Usuario_profesorId_key` ON `Usuario`;

-- CreateTable (con columnas auxiliares para mapear los registros existentes)
CREATE TABLE `Persona` (
    `idPersona` INTEGER NOT NULL AUTO_INCREMENT,
    `dni` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `fechaNac` DATETIME(3) NOT NULL,
    `tmpSocioId` INTEGER NULL,
    `tmpProfesorId` INTEGER NULL,
    `tmpUsuarioId` INTEGER NULL,

    UNIQUE INDEX `Persona_dni_key`(`dni`),
    PRIMARY KEY (`idPersona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrar datos: socios
INSERT INTO `Persona` (`dni`, `nombre`, `apellido`, `telefono`, `fechaNac`, `tmpSocioId`)
SELECT `DNI`, `nombre`, `apellido`, `telefono`, `fecha_nac`, `idSocio` FROM `Socio`;

-- Migrar datos: profesores (no tenían dni, teléfono ni fecha de nacimiento)
INSERT INTO `Persona` (`dni`, `nombre`, `apellido`, `telefono`, `fechaNac`, `tmpProfesorId`)
SELECT CONCAT('PROF-', `idProfesor`), `nombre`, `apellido`, '', '1900-01-01 00:00:00.000', `idProfesor` FROM `Profesor`;

-- Migrar datos: usuarios sin socio ni profesor (administradores). Todo
-- usuario debe quedar vinculado a una persona.
INSERT INTO `Persona` (`dni`, `nombre`, `apellido`, `telefono`, `fechaNac`, `tmpUsuarioId`)
SELECT CONCAT('USR-', `idUsuario`), `usuario`, '', '', '1900-01-01 00:00:00.000', `idUsuario`
FROM `Usuario` WHERE `socioId` IS NULL AND `profesorId` IS NULL;

-- Remapear FKs al idPersona. Primero se niegan los valores para que un id
-- nuevo no choque con un id viejo todavía sin actualizar en los índices
-- únicos (Cuota socioId+mesAnio, Inscripcion idSocio+idClase, _ProfesorToTurno A+B).
UPDATE `Clase` SET `idProfesor` = -`idProfesor`;
UPDATE `Clase` c JOIN `Persona` p ON p.`tmpProfesorId` = -c.`idProfesor`
SET c.`idProfesor` = p.`idPersona`;

UPDATE `_ProfesorToTurno` SET `A` = -`A`;
UPDATE `_ProfesorToTurno` pt JOIN `Persona` p ON p.`tmpProfesorId` = -pt.`A`
SET pt.`A` = p.`idPersona`;

UPDATE `Inscripcion` SET `idSocio` = -`idSocio`;
UPDATE `Inscripcion` i JOIN `Persona` p ON p.`tmpSocioId` = -i.`idSocio`
SET i.`idSocio` = p.`idPersona`;

UPDATE `Cuota` SET `socioId` = -`socioId`;
UPDATE `Cuota` cu JOIN `Persona` p ON p.`tmpSocioId` = -cu.`socioId`
SET cu.`socioId` = p.`idPersona`;

-- AlterTable: Profesor pasa a tener idPersona como PK
ALTER TABLE `Profesor` ADD COLUMN `idPersona` INTEGER NULL;

UPDATE `Profesor` pr JOIN `Persona` p ON p.`tmpProfesorId` = pr.`idProfesor`
SET pr.`idPersona` = p.`idPersona`;

ALTER TABLE `Profesor` MODIFY `idProfesor` INTEGER NOT NULL;

ALTER TABLE `Profesor` DROP PRIMARY KEY,
    DROP COLUMN `apellido`,
    DROP COLUMN `idProfesor`,
    DROP COLUMN `nombre`,
    MODIFY `idPersona` INTEGER NOT NULL,
    ADD PRIMARY KEY (`idPersona`);

-- AlterTable: Socio pasa a tener idPersona como PK
ALTER TABLE `Socio` ADD COLUMN `fechaAlta` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fechaBaja` DATETIME(3) NULL,
    ADD COLUMN `idPersona` INTEGER NULL;

UPDATE `Socio` s JOIN `Persona` p ON p.`tmpSocioId` = s.`idSocio`
SET s.`idPersona` = p.`idPersona`, s.`fechaBaja` = s.`fecha_baja`;

ALTER TABLE `Socio` MODIFY `idSocio` INTEGER NOT NULL;

ALTER TABLE `Socio` DROP PRIMARY KEY,
    DROP COLUMN `DNI`,
    DROP COLUMN `apellido`,
    DROP COLUMN `fecha_baja`,
    DROP COLUMN `fecha_nac`,
    DROP COLUMN `idSocio`,
    DROP COLUMN `nombre`,
    DROP COLUMN `telefono`,
    MODIFY `idPersona` INTEGER NOT NULL,
    ADD PRIMARY KEY (`idPersona`);

-- AlterTable: Usuario se vincula a Persona
ALTER TABLE `Usuario` ADD COLUMN `personaId` INTEGER NULL;

UPDATE `Usuario` u JOIN `Persona` p ON p.`tmpSocioId` = u.`socioId`
SET u.`personaId` = p.`idPersona`;

UPDATE `Usuario` u JOIN `Persona` p ON p.`tmpProfesorId` = u.`profesorId`
SET u.`personaId` = p.`idPersona` WHERE u.`personaId` IS NULL;

UPDATE `Usuario` u JOIN `Persona` p ON p.`tmpUsuarioId` = u.`idUsuario`
SET u.`personaId` = p.`idPersona` WHERE u.`personaId` IS NULL;

ALTER TABLE `Usuario` DROP COLUMN `profesorId`,
    DROP COLUMN `socioId`,
    MODIFY `personaId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Persona` DROP COLUMN `tmpSocioId`,
    DROP COLUMN `tmpProfesorId`,
    DROP COLUMN `tmpUsuarioId`;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_personaId_key` ON `Usuario`(`personaId`);

-- AddForeignKey
ALTER TABLE `Profesor` ADD CONSTRAINT `Profesor_idPersona_fkey` FOREIGN KEY (`idPersona`) REFERENCES `Persona`(`idPersona`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Socio` ADD CONSTRAINT `Socio_idPersona_fkey` FOREIGN KEY (`idPersona`) REFERENCES `Persona`(`idPersona`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Clase` ADD CONSTRAINT `Clase_idProfesor_fkey` FOREIGN KEY (`idProfesor`) REFERENCES `Profesor`(`idPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_idSocio_fkey` FOREIGN KEY (`idSocio`) REFERENCES `Socio`(`idPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_personaId_fkey` FOREIGN KEY (`personaId`) REFERENCES `Persona`(`idPersona`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cuota` ADD CONSTRAINT `Cuota_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Socio`(`idPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProfesorToTurno` ADD CONSTRAINT `_ProfesorToTurno_A_fkey` FOREIGN KEY (`A`) REFERENCES `Profesor`(`idPersona`) ON DELETE CASCADE ON UPDATE CASCADE;
