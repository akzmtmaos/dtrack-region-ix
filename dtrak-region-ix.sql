-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 30, 2026 at 03:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dtrak-region-ix`
--

-- --------------------------------------------------------

--
-- Table structure for table `action_officer`
--

CREATE TABLE `action_officer` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_code` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) NOT NULL DEFAULT '',
  `office` varchar(255) DEFAULT NULL,
  `user_password` text NOT NULL,
  `user_level` varchar(255) NOT NULL,
  `office_representative` varchar(255) DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `action_required`
--

CREATE TABLE `action_required` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `action_required` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `action_required`
--

INSERT INTO `action_required` (`id`, `action_required`, `created_at`, `updated_at`) VALUES
(1, 'For Initial', '2026-01-07 21:18:11', '2026-01-08 22:15:55'),
(2, 'For Signature', '2026-01-07 23:09:43', '2026-01-08 22:16:32'),
(4, 'For Review', '2026-01-08 00:26:21', '2026-01-08 22:17:34'),
(5, 'For Action', '2026-01-08 01:13:05', '2026-01-08 22:17:46'),
(6, 'For Information', '2026-01-08 01:13:14', '2026-01-08 22:17:52'),
(7, 'For Processing', '2026-01-08 01:13:21', '2026-01-08 22:18:05'),
(8, 'For Release', '2026-01-08 22:18:33', '2026-01-08 22:18:33'),
(9, 'For Filing', '2026-01-08 22:18:48', '2026-01-08 22:18:48'),
(10, 'For Delivery', '2026-01-08 22:19:51', '2026-01-08 22:19:51'),
(11, 'For Mailing', '2026-01-08 22:20:04', '2026-01-08 22:20:04'),
(12, 'For Intranet Posting', '2026-01-08 23:49:27', '2026-01-08 23:49:27'),
(13, 'For Newspaper Publication', '2026-01-08 23:49:44', '2026-01-08 23:49:44'),
(14, 'For Internet Posting', '2026-01-08 23:50:00', '2026-01-08 23:50:00'),
(15, 'test only', '2026-01-08 23:50:14', '2026-01-08 23:50:14'),
(16, 'For Recommendation', '2026-01-08 23:50:25', '2026-01-08 23:50:25'),
(17, 'For Revision', '2026-01-08 23:50:36', '2026-01-08 23:50:36'),
(18, 'For Finalization', '2026-01-08 23:51:00', '2026-01-08 23:51:00'),
(19, 'For Discussion / Meeting', '2026-01-08 23:52:44', '2026-01-08 23:52:44'),
(20, 'For Clearance', '2026-01-08 23:52:58', '2026-01-08 23:52:58'),
(21, 'For Draft Reply', '2026-01-08 23:53:14', '2026-01-08 23:53:14'),
(22, 'For CAF Issuance', '2026-01-08 23:57:54', '2026-01-08 23:57:54'),
(23, 'For Filling Up Forms', '2026-01-09 00:16:42', '2026-01-09 00:16:42'),
(24, 'For Coordination', '2026-01-09 00:16:50', '2026-01-09 00:16:50'),
(25, 'For Registry', '2026-01-09 00:16:58', '2026-01-09 00:16:58'),
(26, 'For Draft Message', '2026-01-09 00:17:11', '2026-01-09 00:17:11'),
(27, 'For Correction', '2026-01-11 22:27:33', '2026-01-11 23:41:49'),
(28, 'For Submission', '2026-01-11 23:43:35', '2026-01-11 23:43:35'),
(29, 'For Legal Action', '2026-01-12 19:05:23', '2026-01-12 19:05:23'),
(30, 'For Reference', '2026-01-12 19:05:48', '2026-01-12 19:05:48'),
(31, 'For Approval', '2026-01-12 19:12:44', '2026-01-12 19:12:44'),
(32, 'For Shopping', '2026-01-12 19:27:55', '2026-01-12 19:27:55'),
(33, 'For Inspection', '2026-01-12 19:28:02', '2026-01-12 19:28:02'),
(34, 'For Re-Evaluation', '2026-01-12 19:28:14', '2026-01-12 19:28:14'),
(35, 'For Processing - LTO', '2026-01-12 19:28:24', '2026-01-12 19:28:24'),
(36, 'For Processing - CA', '2026-01-12 19:28:39', '2026-01-12 19:28:39'),
(37, 'For Evaluation', '2026-01-12 19:28:49', '2026-01-12 19:28:49'),
(38, 'For Monitoring', '2026-01-12 19:28:58', '2026-01-12 19:28:58'),
(39, 'For Distribution', '2026-01-12 19:29:13', '2026-01-12 19:29:13'),
(40, 'For Dissemination', '2026-01-12 19:29:23', '2026-01-12 19:29:23'),
(41, 'For Certification', '2026-01-12 22:06:38', '2026-01-12 22:06:38'),
(42, 'For Action Taken', '2026-01-12 22:06:45', '2026-01-12 22:06:45'),
(43, 'For Audit (ICU)', '2026-01-12 22:07:13', '2026-01-12 22:07:13'),
(44, 'For Budget Allocation', '2026-01-12 22:07:20', '2026-01-12 22:07:20'),
(45, 'For Verification', '2026-01-12 22:07:30', '2026-01-12 22:07:30'),
(46, 'For Screening', '2026-01-12 22:07:38', '2026-01-12 22:07:38'),
(47, 'For Cheque Issuance', '2026-01-12 22:08:01', '2026-01-12 22:08:01'),
(48, 'For ICU', '2026-01-12 22:08:09', '2026-01-12 22:08:09'),
(49, 'For Implementation', '2026-01-12 22:08:18', '2026-01-12 22:08:18'),
(50, 'For Acceptance of Delivery', '2026-01-12 22:09:17', '2026-01-12 22:09:17'),
(51, 'For Mode of Procurement', '2026-01-12 22:09:32', '2026-01-12 22:09:32'),
(52, 'For RFQ', '2026-01-12 22:09:40', '2026-01-12 22:09:40'),
(53, 'For Awarding', '2026-01-12 22:09:49', '2026-01-12 22:09:49'),
(54, 'For Preparation of P.O.', '2026-01-12 22:10:05', '2026-01-12 22:10:05'),
(55, 'For ObR', '2026-01-12 22:10:15', '2026-01-12 22:10:15'),
(56, 'For Cheque Preparation', '2026-01-12 22:10:31', '2026-01-12 22:10:31'),
(57, 'For Funding', '2026-01-12 22:10:40', '2026-01-12 22:10:40'),
(58, 'For Provision of Copies', '2026-01-12 22:10:54', '2026-01-12 22:10:54'),
(59, 'For Receipt of Delivery', '2026-01-12 22:11:05', '2026-01-12 22:11:05'),
(60, 'For Scheduling', '2026-01-12 22:11:16', '2026-01-12 22:11:16'),
(61, 'For Consolidation', '2026-01-12 22:11:30', '2026-01-12 22:11:30'),
(62, 'For PR Numbering', '2026-01-12 22:11:46', '2026-01-12 22:11:46'),
(63, 'For Notarization', '2026-01-12 22:11:57', '2026-01-12 22:11:57'),
(64, 'For Receive', '2026-01-12 22:12:06', '2026-01-12 22:12:06');

-- --------------------------------------------------------

--
-- Table structure for table `action_taken`
--

CREATE TABLE `action_taken` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `action_taken` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `action_taken`
--

