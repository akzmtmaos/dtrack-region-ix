-- DOH Document Tracking System
-- Core MySQL tables for Laravel + XAMPP
-- Source: backend/database/migrations/2025_03_25_000000_doh_tracking_tables.php

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_code` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `middle_name` VARCHAR(255) NOT NULL DEFAULT '',
  `office` VARCHAR(255) NULL,
  `user_password` TEXT NOT NULL,
  `user_level` VARCHAR(255) NOT NULL,
  `office_representative` VARCHAR(255) NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_employee_code_unique` (`employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `profiles` (
  `id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NULL,
  `full_name` VARCHAR(255) NULL,
  `employee_code` VARCHAR(255) NULL,
  `office` VARCHAR(255) NULL,
  `user_level` VARCHAR(255) NULL,
  `office_representative` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `profiles_employee_code_index` (`employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `action_required` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `action_required` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `action_officer` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_code` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `middle_name` VARCHAR(255) NOT NULL DEFAULT '',
  `office` VARCHAR(255) NULL,
  `user_password` TEXT NOT NULL,
  `user_level` VARCHAR(255) NOT NULL,
  `office_representative` VARCHAR(255) NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `action_taken` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `action_taken` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `document_type` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_type` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `document_action_required_days` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_type` VARCHAR(255) NOT NULL,
  `action_required` VARCHAR(255) NOT NULL,
  `required_days` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `office` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `office` VARCHAR(255) NOT NULL,
  `region` VARCHAR(255) NULL,
  `short_name` VARCHAR(255) NULL,
  `head_office` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `region` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `region_name` VARCHAR(255) NOT NULL,
  `nscb_code` VARCHAR(255) NOT NULL,
  `nscb_name` VARCHAR(255) NOT NULL,
  `added_by` VARCHAR(255) NOT NULL,
  `status` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_levels` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_level_name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `document_source` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_control_no` VARCHAR(255) NOT NULL DEFAULT '',
  `route_no` VARCHAR(255) NOT NULL DEFAULT '',
  `subject` TEXT NULL,
  `document_type` VARCHAR(255) NULL,
  `source_type` VARCHAR(255) NULL,
  `internal_originating_office` TEXT NULL,
  `internal_originating_employee` TEXT NULL,
  `external_originating_office` TEXT NULL,
  `external_originating_employee` TEXT NULL,
  `no_of_pages` VARCHAR(255) NULL,
  `attached_document_filename` VARCHAR(255) NULL,
  `attachment_list` TEXT NULL,
  `userid` VARCHAR(255) NULL,
  `current_custodian` VARCHAR(255) NULL,
  `in_sequence` VARCHAR(255) NULL,
  `remarks` TEXT NULL,
  `deleted_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `document_destination` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_source_id` BIGINT UNSIGNED NOT NULL,
  `document_control_no` VARCHAR(255) NOT NULL DEFAULT '',
  `route_no` VARCHAR(255) NOT NULL DEFAULT '',
  `sequence_no` INT NOT NULL DEFAULT 0,
  `destination_office` VARCHAR(255) NULL,
  `employee_action_officer` TEXT NULL,
  `action_required` VARCHAR(255) NULL,
  `date_released` VARCHAR(255) NULL,
  `time_released` VARCHAR(255) NULL,
  `date_required` VARCHAR(255) NULL,
  `time_required` VARCHAR(255) NULL,
  `date_received` VARCHAR(255) NULL,
  `time_received` VARCHAR(255) NULL,
  `remarks` TEXT NULL,
  `action_taken` VARCHAR(255) NULL,
  `remarks_on_action_taken` TEXT NULL,
  `date_acted_upon` VARCHAR(255) NULL,
  `time_acted_upon` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `document_destination_document_source_id_foreign` (`document_source_id`),
  CONSTRAINT `document_destination_document_source_id_foreign`
    FOREIGN KEY (`document_source_id`) REFERENCES `document_source` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
