-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('STUDENT', 'FACULTY', 'STAFF', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'STUDENT',
    `status` ENUM('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `student_id` VARCHAR(50) NULL,
    `faculty_id` VARCHAR(50) NULL,
    `department` VARCHAR(100) NULL,
    `phone_number` VARCHAR(20) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `last_login_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_student_id_key`(`student_id`),
    UNIQUE INDEX `users_faculty_id_key`(`faculty_id`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