INSERT INTO `action_taken` (`id`, `action_taken`, `created_at`, `updated_at`) VALUES
(1, 'Delivered', '2026-01-08 17:02:57', '2026-01-11 22:29:30'),
(2, 'Mailed', '2026-01-11 22:29:36', '2026-01-11 22:29:36'),
(3, 'Filed', '2026-01-11 22:29:44', '2026-01-11 22:29:44'),
(4, 'Released', '2026-01-11 22:29:54', '2026-01-11 22:29:54'),
(5, 'Processed', '2026-01-11 22:30:14', '2026-01-11 22:30:14'),
(6, 'Informed', '2026-01-11 22:30:25', '2026-01-11 22:30:25'),
(7, 'Return to Sender', '2026-01-11 22:30:47', '2026-01-11 22:30:47'),
(8, 'Changed', '2026-01-29 23:00:02', '2026-01-29 23:00:02'),
(9, 'Commented', '2026-01-29 23:00:09', '2026-01-29 23:00:09'),
(10, 'Reviewed', '2026-01-29 23:00:19', '2026-01-29 23:00:19'),
(11, 'Initialed', '2026-01-29 23:00:31', '2026-01-29 23:00:31'),
(12, 'Signed', '2026-01-29 23:00:43', '2026-01-29 23:00:43'),
(13, 'Posted', '2026-01-29 23:01:12', '2026-01-29 23:01:12'),
(14, 'Published', '2026-01-29 23:01:20', '2026-01-29 23:01:20'),
(15, 'test', '2026-01-29 23:01:50', '2026-01-29 23:01:50'),
(16, 'Forwarded', '2026-01-29 23:02:05', '2026-01-29 23:02:05'),
(17, 'Submitted', '2026-01-29 23:04:43', '2026-01-29 23:04:43'),
(18, 'Cancelled', '2026-01-29 23:04:53', '2026-01-29 23:04:53'),
(19, 'Discussed', '2026-01-29 23:05:02', '2026-01-29 23:05:02'),
(20, 'Revised', '2026-01-29 23:05:46', '2026-01-29 23:05:46'),
(21, 'Finalized', '2026-01-29 23:05:51', '2026-01-29 23:05:51'),
(22, 'Recommendations Given', '2026-01-29 23:06:11', '2026-01-29 23:06:11'),
(23, 'Cleared', '2026-01-29 23:06:23', '2026-01-29 23:06:23'),
(24, 'Reply Drafted', '2026-01-29 23:06:29', '2026-01-29 23:06:29'),
(25, 'CAF Issued', '2026-01-29 23:06:39', '2026-01-29 23:06:39'),
(26, 'Forms Filled Up', '2026-01-29 23:06:52', '2026-01-29 23:06:52'),
(27, 'Registered', '2026-01-29 23:07:00', '2026-01-29 23:07:00'),
(28, 'Numbered', '2026-01-29 23:07:11', '2026-01-29 23:07:11'),
(29, 'Corrected', '2026-01-29 23:14:19', '2026-01-29 23:14:19'),
(30, 'Coordinated', '2026-01-29 23:14:28', '2026-01-29 23:14:28'),
(31, 'Approved', '2026-01-29 23:14:46', '2026-01-29 23:14:46'),
(32, 'Shopped', '2026-01-29 23:20:53', '2026-01-29 23:20:53'),
(33, 'Evaluated and Approved', '2026-01-29 23:27:46', '2026-01-29 23:27:46'),
(34, 'Evaluated and Disapproved', '2026-01-29 23:28:05', '2026-01-29 23:28:05'),
(35, 'Monitored with Findings', '2026-01-29 23:28:19', '2026-01-29 23:28:19'),
(36, 'Monitored without Findings', '2026-01-29 23:28:38', '2026-01-29 23:28:38'),
(37, 'Re-Evaluated', '2026-01-29 23:28:47', '2026-01-29 23:28:47'),
(38, 'Inspected', '2026-01-29 23:28:53', '2026-01-29 23:28:53'),
(39, 'Processed LTO', '2026-01-29 23:29:07', '2026-01-29 23:29:07'),
(40, 'Processed CA', '2026-01-29 23:37:08', '2026-01-29 23:37:08'),
(41, 'Released thru Postal Mail', '2026-01-29 23:37:27', '2026-01-29 23:43:14'),
(42, 'Released thru Courier', '2026-01-29 23:41:17', '2026-01-29 23:43:19'),
(43, 'Released thru Walk-In Applicant', '2026-01-29 23:43:10', '2026-01-29 23:43:10'),
(44, 'Distributed', '2026-01-29 23:49:17', '2026-01-29 23:49:17'),
(45, 'Disseminated', '2026-01-29 23:53:11', '2026-01-29 23:53:21'),
(46, 'Certified', '2026-01-29 23:56:36', '2026-01-29 23:56:36'),
(47, 'Action Taken', '2026-01-29 23:56:47', '2026-01-29 23:56:47'),
(48, 'Audited', '2026-01-29 23:56:54', '2026-01-29 23:56:54'),
(49, 'Budget Allocated', '2026-01-29 23:57:03', '2026-01-29 23:57:03'),
(50, 'Implemented', '2026-01-29 23:57:10', '2026-01-29 23:57:10'),
(51, 'Cheque Issued', '2026-01-29 23:57:18', '2026-01-29 23:57:18'),
(52, 'Verified', '2026-01-29 23:57:24', '2026-01-29 23:57:24'),
(53, 'Delivery Accepted', '2026-01-30 00:08:59', '2026-01-30 00:08:59'),
(54, 'Mode of Procurement Selected', '2026-01-30 00:09:12', '2026-01-30 00:09:12'),
(55, 'RFQ Prepared', '2026-01-30 00:25:00', '2026-01-30 00:25:00'),
(56, 'Awarded', '2026-01-30 01:00:21', '2026-01-30 01:00:21'),
(57, 'Purchase Order Prepared', '2026-01-30 01:00:44', '2026-01-30 01:00:44'),
(58, 'ObR Prepared', '2026-01-30 01:00:58', '2026-01-30 01:00:58'),
(59, 'Cheque Prepared', '2026-01-30 01:01:50', '2026-01-30 01:01:50'),
(60, 'Funded', '2026-01-30 01:02:01', '2026-01-30 01:02:01'),
(61, 'Copy Provided', '2026-01-30 01:02:14', '2026-01-30 01:02:14'),
(62, 'Copies Provided', '2026-01-30 01:03:39', '2026-01-30 01:03:39'),
(63, 'Delivery Received', '2026-01-30 01:03:51', '2026-01-30 01:03:51'),
(64, 'Scheduled', '2026-01-30 01:04:28', '2026-01-30 01:04:28'),
(65, 'Consolidated', '2026-01-30 01:04:41', '2026-01-30 01:04:41'),
(66, 'Filled Up', '2026-01-30 01:04:50', '2026-01-30 01:04:50'),
(67, 'Evaluated', '2026-01-30 01:05:00', '2026-01-30 01:05:00'),
(68, 'Screened', '2026-01-30 01:05:08', '2026-01-30 01:05:08'),
(69, 'Notarized', '2026-01-30 01:05:28', '2026-01-30 01:05:28'),
(70, 'Returned', '2026-01-30 01:05:40', '2026-01-30 01:05:40'),
(71, 'Received', '2026-01-30 01:05:45', '2026-01-30 01:05:45');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_type` varchar(255) NOT NULL,
  `entity_type` varchar(255) NOT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `document_source_id` bigint(20) UNSIGNED DEFAULT NULL,
  `document_control_no` varchar(255) NOT NULL DEFAULT '',
  `route_no` varchar(255) NOT NULL DEFAULT '',
  `actor_employee_code` varchar(255) NOT NULL DEFAULT '',
  `actor_display_name` varchar(255) NOT NULL DEFAULT '',
  `owner_employee_code` varchar(255) NOT NULL DEFAULT '',
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `event_type`, `entity_type`, `entity_id`, `document_source_id`, `document_control_no`, `route_no`, `actor_employee_code`, `actor_display_name`, `owner_employee_code`, `meta`, `created_at`, `updated_at`) VALUES
(1, 'document.created', 'document_source', 21, 21, 'DC-2026-00021', 'R2026-000000020', 'ADMIN', '', 'ADMIN', '{\"subject\":\"Subject 1\",\"documentType\":\"Abstract of Canvas\",\"sourceType\":\"Internal\"}', '2026-03-25 03:14:31', '2026-03-25 03:14:31'),
(2, 'document.attachment_uploaded', 'document_source', 21, 21, 'DC-2026-00021', 'R2026-000000020', 'ADMIN', '', 'ADMIN', '{\"filename\":\"CAP 101 - Reports.docx\",\"path\":\"21\\/6d004586-bf1c-4099-a5fd-60481891a7b0_CAP 101 - Reports.docx\"}', '2026-03-25 03:14:37', '2026-03-25 03:14:37'),
(3, 'document.updated', 'document_source', 21, 21, 'DC-2026-00021', 'R2026-000000020', 'ADMIN', '', 'ADMIN', '{\"changedFields\":[\"external_originating_office\",\"external_originating_employee\",\"attachment_list\",\"in_sequence\"]}', '2026-03-25 03:14:37', '2026-03-25 03:14:37'),
(4, 'document.created', 'document_source', 22, 22, 'DC-2026-00022', 'R2026-000000021', 'ADMIN', '', 'ADMIN', '{\"subject\":\"prac report\",\"documentType\":\"Abstract of Canvas\",\"sourceType\":\"Internal\"}', '2026-03-25 16:02:48', '2026-03-25 16:02:48'),
(5, 'document.attachment_uploaded', 'document_source', 22, 22, 'DC-2026-00022', 'R2026-000000021', 'ADMIN', '', 'ADMIN', '{\"filename\":\"RAMOS PRACTICUM REPORT.docx\",\"path\":\"22\\/f51366c8-4a77-4efd-9432-daab0cf25d67_RAMOS PRACTICUM REPORT.docx\"}', '2026-03-25 16:02:51', '2026-03-25 16:02:51'),
(6, 'document.updated', 'document_source', 22, 22, 'DC-2026-00022', 'R2026-000000021', 'ADMIN', '', 'ADMIN', '{\"changedFields\":[\"external_originating_office\",\"external_originating_employee\",\"attachment_list\",\"in_sequence\"]}', '2026-03-25 16:02:51', '2026-03-25 16:02:51'),
(7, 'document.deleted', 'document_source', 9, 9, 'DC-2026-00009', 'R2026-000000010', 'AO-0002', '', 'ADMIN', '{\"mode\":\"trash\"}', '2026-03-25 17:45:05', '2026-03-25 17:45:05');

-- --------------------------------------------------------

--
-- Table structure for table `document_action_required_days`
--

CREATE TABLE `document_action_required_days` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_type` varchar(255) NOT NULL,
  `action_required` varchar(255) NOT NULL,
  `required_days` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_action_required_days`
--

INSERT INTO `document_action_required_days` (`id`, `document_type`, `action_required`, `required_days`, `created_at`, `updated_at`) VALUES
(1, 'Certificate System Acceptance', 'For Action', 2, '2026-01-08 17:31:24', '2026-01-11 23:20:11'),
(2, 'Document Test 1', 'For Testing Purposes 6', 16, '2026-01-08 17:34:18', '2026-01-08 17:34:18'),
(3, 'Report', 'For Testing Purposes 1', 2, '2026-01-08 22:00:16', '2026-01-08 22:00:16'),
(4, 'Test Document Report', 'For Review', 1, '2026-01-08 22:20:37', '2026-01-08 22:20:37'),
(5, 'Gate / Building Pass', 'For Signature', 3, '2026-01-27 23:44:56', '2026-01-27 23:44:56'),
(6, 'Advertising Invoice', 'For Processing', 12, '2026-01-27 23:45:12', '2026-01-27 23:45:12');

-- --------------------------------------------------------

--
-- Table structure for table `document_destination`
--

CREATE TABLE `document_destination` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_source_id` bigint(20) UNSIGNED NOT NULL,
  `document_control_no` varchar(255) NOT NULL DEFAULT '',
  `route_no` varchar(255) NOT NULL DEFAULT '',
  `sequence_no` int(11) NOT NULL DEFAULT 0,
  `destination_office` varchar(255) DEFAULT NULL,
  `employee_action_officer` text DEFAULT NULL,
  `action_required` varchar(255) DEFAULT NULL,
  `date_released` varchar(255) DEFAULT NULL,
  `time_released` varchar(255) DEFAULT NULL,
  `date_required` varchar(255) DEFAULT NULL,
  `time_required` varchar(255) DEFAULT NULL,
  `date_received` varchar(255) DEFAULT NULL,
  `time_received` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `action_taken` varchar(255) DEFAULT NULL,
  `remarks_on_action_taken` text DEFAULT NULL,
  `date_acted_upon` varchar(255) DEFAULT NULL,
  `time_acted_upon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_destination`
