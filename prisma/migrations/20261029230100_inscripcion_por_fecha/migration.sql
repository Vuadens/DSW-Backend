-- La inscripción pasa a ser una reserva para una fecha puntual de la clase,
-- con estado (CONFIRMADA / CANCELADA) y asistencia.

-- DropIndex
DROP INDEX `Inscripcion_idSocio_idClase_key` ON `Inscripcion`;

-- AlterTable
ALTER TABLE `Inscripcion` ADD COLUMN `asistio` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `estado` ENUM('CONFIRMADA', 'CANCELADA') NOT NULL DEFAULT 'CONFIRMADA',
    ADD COLUMN `fechaClase` DATE NULL;

-- Migrar datos: cada inscripción existente pasa a la próxima fecha de su clase
-- (desde hoy) y el estado sale de `activo`. FIELD() devuelve 1 para DOMINGO
-- ... 7 para SABADO, igual que DAYOFWEEK().
UPDATE `Inscripcion` i JOIN `Clase` c ON c.`idClase` = i.`idClase`
SET i.`fechaClase` = DATE_ADD(CURDATE(), INTERVAL MOD(
        FIELD(c.`diaSemana`, 'DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO')
        - DAYOFWEEK(CURDATE()) + 7, 7) DAY),
    i.`estado` = IF(i.`activo`, 'CONFIRMADA', 'CANCELADA');

ALTER TABLE `Inscripcion` DROP COLUMN `activo`,
    MODIFY `fechaClase` DATE NOT NULL;

-- CreateIndex
CREATE INDEX `Inscripcion_idClase_fechaClase_idx` ON `Inscripcion`(`idClase`, `fechaClase`);

-- CreateIndex
CREATE UNIQUE INDEX `Inscripcion_idSocio_idClase_fechaClase_key` ON `Inscripcion`(`idSocio`, `idClase`, `fechaClase`);
