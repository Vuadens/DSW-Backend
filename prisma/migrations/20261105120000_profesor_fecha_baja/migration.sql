-- Baja lógica de profesores: en lugar de borrar la fila se registra la fecha de baja.

-- AlterTable
ALTER TABLE `Profesor` ADD COLUMN `fechaBaja` DATETIME(3) NULL;