--

INSERT INTO `document_destination` (`id`, `document_source_id`, `document_control_no`, `route_no`, `sequence_no`, `destination_office`, `employee_action_officer`, `action_required`, `date_released`, `time_released`, `date_required`, `time_required`, `date_received`, `time_received`, `remarks`, `action_taken`, `remarks_on_action_taken`, `date_acted_upon`, `time_acted_upon`, `created_at`, `updated_at`) VALUES
(7, 2, 'DC-2026-00002', 'R2026-000000001', 1, 'ARD - Health Facility Development Unit', 'test', 'For Acceptance of Delivery', '2026-02-20', '15:56:00', '2026-02-28', '15:56:00', NULL, NULL, 'test', '', '', NULL, NULL, '2026-02-18 23:57:06', '2026-02-18 23:57:06'),
(8, 2, 'DC-2026-00002', 'R2026-000000002', 2, 'Assistant Regional Director', 'test again', 'For Acceptance of Delivery', '2026-02-27', '15:58:00', '2026-02-27', '21:58:00', NULL, NULL, 'test', '', '', NULL, NULL, '2026-02-18 23:58:13', '2026-02-18 23:58:13'),
(9, 12, 'DC-2026-00012', 'R2026-000000003', 1, 'MSD - Personnel', 'DOH-0001', 'For Receive', '2026-03-24', '14:31:00', '2026-03-30', '15:31:00', '2026-03-23', '12:42:01', 'pass', '', '', NULL, NULL, '2026-03-22 20:32:02', '2026-03-22 20:42:05'),
(10, 13, 'DC-2026-00013', 'R2026-000000004', 1, 'MSD - Personnel', 'Mark Anthony D. Ramos (DOH-0001)', 'For Receive', '2026-03-24', '14:32:00', '2026-03-24', '16:32:00', '2026-03-23', '13:34:33', 'test', '', '', NULL, NULL, '2026-03-22 21:32:46', '2026-03-22 21:34:36'),
(11, 16, 'DC-2026-00016', 'R2026-000000005', 1, 'MSD - Personnel', 'Mark Anthony D. Ramos (DOH-0001)', 'For Action', '2026-03-29', '15:30', '2026-04-12', '15:30', NULL, NULL, 'test', '', '', NULL, NULL, '2026-03-24 21:33:46', '2026-03-24 21:33:46'),
(12, 18, 'DC-2026-00018', 'R2026-000000006', 1, 'MSD - Personnel', 'Mark Anthony D. Ramos (DOH-0001)', 'For Acceptance of Delivery', '2026-03-31', '15:30', '0026-04-12', '15:30', NULL, NULL, 'test', '', '', NULL, NULL, '2026-03-24 22:42:19', '2026-03-24 22:42:19');

-- --------------------------------------------------------

--
-- Table structure for table `document_source`
--

CREATE TABLE `document_source` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_control_no` varchar(255) NOT NULL DEFAULT '',
  `route_no` varchar(255) NOT NULL DEFAULT '',
  `subject` text DEFAULT NULL,
  `document_type` varchar(255) DEFAULT NULL,
  `source_type` varchar(255) DEFAULT NULL,
  `internal_originating_office` text DEFAULT NULL,
  `internal_originating_employee` text DEFAULT NULL,
  `external_originating_office` text DEFAULT NULL,
  `external_originating_employee` text DEFAULT NULL,
  `no_of_pages` varchar(255) DEFAULT NULL,
  `attached_document_filename` varchar(255) DEFAULT NULL,
  `attachment_list` text DEFAULT NULL,
  `userid` varchar(255) DEFAULT NULL,
  `current_custodian` varchar(255) DEFAULT NULL,
  `in_sequence` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_source`
--

