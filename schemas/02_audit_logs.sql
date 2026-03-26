-- DOH Document Tracking System
-- Audit trail table for Laravel + XAMPP
-- Source: backend/database/migrations/2026_03_25_000001_create_audit_logs_table.php

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_type` VARCHAR(255) NOT NULL,
  `entity_type` VARCHAR(255) NOT NULL,
  `entity_id` BIGINT UNSIGNED NULL,
  `document_source_id` BIGINT UNSIGNED NULL,
  `document_control_no` VARCHAR(255) NOT NULL DEFAULT '',
  `route_no` VARCHAR(255) NOT NULL DEFAULT '',
  `actor_employee_code` VARCHAR(255) NOT NULL DEFAULT '',
  `actor_display_name` VARCHAR(255) NOT NULL DEFAULT '',
  `owner_employee_code` VARCHAR(255) NOT NULL DEFAULT '',
  `meta` JSON NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_document_source_id_index` (`document_source_id`),
  KEY `audit_logs_document_control_no_index` (`document_control_no`),
  KEY `audit_logs_route_no_index` (`route_no`),
  KEY `audit_logs_actor_employee_code_index` (`actor_employee_code`),
  KEY `audit_logs_owner_employee_code_index` (`owner_employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
