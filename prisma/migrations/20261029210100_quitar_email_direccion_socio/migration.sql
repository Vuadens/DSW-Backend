-- email y direccion no figuran en el modelo de dominio para Socio (ni en
-- Persona); en el modelo de dominio el email pertenece a Usuario.
-- Se pierden los datos cargados en estas columnas.

-- AlterTable
ALTER TABLE `Socio` DROP COLUMN `direccion`,
    DROP COLUMN `email`;