INSERT INTO `document_source` (`id`, `document_control_no`, `route_no`, `subject`, `document_type`, `source_type`, `internal_originating_office`, `internal_originating_employee`, `external_originating_office`, `external_originating_employee`, `no_of_pages`, `attached_document_filename`, `attachment_list`, `userid`, `current_custodian`, `in_sequence`, `remarks`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'DC-2026-00001', 'R2026-000000001', 'Weekly Report', 'Abstract of Canvas', 'Internal', '1', '1', '', '', '2', 'weeklyReport6_gabionzq.docx', '', '', '', '', 'test', NULL, '2026-02-02 19:20:11', '2026-03-22 10:32:10'),
(2, 'DC-2026-00002', 'R2026-000000002', 'Weekly Report 2', 'Abstract of Canvas', 'Internal', 'LGU - Local Govenment Unit', '1', '', '', '5', 'Speaker-certificate-1.pdf.png', '', '', '', '', 'teat', NULL, '2026-02-10 00:18:49', '2026-03-22 10:32:10'),
(3, 'DC-2026-00003', 'R2026-000000003', 'TEST 2', 'Acknowledgement Receipt of Equipment', 'Internal', 'CDOHO - Isabela City', '123', '', '', '5', 'weeklyReport8_Gabionza.docx', '', '', '', '', 'erm', '2026-03-22 09:00:56', '2026-02-17 20:58:50', '2026-03-22 10:32:10'),
(4, 'DC-2026-00004', 'R2026-000000004', 'Weekly Report 6', 'Agency Procurement Request', 'Internal', 'LHSD', 'test', '', '', '5', 'document_type_rows.csv', '', '', '', '', 'test', NULL, '2026-02-18 23:59:54', '2026-03-22 10:32:10'),
(5, 'DC-2026-00005', 'R2026-000000006', 'Subject 1', 'Advertising Quotation', 'Internal', 'Assistant Regional Director', 'test', '', '', '5', 'document_type_rows.csv', '', '', '', '', 'test', NULL, '2026-02-19 00:03:11', '2026-03-22 10:32:10'),
(6, 'DC-2026-00006', 'R2026-000000007', 'Waiver', 'Advertising Quotation', 'External', '', '', 'Regional Director', 'test', '2', 'OJT-WAIVER-OverTime-waiver (1).docx', '', '', '', '', 'test', NULL, '2026-02-19 00:11:21', '2026-03-22 10:32:10'),
(7, 'DC-2026-00007', 'R2026-000000008', 'Weekly Report 10', 'Abstract of Canvas', 'Internal', 'ARD - Health Facility Development Unit', '1', '', '', '2', 'OJT-WAIVER-OverTime-waiver (1).docx', '', '', '', '', 'test', NULL, '2026-02-19 01:01:11', '2026-03-22 10:32:10'),
(8, 'DC-2026-00008', 'R2026-000000009', 'Mark\'s Report', 'Inventory Report', 'Internal', 'LGU - Local Govenment Unit', '1', '', '', '5', 'Routing-Form.docx', '', 'DOH-0001', 'DOH-0001', '', 'test', NULL, '2026-03-08 21:25:02', '2026-03-22 10:28:26'),
(9, 'DC-2026-00009', 'R2026-000000010', 'Subject 1', 'Abstract of Canvas', 'Internal', 'MSD - Personnel', 'Ramos, Mark Anthony D.', '', '', '4', '2-28-2025 - TO PRINT.docx', '9/5744ad7616d44e8bad954fd5fed93db6_2-28-2025 - TO PRINT.docx', 'ADMIN', 'ADMIN', '', 'to print', '2026-03-25 17:45:05', '2026-03-22 09:48:23', '2026-03-25 17:45:05'),
(10, 'DC-2026-00010', 'R2026-000000011', 'Subject 1', 'Application', 'Internal', 'MSD - Personnel', 'Ramos, Mark Anthony D.', '', '', '0', 'AIS 102 - Group 1.docx', '', 'ADMIN', 'ADMIN', '', 'test', NULL, '2026-03-22 17:36:11', '2026-03-22 17:36:11'),
(11, 'DC-2026-00011', 'R2026-000000012', 'download test', 'Application', 'Internal', 'MSD - Personnel', 'Ramos, Mark Anthony D.', '', '', '4', 'ACTIVITY PLAN - GROUP 4.docx', '11/cee56da1d2b74a7e9d5a63603b70af62_ACTIVITY PLAN - GROUP 4.docx', 'ADMIN', 'ADMIN', '', 'download test', NULL, '2026-03-22 19:09:06', '2026-03-22 19:09:09'),
(12, 'DC-2026-00012', 'R2026-000000013', 'Pilar Report', 'Abstract of Canvas', 'External', 'LHSD - Chief', 'III, Administrator', 'PCZC', 'sir mark', '10', 'RAMOS PRACTICUM REPORT.docx', '12/8f7e0a7e97224468b9f33c433979dd2b_RAMOS PRACTICUM REPORT.docx', 'ADMIN', 'DOH-0001', '', 'test', '2026-03-22 21:33:57', '2026-03-22 19:58:32', '2026-03-22 21:34:00'),
(13, 'DC-2026-00013', 'R2026-000000014', 'Weekly Report', 'Application', 'Internal', 'MSD - Personnel', 'Mark Anthony D. Ramos', '', '', '7', 'RAMOS PRACTICUM REPORT.docx', '', 'DOH-0001', 'Mark Anthony D. Ramos (DOH-0001)', '', 'test', NULL, '2026-03-22 21:30:49', '2026-03-22 21:34:37'),
(14, 'DCN-2026-000014', '', 'Subject 1', 'Abstract of Canvas', 'Internal', 'LHSD - Chief', 'III, Administrator', NULL, NULL, '2', 'cert.docx', '14/de2a791e-ec08-4fb9-9f88-a93fcfc3b535_cert.docx', 'ADMIN', 'ADMIN', NULL, 'test', '2026-03-24 22:41:16', '2026-03-24 19:40:58', '2026-03-24 22:41:16'),
(15, 'DC-2026-00015', '', 'Weekly Report', 'Abstract of Canvas', 'Internal', 'LHSD - Chief', 'III, Administrator', NULL, NULL, '12', 'aya tunes - lyrics.docx', '15/08509c64-d6d6-4ee5-ac36-a1eecb6e075e_aya tunes - lyrics.docx', 'ADMIN', 'ADMIN', NULL, 'test', NULL, '2026-03-24 21:26:51', '2026-03-24 21:26:51'),
(16, 'DC-2026-00016', 'R2026-000000015', 'route test', 'Abstract of Canvas', 'Internal', 'LHSD - Chief', 'III, Administrator', NULL, NULL, '14', 'CAP 101 - Reports.docx', '16/cc075522-0bed-4ca0-846d-3045efad43f9_CAP 101 - Reports.docx', 'ADMIN', 'ADMIN', NULL, 'test', NULL, '2026-03-24 21:31:21', '2026-03-24 21:31:22'),
(17, 'DC-2026-00017', 'R2026-000000016', 'inbox test', 'Abstract of Canvas', 'Internal', 'LHSD - Chief', 'III, Administrator', NULL, NULL, '11', 'CAP 101 - Reports.docx', '17/884b13f6-a3d0-4eb4-8f00-fd67d343a3b4_CAP 101 - Reports.docx', 'ADMIN', 'ADMIN', NULL, 'test', NULL, '2026-03-24 22:35:19', '2026-03-24 22:35:24'),
(18, 'DC-2026-00018', 'R2026-000000017', 'Weekly Report 2', 'Abstract of Quotation', 'Internal', 'LHSD - Chief', 'Test, Administrator', NULL, NULL, '4', 'CAP 101 - Reports.docx', '18/4e560c6d-6d94-497e-89e1-0474d2cbccac_CAP 101 - Reports.docx', 'ADMIN', 'ADMIN', NULL, 'test', NULL, '2026-03-24 22:41:30', '2026-03-25 01:51:38'),
(19, 'DC-2026-00019', 'R2026-000000018', 'Weekly Report 3', 'Abstract of Canvas', 'Internal', 'LHSD - Chief', 'Test, Administrator', '', '', '4', 'AIS 102 - Group 1.docx', '', 'ADMIN', 'ADMIN', '', 'test', NULL, '2026-03-25 01:53:26', '2026-03-25 01:53:26'),
(20, 'DC-2026-00020', 'R2026-000000019', 'Weekly Report 3', 'Abstract of Canvas', 'Internal', 'LHSD - Chief', 'Test, Administrator', '', '', '5', 'CAP 101 - Reports.docx', '', 'ADMIN', 'ADMIN', '', 'test', NULL, '2026-03-25 01:54:16', '2026-03-25 01:54:16'),
(21, 'DC-2026-00021', 'R2026-000000020', 'Subject 1', 'Abstract of Canvas', 'Internal', 'LHSD - Chief', 'Test, Administrator', NULL, NULL, '3', 'CAP 101 - Reports.docx', '21/6d004586-bf1c-4099-a5fd-60481891a7b0_CAP 101 - Reports.docx', 'ADMIN', 'ADMIN', NULL, 'test', NULL, '2026-03-25 03:14:31', '2026-03-25 03:14:37'),
(22, 'DC-2026-00022', 'R2026-000000021', 'prac report', 'Abstract of Canvas', 'Internal', 'LHSD', 'Admin Person', NULL, NULL, '4', 'RAMOS PRACTICUM REPORT.docx', '22/f51366c8-4a77-4efd-9432-daab0cf25d67_RAMOS PRACTICUM REPORT.docx', 'ADMIN', 'ADMIN', NULL, 'report', NULL, '2026-03-25 16:02:48', '2026-03-25 16:02:51');

-- --------------------------------------------------------

--
-- Table structure for table `document_type`
--

CREATE TABLE `document_type` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_type` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_type`
--

