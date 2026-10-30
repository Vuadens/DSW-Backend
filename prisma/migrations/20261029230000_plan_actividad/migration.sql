-- Relación Plan–Actividad del modelo de dominio: un plan incluye actividades
-- y un socio solo reserva clases de las actividades de su plan.

-- CreateTable
CREATE TABLE `_ActividadToPlan` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ActividadToPlan_AB_unique`(`A`, `B`),
    INDEX `_ActividadToPlan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrar datos: los planes existentes incluyen todas las actividades, para no
-- bloquear reservas. El admin ajusta las asociaciones después.
INSERT INTO `_ActividadToPlan` (`A`, `B`)
SELECT a.`id`, p.`idPlan` FROM `Actividad` a CROSS JOIN `Plan` p;

-- AddForeignKey
ALTER TABLE `_ActividadToPlan` ADD CONSTRAINT `_ActividadToPlan_A_fkey` FOREIGN KEY (`A`) REFERENCES `Actividad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ActividadToPlan` ADD CONSTRAINT `_ActividadToPlan_B_fkey` FOREIGN KEY (`B`) REFERENCES `Plan`(`idPlan`) ON DELETE CASCADE ON UPDATE CASCADE;
