-- La contraseña inicial la asigna el sistema (últimos 6 dígitos del DNI) y hay que
-- cambiarla en el primer ingreso. Las cuentas existentes ya tienen contraseña propia.

-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `debeCambiarPassword` BOOLEAN NOT NULL DEFAULT false;