INSERT INTO `document_type` (`id`, `document_type`, `created_at`, `updated_at`) VALUES
(1, 'Memorandum', '2026-01-08 17:31:00', '2026-01-11 22:32:29'),
(2, 'Disbursement Voucher', '2026-01-11 22:40:40', '2026-01-11 22:41:04'),
(3, 'Land Line / Internet Service Provider', '2026-01-08 20:07:02', '2026-01-11 22:41:14'),
(4, 'Annual Procurement Plan', '2026-01-08 22:20:19', '2026-01-11 22:41:30'),
(5, 'Request and Issue Slip', '2026-01-11 22:39:22', '2026-01-11 22:41:45'),
(6, 'Purchase Order', '2026-01-11 22:40:50', '2026-01-11 22:42:15'),
(7, 'Job Order', '2026-01-11 22:42:23', '2026-01-11 22:42:23'),
(8, 'Contract', '2026-01-11 22:43:08', '2026-01-11 22:43:08'),
(9, 'Payroll', '2026-01-11 22:43:16', '2026-01-11 22:43:16'),
(10, 'Clearance', '2026-01-11 22:43:33', '2026-01-11 22:43:33'),
(11, 'Letter', '2026-01-11 22:43:42', '2026-01-11 22:43:42'),
(12, 'Service Order', '2026-01-11 22:44:11', '2026-01-11 22:44:11'),
(13, 'Leave Application', '2026-01-11 22:44:32', '2026-01-11 22:44:32'),
(14, 'Agency Procurement Request', '2026-01-11 22:44:48', '2026-01-11 22:44:48'),
(15, 'Delivery Receipt', '2026-01-11 22:45:28', '2026-01-11 22:45:28'),
(16, 'Inspection Report', '2026-01-11 22:45:37', '2026-01-11 22:45:37'),
(17, 'Reports', '2026-01-11 23:00:29', '2026-01-11 23:00:29'),
(18, 'Invoice Receipt of Property', '2026-01-11 23:00:48', '2026-01-11 23:00:48'),
(19, 'Memorandum Receipt', '2026-01-11 23:00:55', '2026-01-11 23:00:55'),
(20, 'Letter - Endorsement', '2026-01-11 23:01:14', '2026-01-11 23:01:14'),
(21, 'Other Documents', '2026-01-11 23:01:35', '2026-01-11 23:01:35'),
(22, 'Petty Cash Voucher', '2026-01-11 23:01:46', '2026-01-11 23:01:46'),
(23, 'Purchase Request', '2026-01-11 23:01:57', '2026-01-11 23:01:57'),
(24, 'Inspection & Acceptance Report', '2026-01-11 23:02:18', '2026-01-11 23:02:18'),
(25, 'Supplies Availability Inquiry', '2026-01-11 23:02:56', '2026-01-11 23:02:56'),
(26, 'Executive Order', '2026-01-11 23:03:41', '2026-01-11 23:03:41'),
(27, 'Department Personnel Order', '2026-01-11 23:04:00', '2026-01-11 23:04:00'),
(28, 'Memorandum Circular', '2026-01-11 23:04:12', '2026-01-11 23:04:12'),
(29, 'Appointment Paper', '2026-01-11 23:04:25', '2026-01-11 23:04:25'),
(30, 'Assets/Liabilities', '2026-01-11 23:04:38', '2026-01-11 23:04:38'),
(31, 'Legal Decision', '2026-01-11 23:04:48', '2026-01-11 23:04:48'),
(32, 'Service Record', '2026-01-11 23:05:20', '2026-01-11 23:05:20'),
(33, 'Request Financial Assistance', '2026-01-11 23:05:42', '2026-01-11 23:05:42'),
(34, 'Certificate Training / Diploma', '2026-01-11 23:06:09', '2026-01-11 23:06:09'),
(35, 'Application for LTO / Accreditation', '2026-01-11 23:06:34', '2026-01-11 23:06:34'),
(36, 'Monthly Statistical Report', '2026-01-11 23:06:56', '2026-01-11 23:06:56'),
(37, 'Complaints', '2026-01-11 23:07:13', '2026-01-11 23:07:13'),
(38, 'Permit to Construct', '2026-01-11 23:07:49', '2026-01-11 23:07:49'),
(39, 'Compliance', '2026-01-11 23:07:57', '2026-01-11 23:07:57'),
(40, 'Renewal / Initial', '2026-01-11 23:08:09', '2026-01-11 23:08:09'),
(41, 'Manual', '2026-01-11 23:08:31', '2026-01-11 23:08:31'),
(42, 'Position Paper', '2026-01-11 23:08:47', '2026-01-11 23:08:47'),
(43, 'Legislative Advisory', '2026-01-11 23:08:58', '2026-01-11 23:08:58'),
(44, 'Certificate System Acceptance', '2026-01-11 23:09:07', '2026-01-11 23:09:07'),
(45, 'Terms of Reference', '2026-01-11 23:09:15', '2026-01-11 23:09:15'),
(46, 'Travel Authority', '2026-01-11 23:09:29', '2026-01-11 23:09:29'),
(47, 'Memorandum of Agreement (MOA)', '2026-01-11 23:09:47', '2026-01-11 23:09:47'),
(48, 'Notice of Meeting', '2026-01-11 23:11:22', '2026-01-11 23:11:22'),
(49, 'Reimbursement', '2026-01-11 23:11:34', '2026-01-11 23:11:34'),
(50, 'Invitation', '2026-01-11 23:11:43', '2026-01-11 23:11:43'),
(51, 'TACT Clearance', '2026-01-11 23:11:53', '2026-01-11 23:11:53'),
(52, 'Proposal', '2026-01-11 23:12:00', '2026-01-11 23:12:00'),
(53, 'Travel Reimbursement', '2026-01-11 23:12:17', '2026-01-11 23:12:17'),
(54, 'Travel Liquidation', '2026-01-11 23:12:24', '2026-01-11 23:12:24'),
(55, 'Letter - Request', '2026-01-11 23:12:35', '2026-01-11 23:12:35'),
(56, 'Letter - Referral', '2026-01-11 23:12:47', '2026-01-11 23:12:47'),
(57, 'Indorsement', '2026-01-11 23:12:56', '2026-01-11 23:12:56'),
(58, 'Certificate of Undertaking', '2026-01-11 23:13:13', '2026-01-11 23:13:13'),
(59, 'Fund Transfer', '2026-01-11 23:13:22', '2026-01-11 23:13:22'),
(60, 'CAF', '2026-01-11 23:13:28', '2026-01-11 23:13:28'),
(61, 'Provision Request Form', '2026-01-11 23:13:40', '2026-01-11 23:13:40'),
(62, 'Service Legal Agreement', '2026-01-11 23:13:55', '2026-01-11 23:13:55'),
(63, 'Obligation Request', '2026-01-11 23:14:04', '2026-01-11 23:14:04'),
(64, 'Monthly Report of Attendance', '2026-01-11 23:14:16', '2026-01-11 23:14:16'),
(65, 'Contract of Service', '2026-01-11 23:14:24', '2026-01-11 23:14:24'),
(66, 'Certificate of Employment', '2026-01-11 23:14:35', '2026-01-11 23:14:35'),
(67, 'Cert of No Pending Admini Case', '2026-01-11 23:15:03', '2026-01-11 23:15:03'),
(68, 'Clearing House of Purchase Request', '2026-01-11 23:15:19', '2026-01-11 23:15:19'),
(69, 'Memo of Understanding (MOU)', '2026-01-11 23:15:30', '2026-01-11 23:15:30'),
(70, 'TACT Form', '2026-01-11 23:15:39', '2026-01-11 23:15:39'),
(71, 'HEARS', '2026-01-11 23:15:50', '2026-01-11 23:15:50'),
(72, 'HEARS Update', '2026-01-11 23:15:55', '2026-01-11 23:15:55'),
(73, 'Flash Report', '2026-01-11 23:16:08', '2026-01-11 23:16:08'),
(74, 'Post Mission Report', '2026-01-11 23:16:18', '2026-01-11 23:16:18'),
(75, 'Inventory Checklist', '2026-01-11 23:16:31', '2026-01-11 23:16:31'),
(76, 'Daily Monitoring & Endorsement', '2026-01-11 23:16:54', '2026-01-11 23:16:54'),
(77, 'Radio Base Checklist', '2026-01-11 23:20:38', '2026-01-11 23:20:38'),
(78, 'Vehicle Request Form', '2026-01-11 23:20:46', '2026-01-11 23:20:46'),
(79, 'Pre/Post Repair Inspection Rep', '2026-01-11 23:21:04', '2026-01-11 23:21:04'),
(80, 'Waste Material Report', '2026-01-11 23:21:17', '2026-01-11 23:21:17'),
(81, 'Vouchers', '2026-01-11 23:21:25', '2026-01-11 23:21:25'),
(82, 'Inventory Report', '2026-01-11 23:21:36', '2026-01-11 23:21:36'),
(83, 'Fuel Request Form', '2026-01-11 23:21:44', '2026-01-11 23:21:44'),
(84, 'Charge Account Order Slip', '2026-01-11 23:22:40', '2026-01-11 23:22:40'),
(85, 'Gate / Building Pass', '2026-01-11 23:22:49', '2026-01-11 23:22:49'),
(86, 'Credit Slip Form', '2026-01-11 23:22:58', '2026-01-11 23:22:58'),
(87, 'Acknowledgement Receipt of Equipment', '2026-01-11 23:23:12', '2026-01-11 23:23:12'),
(88, 'Invoice Receipt - Equipment', '2026-01-11 23:23:33', '2026-01-11 23:23:33'),
(89, 'Inventory & Inspection Report', '2026-01-11 23:23:46', '2026-01-11 23:23:46'),
(90, 'Clearance Certificate', '2026-01-11 23:23:55', '2026-01-11 23:23:55'),
(91, 'DTR', '2026-01-11 23:24:01', '2026-01-11 23:24:01'),
(92, 'Request For Action Slip - QMS', '2026-01-11 23:24:17', '2026-01-11 23:24:17'),
(93, 'Pre-Repair Inspection', '2026-01-11 23:24:33', '2026-01-11 23:24:33'),
(94, 'Confirmatory Result', '2026-01-11 23:24:48', '2026-01-11 23:24:48'),
(95, 'MSW Annual Narrative Report', '2026-01-11 23:24:59', '2026-01-11 23:24:59'),
(96, 'MSW Annual Statistical Report', '2026-01-11 23:25:15', '2026-01-11 23:25:15'),
(97, 'MSW Annual Psychosocial Report', '2026-01-11 23:25:33', '2026-01-11 23:25:33'),
(98, 'Meal Provision Request Form', '2026-01-11 23:25:47', '2026-01-11 23:25:47'),
(99, 'Letter - Invitation', '2026-01-11 23:27:10', '2026-01-11 23:27:10'),
(100, 'PPMP', '2026-01-11 23:27:14', '2026-01-11 23:27:14'),
(101, 'Clearance - PNDF Exemption', '2026-01-11 23:27:32', '2026-01-11 23:27:32'),
(102, 'Statement of Account', '2026-01-11 23:28:09', '2026-01-11 23:28:09'),
(103, 'Sales Invoice', '2026-01-11 23:29:33', '2026-01-11 23:29:33'),
(104, 'Advertising Invoice', '2026-01-11 23:30:21', '2026-01-11 23:30:21'),
(105, 'Mail', '2026-01-11 23:30:27', '2026-01-11 23:30:27'),
(106, 'Liquidation Report', '2026-01-11 23:30:40', '2026-01-11 23:30:40'),
(107, 'Notice of Award', '2026-01-11 23:30:48', '2026-01-11 23:30:48'),
(108, 'Post Travel Report', '2026-01-11 23:30:56', '2026-01-11 23:30:56'),
(109, 'Application', '2026-01-11 23:31:06', '2026-01-11 23:31:06'),
(110, 'Contract - Advertisment', '2026-01-11 23:31:18', '2026-01-11 23:31:18'),
(111, 'Supplemental APP', '2026-01-11 23:36:37', '2026-01-11 23:36:37'),
(112, 'Certificate - SSRS', '2026-01-11 23:36:51', '2026-01-11 23:36:51'),
(113, 'COBAC Resolution', '2026-01-11 23:37:03', '2026-01-11 23:37:03'),
(114, 'Certificate of Registration', '2026-01-11 23:37:14', '2026-01-11 23:37:14'),
(115, 'Certificate Project Acceptance', '2026-01-11 23:37:29', '2026-01-11 23:37:29'),
(116, 'Resolutions', '2026-01-11 23:38:18', '2026-01-11 23:38:18'),
(117, 'License to Operate', '2026-01-11 23:38:28', '2026-01-11 23:38:28'),
(118, 'Budget Utilization Request', '2026-01-11 23:38:46', '2026-01-11 23:38:46'),
(119, 'PES', '2026-01-11 23:38:58', '2026-01-11 23:38:58'),
(120, 'Acknowledgement Receipt', '2026-01-11 23:39:15', '2026-01-11 23:39:15'),
(121, 'Affidavit of Non-Disclosure', '2026-01-11 23:39:33', '2026-01-11 23:39:33'),
(122, 'Office Order', '2026-01-11 23:39:39', '2026-01-11 23:39:39'),
(123, 'Office Memorandum', '2026-01-11 23:39:56', '2026-01-11 23:39:56'),
(124, 'Letter for Inclusion', '2026-01-11 23:40:10', '2026-01-11 23:40:10'),
(125, 'Price Monitoring Report', '2026-01-11 23:40:22', '2026-01-11 23:40:22'),
(126, 'Incidental Report', '2026-01-11 23:40:31', '2026-01-11 23:40:31'),
(127, 'Certification - TWG Honorarium', '2026-01-11 23:40:45', '2026-01-11 23:40:45'),
(128, 'Utilization Report', '2026-01-12 00:27:39', '2026-01-12 00:27:39'),
(129, 'EDPMS Report', '2026-01-12 00:27:53', '2026-01-12 00:27:53'),
(130, 'News Clippings', '2026-01-12 00:28:01', '2026-01-12 00:28:01'),
(131, 'Request For Action', '2026-01-12 00:28:12', '2026-01-12 00:28:12'),
(132, 'Replenishment', '2026-01-12 00:28:20', '2026-01-12 00:28:20'),
(133, 'Logistic Request Form', '2026-01-12 00:28:48', '2026-01-12 00:28:48'),
(134, 'Request For Quotation', '2026-01-12 00:29:01', '2026-01-12 00:29:01'),
(135, 'Mailing Envelope for Mail', '2026-01-12 00:29:41', '2026-01-12 00:29:41'),
(136, 'Advertising Quotation', '2026-01-12 00:30:07', '2026-01-12 00:30:07'),
(137, 'Application for Accreditation - Stem Cell', '2026-01-12 00:32:24', '2026-01-12 00:32:24'),
(138, 'Application for LTO - Ambulatory Surgical Clinic', '2026-01-12 00:32:59', '2026-01-12 00:32:59'),
(139, 'Application for Accreditation - Drug Abuse Treatment & Rehab Center', '2026-01-12 00:34:12', '2026-01-12 00:34:12'),
(140, 'Application for Accreditation - Drug Testing Laboratoyy', '2026-01-12 00:35:13', '2026-01-12 00:35:13'),
(141, 'Application for Accreditation - Medical Facility for OW & Seafarers', '2026-01-12 00:42:12', '2026-01-12 00:42:12'),
(142, 'Application for LTO - Hospital', '2026-01-12 00:43:54', '2026-01-12 00:43:54'),
(143, 'Application for LTO - Kidney Transplant', '2026-01-12 00:44:14', '2026-01-12 00:44:14'),
(144, 'Application for LTO - Dialysis Clinic', '2026-01-12 00:44:39', '2026-01-12 00:44:39'),
(145, 'Application for LTO - Birthing Homes', '2026-01-12 00:48:10', '2026-01-12 00:48:10'),
(146, 'Application for LTO - Infirmary', '2026-01-12 00:48:43', '2026-01-12 00:48:43'),
(147, 'Application for Clearance to Operate - HMO', '2026-01-12 00:52:38', '2026-01-12 00:52:38'),
(148, 'Application for Permit to Construct - Birthing Home', '2026-01-12 00:54:10', '2026-01-12 00:54:10'),
(149, 'Application for Permit to Construct - Hospital', '2026-01-12 00:54:27', '2026-01-12 00:54:27'),
(150, 'Application for Permit to Construct - Infirmary', '2026-01-12 00:55:22', '2026-01-12 00:55:22'),
(151, 'Application for Permit to Construct - Ambulatory Surgical Clinic', '2026-01-12 00:55:52', '2026-01-12 00:55:52'),
(152, 'Application for Permit to Construct - Blood Testing', '2026-01-12 00:56:14', '2026-01-12 00:56:14'),
(153, 'Application for Permit to Construct - Drug Testing Laboratory', '2026-01-12 00:56:40', '2026-01-12 00:56:40'),
(154, 'Application for Permit to Construct - Medical Facility for OW & Seafarers', '2026-01-12 00:57:12', '2026-01-12 00:57:12'),
(155, 'Application for Permit to Construct - Dialysis Clinic', '2026-01-12 00:58:09', '2026-01-12 00:58:09'),
(156, 'Authority to Operate Blood Testing', '2026-01-12 00:58:34', '2026-01-12 00:58:34'),
(157, 'Remote Collection Permit', '2026-01-12 00:59:00', '2026-01-12 00:59:00'),
(158, 'Letter - Complaint', '2026-01-12 01:03:20', '2026-01-12 01:03:20'),
(159, 'Request for Tagging', '2026-01-12 01:03:30', '2026-01-12 01:03:30'),
(160, 'Service Request', '2026-01-12 01:03:40', '2026-01-12 01:03:40'),
(161, 'Letter - For Information', '2026-01-12 01:03:54', '2026-01-12 01:03:54'),
(162, 'Letter - Inquiry', '2026-01-12 01:04:01', '2026-01-12 01:04:01'),
(163, 'Compliance Requirements', '2026-01-12 01:04:12', '2026-01-12 01:04:12'),
(164, 'Replenishment of Mailing', '2026-01-12 01:04:25', '2026-01-12 01:04:25'),
(165, 'Certification of Reimbursement', '2026-01-12 01:04:45', '2026-01-12 01:04:45'),
(166, 'Vehicle Request', '2026-01-12 01:04:54', '2026-01-12 01:04:54'),
(167, 'Hospital Personnel Order', '2026-01-12 01:05:03', '2026-01-12 01:05:03'),
(168, 'Abstract of Quotation', '2026-01-12 01:05:16', '2026-01-12 01:05:16'),
(169, 'Receiving Report', '2026-01-12 01:05:29', '2026-01-12 01:05:29'),
(170, 'Monthly Report - Philhealth', '2026-01-12 01:05:39', '2026-01-12 01:05:39'),
(171, 'Policies and Protocols', '2026-01-12 01:06:10', '2026-01-12 01:06:10'),
(172, 'Notice of Cash Allocation', '2026-01-12 01:06:25', '2026-01-12 01:06:25'),
(173, 'Cheque', '2026-01-12 01:06:31', '2026-01-12 01:06:31'),
(174, 'Compliance Monitoring Report', '2026-01-12 01:06:44', '2026-01-12 01:06:44'),
(175, 'Bank Advice', '2026-01-12 01:06:53', '2026-01-12 01:06:53'),
(176, 'Abstract of Canvas', '2026-01-12 01:07:06', '2026-02-25 01:00:06'),
(177, 'Regional Personnel Order', '2026-01-12 01:07:14', '2026-01-12 01:07:14'),
(178, 'Regional Order', '2026-01-12 01:07:32', '2026-01-12 01:07:32'),
(179, 'Bureau Personnel Order', '2026-01-12 01:07:42', '2026-01-12 01:07:42'),
(180, 'test', '2026-01-12 01:08:22', '2026-01-12 01:08:22'),
(181, 'Course Syllabus', '2026-01-12 01:08:42', '2026-01-12 01:08:42'),
(182, 'Budget Proposal', '2026-01-12 01:08:50', '2026-01-12 01:08:50'),
(183, 'Work and Financial Plan', '2026-01-12 01:08:58', '2026-01-12 01:08:58'),
(184, 'Summary of DOH Trainings, Workshops and Events Conducted', '2026-01-12 01:09:17', '2026-01-12 01:09:17'),
(185, 'Request for Overtime Services', '2026-01-12 01:09:29', '2026-01-12 01:09:29'),
(186, 'Request for Office Order', '2026-01-12 01:09:37', '2026-01-12 01:09:37'),
(187, 'Request for Amendment', '2026-01-12 01:09:45', '2026-01-12 01:09:45'),
(188, 'Compensatory Overtime Credit (COC)', '2026-01-12 01:10:02', '2026-01-12 01:10:02'),
(189, 'GLOBE', '2026-01-12 01:10:14', '2026-01-12 01:10:14'),
(190, 'Confirmation Order', '2026-01-12 01:10:19', '2026-01-12 01:10:19'),
(191, 'Certificate of Renewal', '2026-01-12 01:10:28', '2026-01-12 01:10:28'),
(192, 'Individual Performance Commitment and Review (IPCR)', '2026-01-12 01:10:46', '2026-01-12 01:10:46'),
(193, 'Inventory Custodian Slip', '2026-01-12 01:10:55', '2026-01-12 01:10:55'),
(194, 'Property Acknowledgement Receipt', '2026-01-12 01:11:11', '2026-01-12 01:11:11'),
(195, 'Requisition and Issue Slip', '2026-01-12 01:11:23', '2026-01-12 01:11:23'),
(196, 'Statement of Assets and Liabilities (SALN)', '2026-01-12 01:11:43', '2026-01-12 01:11:43'),
(197, 'HFEP Documents', '2026-01-12 01:11:56', '2026-01-12 01:11:56'),
(198, 'Property Transfer Receipt', '2026-01-12 01:12:05', '2026-01-12 01:12:05'),
(199, 'Work Plan', '2026-01-12 01:12:11', '2026-01-12 01:12:11'),
(200, 'Personal Data Sheet', '2026-01-12 01:12:18', '2026-01-12 01:12:18'),
(201, 'Request Slip', '2026-01-12 01:12:26', '2026-01-12 01:12:26'),
(202, 'HCI Engagement Registration Form', '2026-01-12 01:12:41', '2026-01-12 01:12:41'),
(203, 'Document Creation / Revision Request Form', '2026-01-12 01:13:18', '2026-01-12 01:13:18');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2025_03_25_000000_doh_tracking_tables', 1),
(2, '2026_03_25_000001_create_audit_logs_table', 2);

