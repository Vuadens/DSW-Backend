/*
  Warnings:

  - The primary key for the `Plan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `idPlan` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Plan` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `idPlan` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `tipo` VARCHAR(191) NULL,
    MODIFY `duracionMeses` INTEGER NULL DEFAULT 1,
    ADD PRIMARY KEY (`idPlan`);
