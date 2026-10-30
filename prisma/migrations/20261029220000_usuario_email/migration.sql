-- El email pasa a ser la credencial de acceso (junto con el DNI de la persona).
-- `usuario` queda como nombre visible: opcional y no único.
-- Los usuarios existentes reciben un email provisorio que hay que reemplazar.

-- DropIndex
DROP INDEX `Usuario_usuario_key` ON `Usuario`;

-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `email` VARCHAR(191) NULL,
    MODIFY `usuario` VARCHAR(191) NULL;

UPDATE `Usuario` SET `email` = CONCAT(`idUsuario`, '@sin-email.local');

ALTER TABLE `Usuario` MODIFY `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_email_key` ON `Usuario`(`email`);
