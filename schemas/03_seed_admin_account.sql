-- Default Administrator account for Laravel API login
-- Employee code: ADMIN
-- Password:    H0wy0ul1keth4t!   (bcrypt below — change password after first login in production)
--
-- Run after 01_core_tables.sql (and migrations). Safe to re-run: upserts on employee_code.

SET NAMES utf8mb4;

INSERT INTO `users` (
  `employee_code`,
  `last_name`,
  `first_name`,
  `middle_name`,
  `office`,
  `user_password`,
  `user_level`,
  `office_representative`,
  `verified`,
  `created_at`,
  `updated_at`
) VALUES (
  'ADMIN',
  'Administrator',
  'System',
  '-',
  NULL,
  '$2y$10$.z0qEkIa.up6LbhEmkXBseX0QvK78IDae1fbtcYLgfi1g.QS62gs2',
  'Administrator',
  'No',
  1,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `last_name` = VALUES(`last_name`),
  `first_name` = VALUES(`first_name`),
  `middle_name` = VALUES(`middle_name`),
  `user_password` = VALUES(`user_password`),
  `user_level` = VALUES(`user_level`),
  `office_representative` = VALUES(`office_representative`),
  `verified` = VALUES(`verified`),
  `updated_at` = VALUES(`updated_at`);
