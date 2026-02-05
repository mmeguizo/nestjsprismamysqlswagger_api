/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `faculty_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campus` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_created_at_idx` ON `users`;

-- DropIndex
DROP INDEX `users_faculty_id_key` ON `users`;

-- DropIndex
DROP INDEX `users_role_idx` ON `users`;

-- DropIndex
DROP INDEX `users_status_idx` ON `users`;

-- DropIndex
DROP INDEX `users_student_id_key` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `avatar_url`,
    DROP COLUMN `deleted_at`,
    DROP COLUMN `faculty_id`,
    DROP COLUMN `phone_number`,
    DROP COLUMN `student_id`,
    ADD COLUMN `campus` VARCHAR(100) NOT NULL,
    ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `department_id` VARCHAR(50) NULL,
    ADD COLUMN `director_id` VARCHAR(50) NULL,
    ADD COLUMN `director_name` VARCHAR(200) NULL,
    ADD COLUMN `office_head_id` VARCHAR(50) NULL,
    ADD COLUMN `office_head_name` VARCHAR(200) NULL,
    ADD COLUMN `profile_pic` VARCHAR(500) NOT NULL DEFAULT 'no-photo.png',
    ADD COLUMN `username` VARCHAR(100) NOT NULL,
    ADD COLUMN `vice_president_id` VARCHAR(50) NULL,
    ADD COLUMN `vice_president_name` VARCHAR(200) NULL,
    MODIFY `role` ENUM('ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'DIRECTOR', 'OFFICE_HEAD') NOT NULL DEFAULT 'OFFICE_HEAD',
    MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

-- CreateIndex
CREATE INDEX `users_username_idx` ON `users`(`username`);

-- CreateIndex
CREATE INDEX `users_deleted_role_idx` ON `users`(`deleted`, `role`);

-- CreateIndex
CREATE INDEX `users_deleted_status_idx` ON `users`(`deleted`, `status`);

-- CreateIndex
CREATE INDEX `users_director_id_deleted_idx` ON `users`(`director_id`, `deleted`);

-- CreateIndex
CREATE INDEX `users_vice_president_id_deleted_idx` ON `users`(`vice_president_id`, `deleted`);

-- CreateIndex
CREATE INDEX `users_department_id_deleted_idx` ON `users`(`department_id`, `deleted`);

-- CreateIndex
CREATE INDEX `users_created_at_idx` ON `users`(`created_at` DESC);
