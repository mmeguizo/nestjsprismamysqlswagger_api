/*
  Warnings:

  - You are about to alter the column `campus` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `campus` ENUM('TALISAY', 'BINALBAGAN', 'FORTUNE_TOWN', 'ALIJIS') NOT NULL DEFAULT 'TALISAY';