-- --------------------------------------------------------

--
-- Table structure for table `office`
--

CREATE TABLE `office` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `office` varchar(255) NOT NULL,
  `region` varchar(255) DEFAULT NULL,
  `short_name` varchar(255) DEFAULT NULL,
  `head_office` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `office`
--

INSERT INTO `office` (`id`, `office`, `region`, `short_name`, `head_office`, `created_at`, `updated_at`) VALUES
(1, 'Regional Director', 'Region 9', 'RD', 'JOSHUA G. BRILLANTES, MD, MPH, CESO IV', '2026-01-08 22:42:17', '2026-01-13 00:05:40'),
(2, 'Assistant Regional Director', 'Region 9', 'ARD', 'LENNY JOY JOHNSON-RIVERA, MD, MDM, CESE', '2026-01-08 23:17:06', '2026-01-13 00:06:13'),
(3, 'MSD', 'Region 9', '', '', '2026-01-13 00:06:35', '2026-01-13 00:06:35'),
(4, 'MSD - Personnel', 'Region 9', '', 'Sotero Al C. Dela Rosa', '2026-01-13 00:07:09', '2026-01-13 00:07:09'),
(5, 'MSD - Chief Admin', 'Region 9', 'CAO', 'Engr. Domingo E. Lusaya', '2026-01-13 00:07:36', '2026-01-13 00:08:04'),
(6, 'MSD - Budget', 'Region 9', '', 'Marlyn B. Taroy', '2026-01-13 00:08:30', '2026-01-13 00:08:30'),
(7, 'MSD - Accounting', 'Region 9', '', 'Iris A. Sanson', '2026-01-13 00:09:19', '2026-01-13 00:09:19'),
(8, 'MSD - Cashier', 'Region 9', '', 'Elmer Ducanes', '2026-01-13 00:09:54', '2026-02-01 17:55:33'),
(9, 'MSD - Planning', 'Region 9', '', 'Charlou E. Peligro', '2026-01-13 00:14:47', '2026-01-13 00:15:59'),
(10, 'MSD - Human Resource Development', 'Region 9', 'HRDU', 'Gerneil C. Concepcion', '2026-01-13 00:17:05', '2026-01-13 00:17:05'),
(11, 'MSD - Records', 'Region 9', '', 'Liberty P. Asdaon', '2026-01-13 00:18:26', '2026-01-13 00:18:26'),
(12, 'MSD - Supply', 'Region 9', '', 'Jose Noel F. Torres', '2026-01-13 00:19:12', '2026-01-13 00:19:12'),
(13, 'MSD - Procurement', 'Region 9', '', 'Maria Lizette C. Gongora', '2026-01-13 00:20:05', '2026-01-13 00:20:05'),
(14, 'MSD - Motorpool', 'Region 9', '', 'Engr. Joseph P. Maquindang', '2026-01-13 00:20:34', '2026-01-13 00:20:34'),
(15, 'MSD - Legal', 'Region 9', '', 'Pius G. Morados', '2026-01-13 00:21:02', '2026-01-13 00:21:02'),
(16, 'MSD - Information Technology', 'Region 9', 'IT', 'Nazario R. Naong Jr.', '2026-01-13 00:23:34', '2026-01-13 00:23:34'),
(17, 'LHSD - Health Education and Promotion Office', 'Region 9', 'HEPO', 'Chrystal Jean I. Dela Cerna', '2026-01-13 00:26:17', '2026-01-13 00:26:17'),
(18, 'LHSD', 'Region 9', '', '', '2026-01-13 00:27:18', '2026-01-13 00:27:18'),
(19, 'LHSD - Chief', 'Region 9', '', 'Dr. Augusto Manolo G. Alpichi', '2026-01-13 00:28:15', '2026-01-13 00:28:15'),
(20, 'LHSD - Non Comm', 'Region 9', '', 'Agnes Z. Mabolo', '2026-01-13 00:30:09', '2026-01-13 00:30:09'),
(21, 'LHSD - Family Health', 'Region 9', '', 'Cherryl Rebollos', '2026-01-13 00:30:27', '2026-01-13 00:30:27'),
(22, 'LHSD - Infectious Disease', 'Region 9', '', 'Maryrose B. Rendon, MD, MPH, MPM', '2026-01-13 00:31:38', '2026-01-13 00:31:48'),
(23, 'LHSD - Local Health System', 'Region 9', '', 'Ma. Vicvic Camaongay', '2026-01-13 00:32:11', '2026-01-13 00:32:11'),
(24, 'LHSD - HEMS', 'Region 9', '', 'Maxel G. Bermas', '2026-01-13 00:32:34', '2026-01-13 00:32:34'),
(25, 'RLED', 'Region 9', '', '', '2026-01-13 00:32:47', '2026-01-13 00:32:47'),
(26, 'RLED - Chief', 'Region 9', '', 'Atty. Timothy E. Galvez', '2026-01-13 00:33:23', '2026-01-13 00:33:23'),
(27, 'RLED - Hospital Licensing', 'Region 9', '', 'Arlene Care', '2026-01-13 00:33:48', '2026-01-13 00:33:48'),
(28, 'ARD - Health Facility Enhancement Program', 'Region 9', 'HFEP', 'Barjunaid T. Amilasan', '2026-01-13 00:34:23', '2026-01-13 00:37:58'),
(29, 'PDOHO - Zamboanga Sibugay', 'Region 9', '', 'Augusto Manolo G. Alpichi', '2026-01-13 00:35:04', '2026-01-13 00:35:04'),
(30, 'PDOHO - Zamboanga Del Sur', 'Region 9', '', 'Dr. Agnes E. Fernando', '2026-01-13 00:35:30', '2026-01-13 00:35:30'),
(31, 'PDOHO - Zamboanga Del Norte', 'Region 9', '', 'Jane L. Jaug', '2026-01-13 00:35:50', '2026-01-13 00:35:50'),
(32, 'LHSD - Maternal Neonatal Child Health and Nutrition', 'Region 9', 'MNCHN', 'Nerissa B. Gutierrez', '2026-01-13 00:37:43', '2026-01-13 00:37:43'),
(33, 'LHSD - Infectious (Filariasis Program)', 'Region 9', 'FILARIA', 'Maryrose B. Rendon, MD, MPH, MPM', '2026-01-13 00:40:35', '2026-01-13 00:40:35'),
(34, 'MSD - Supply (Cold Room)', 'Region 9', 'COLD ROOM', 'Jose Noel Torres', '2026-01-13 00:41:18', '2026-01-13 00:41:18'),
(35, 'LHSD - Infectious (Schisto/STH Program)', 'Region 9', 'SCHISTO', 'Janine Rodriguez', '2026-01-13 00:42:15', '2026-01-13 00:42:15'),
(36, 'LHSD - Environmental and Occupational Health Cluster', 'Region 9', 'EOHC', 'Peth S. Dalena', '2026-01-13 00:43:05', '2026-01-13 00:43:05'),
(37, 'LGU - Local Govenment Unit', 'Region 9', 'LGU', '', '2026-01-13 00:44:31', '2026-01-13 00:44:31'),
(38, 'MSD - Planning (Bottom-Up Budgeting)', 'Region 9', 'BUB', 'Ma. Isabel A. Francisco', '2026-01-13 00:45:18', '2026-01-13 00:45:18'),
(39, 'MSD - MHCAP', 'Region 9', 'MHCAP', 'Domingo E. Lusaya', '2026-01-13 00:45:45', '2026-01-13 00:45:45'),
(40, 'MSD - Statistics', 'Region 9', 'Stat', 'Jaime A. Valencia', '2026-01-13 00:46:12', '2026-01-13 00:46:12'),
(41, 'LHSD - Infectious Cluster (Rabies Program)', 'Region 9', 'RABIES', 'Nieto E. Fernandez', '2026-01-13 00:46:54', '2026-01-13 00:46:54'),
(42, 'CDOHO - Isabela City', 'Region 9', '', 'Flora A. Wong', '2026-01-13 00:47:24', '2026-01-13 00:47:24'),
(43, 'LHSD - RESU', 'Region 9', '', 'Dr. Jemuel Arnan R. Cristobal', '2026-01-13 00:47:57', '2026-01-13 00:48:39'),
(44, 'ARD - Health Facility Development Unit', 'Region 9', 'ARD - HDFU', 'Dr. Joshua G. Brillantes', '2026-01-13 00:48:35', '2026-01-13 00:48:35'),
(45, 'MSD - General Services', 'Region 9', 'GSO', 'Engr. Joseph Maquindang', '2026-01-13 00:49:07', '2026-01-13 00:49:07');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` char(36) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `employee_code` varchar(255) DEFAULT NULL,
  `office` varchar(255) DEFAULT NULL,
  `user_level` varchar(255) DEFAULT NULL,
  `office_representative` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `email`, `full_name`, `employee_code`, `office`, `user_level`, `office_representative`, `created_at`, `updated_at`) VALUES
('ea2e2cdc-6887-4be2-a9d1-20a596083a2e', 'sandiegoc89@gmail.com', 'Test, Administrator', 'ADMIN', 'LHSD - Chief', 'Admin', 'No', '2026-02-22 17:45:51', '2026-03-25 00:06:36');

-- --------------------------------------------------------

--
-- Table structure for table `region`
--

CREATE TABLE `region` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `region_name` varchar(255) NOT NULL,
  `nscb_code` varchar(255) NOT NULL,
  `nscb_name` varchar(255) NOT NULL,
  `added_by` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `region`
--

INSERT INTO `region` (`id`, `region_name`, `nscb_code`, `nscb_name`, `added_by`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Region 1', '01', 'Ilocos Region', 'ims', 'Active', '2026-01-08 23:11:43', '2026-01-12 17:56:26'),
(2, 'Region 2', '02', 'Cagayan Valley', 'ims', 'Active', '2026-01-08 23:15:09', '2026-01-08 23:15:09'),
(3, 'Region 3', '03', 'Central Luzon', 'ims', 'Active', '2026-01-08 23:16:31', '2026-01-08 23:16:31'),
(4, 'Region 4A', '04', 'CALABARZON', 'ims', 'Active', '2026-01-11 22:22:13', '2026-01-11 22:22:13'),
(5, 'Region 5', '05', 'Bicol Region', 'ims', 'Active', '2026-01-12 17:58:12', '2026-01-12 17:58:12'),
(6, 'Region 6', '06', 'Western Visayas', 'ims', 'Active', '2026-01-12 18:01:31', '2026-01-12 18:01:31'),
(7, 'Region 7', '07', 'Central Visayas', 'ims', 'Active', '2026-01-12 18:02:09', '2026-01-12 18:02:09'),
(8, 'Region 8', '08', 'Eastern Visayas', 'ims', 'Active', '2026-01-12 18:03:00', '2026-01-12 18:03:00'),
(9, 'Region 9', '09', 'Zamboanga Peninsula', 'ims', 'Active', '2026-01-12 18:04:39', '2026-01-12 18:04:39'),
(10, 'Region 10', '10', 'Northern Mindanao', 'ims', 'Active', '2026-01-12 18:05:55', '2026-01-12 18:05:55'),
(11, 'Region 11', '11', 'Davao Region', 'ims', 'Active', '2026-01-12 18:09:18', '2026-01-12 18:09:18'),
(12, 'Region 12', '12', 'Soccsksargen', 'ims', 'Active', '2026-01-12 18:09:53', '2026-01-12 18:10:07'),
(13, 'NCR', '13', 'National Capital Region', 'ims', 'Active', '2026-01-12 18:31:36', '2026-01-12 18:32:53'),
(14, 'CAR', '14', 'Cordillera Administrative Region', 'ims', 'Active', '2026-01-12 18:33:28', '2026-01-12 18:33:28'),
(15, 'ARMM', '15', 'Autonomous Region in Muslim Mindanao', 'ims', 'Active', '2026-01-12 18:34:10', '2026-01-12 18:34:10'),
(16, 'CARAGA', '16', 'CARAGA', 'ims', 'Active', '2026-01-12 18:34:46', '2026-01-12 18:34:46'),
(17, 'Region 4B', '17', 'MIMAROPA', 'ims', 'Active', '2026-01-12 18:35:13', '2026-01-27 22:54:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_code` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) NOT NULL DEFAULT '',
  `office` varchar(255) DEFAULT NULL,
  `user_password` text NOT NULL,
  `user_level` varchar(255) NOT NULL,
  `office_representative` varchar(255) DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employee_code`, `last_name`, `first_name`, `middle_name`, `office`, `user_password`, `user_level`, `office_representative`, `verified`, `created_at`, `updated_at`) VALUES
(1, 'DOH-0001', 'Ramos', 'Mark Anthony', 'D.', 'MSD - Personnel', 'pbkdf2_sha256$600000$1EhFzLiwXPKw6qbBqda9dR$C1qSINt43RcWlnQSTZPdatRmDCdkOrXbbImiSm7ytgI=', 'End-Users', 'Yes', 1, '2026-03-08 19:53:48', '2026-03-22 09:51:35'),
(2, 'AO-0001', 'Officer', 'Action', 'T', 'MSD - Legal', 'pbkdf2_sha256$600000$6s2FkiF43CNpbbvIcGWtgM$pavvyBuRv076eNeCVHAcdsx2KBehgjgoop+57rcMeLg=', 'Action Officers', 'Yes', 1, '2026-03-08 22:06:31', '2026-03-08 22:07:27'),
(3, 'DOH-0002', 'Ramos', 'Mark', 'D.', 'ARD - Health Facility Enhancement Program', 'pbkdf2_sha256$600000$vT3iwtY8WpJmwitWAd7n8W$UmbfFzuADOM1GpOJD/VKHrber04Mwe+9HQ/kw93YHxU=', 'End-Users', 'Yes', 1, '2026-03-22 17:29:13', '2026-03-22 17:29:58'),
(4, 'AO-0002', 'Officer', 'Action', '-', 'MSD - Personnel', '$2y$12$SKochC1keI1uuHkm0O.k..NN39f3JH6hpmDViRdFp9.xNBmg1G2fy', 'Action Officers', 'Yes', 1, '2026-03-25 15:37:34', '2026-03-25 16:15:01'),
(5, 'ADMIN', 'Person', 'Admin', '-', 'LHSD', '$2y$12$HRJbP2dBdvzx5JAokgtP7eyvO3Bej1TiYNkGTm6jmBu5BBz5Mowc2', 'Administrator', 'Yes', 1, '2026-03-25 23:44:42', '2026-03-25 16:01:59');

-- --------------------------------------------------------

--
-- Table structure for table `user_levels`
--

CREATE TABLE `user_levels` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_level_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_levels`
--

