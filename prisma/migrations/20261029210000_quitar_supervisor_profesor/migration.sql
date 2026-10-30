-- La relación "supervisa" entre profesores no figura en el modelo de dominio.

-- DropForeignKey
ALTER TABLE `Profesor` DROP FOREIGN KEY `Profesor_supervisorId_fkey`;

-- AlterTable
ALTER TABLE `Profesor` DROP COLUMN `supervisorId`;