INSERT INTO `user_levels` (`id`, `user_level_name`, `created_at`, `updated_at`) VALUES
(1, 'Default', '2026-01-14 19:22:27', '2026-03-25 19:39:10'),
(2, 'Action Officers', '2026-01-14 19:53:00', '2026-01-14 19:53:00'),
(3, 'End-Users', '2026-01-29 22:58:43', '2026-01-29 22:58:43'),
(4, 'OSEC', '2026-01-29 22:59:08', '2026-01-29 22:59:08'),
(5, 'Guests', '2026-01-29 22:59:11', '2026-01-29 22:59:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `action_officer`
--
ALTER TABLE `action_officer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `action_required`
--
ALTER TABLE `action_required`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `action_taken`
--
ALTER TABLE `action_taken`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_document_source_id_index` (`document_source_id`),
  ADD KEY `audit_logs_document_control_no_index` (`document_control_no`),
  ADD KEY `audit_logs_route_no_index` (`route_no`),
  ADD KEY `audit_logs_actor_employee_code_index` (`actor_employee_code`),
  ADD KEY `audit_logs_owner_employee_code_index` (`owner_employee_code`);

--
-- Indexes for table `document_action_required_days`
--
ALTER TABLE `document_action_required_days`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_destination`
--
ALTER TABLE `document_destination`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_destination_document_source_id_foreign` (`document_source_id`);

--
-- Indexes for table `document_source`
--
ALTER TABLE `document_source`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_type`
--
ALTER TABLE `document_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `office`
--
ALTER TABLE `office`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profiles_employee_code_index` (`employee_code`);

--
-- Indexes for table `region`
--
ALTER TABLE `region`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_employee_code_unique` (`employee_code`);

--
-- Indexes for table `user_levels`
--
ALTER TABLE `user_levels`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `action_officer`
--
ALTER TABLE `action_officer`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `action_required`
--
ALTER TABLE `action_required`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `action_taken`
--
ALTER TABLE `action_taken`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `document_action_required_days`
--
ALTER TABLE `document_action_required_days`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `document_destination`
--
ALTER TABLE `document_destination`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `document_source`
--
ALTER TABLE `document_source`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `document_type`
--
ALTER TABLE `document_type`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=204;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `office`
--
ALTER TABLE `office`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `region`
--
ALTER TABLE `region`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_levels`
--
ALTER TABLE `user_levels`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `document_destination`
--
ALTER TABLE `document_destination`
  ADD CONSTRAINT `document_destination_document_source_id_foreign` FOREIGN KEY (`document_source_id`) REFERENCES `document_source` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
