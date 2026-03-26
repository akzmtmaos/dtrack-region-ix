<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuditTrailController;
use App\Http\Controllers\Api\DocumentDestinationController;
use App\Http\Controllers\Api\DocumentSourceController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ReferenceController;
use App\Http\Controllers\Api\UsersController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| DOH Document Tracking — legacy JSON API (matches Django /api routes)
|--------------------------------------------------------------------------
| Replace the default Laravel api.php with this file. Routes use a trailing
| slash where the React client expects it.
*/

Route::get('health', HealthController::class);
Route::get('health/', HealthController::class);

Route::post('auth/login/', [AuthController::class, 'login']);
Route::post('auth/register/', [AuthController::class, 'register']);

Route::get('users/', [UsersController::class, 'index']);
Route::put('users/{item_id}/', [UsersController::class, 'update'])->where('item_id', '.+');

Route::get('action-required/', [ReferenceController::class, 'actionRequiredList']);
Route::post('action-required/create/', [ReferenceController::class, 'actionRequiredCreate']);
Route::put('action-required/{item_id}/', [ReferenceController::class, 'actionRequiredUpdate']);
Route::delete('action-required/{item_id}/delete/', [ReferenceController::class, 'actionRequiredDelete']);
Route::delete('action-required/bulk-delete/', [ReferenceController::class, 'actionRequiredBulkDelete']);

Route::get('action-officer/', [ReferenceController::class, 'actionOfficerList']);
Route::post('action-officer/create/', [ReferenceController::class, 'actionOfficerCreate']);
Route::put('action-officer/{item_id}/', [ReferenceController::class, 'actionOfficerUpdate']);
Route::delete('action-officer/{item_id}/delete/', [ReferenceController::class, 'actionOfficerDelete']);
Route::post('action-officer/bulk-delete/', [ReferenceController::class, 'actionOfficerBulkDelete']);

Route::get('action-taken/', [ReferenceController::class, 'actionTakenList']);
Route::post('action-taken/create/', [ReferenceController::class, 'actionTakenCreate']);
Route::put('action-taken/{item_id}/', [ReferenceController::class, 'actionTakenUpdate']);
Route::delete('action-taken/{item_id}/delete/', [ReferenceController::class, 'actionTakenDelete']);
Route::post('action-taken/bulk-delete/', [ReferenceController::class, 'actionTakenBulkDelete']);

Route::get('document-type/', [ReferenceController::class, 'documentTypeList']);
Route::post('document-type/create/', [ReferenceController::class, 'documentTypeCreate']);
Route::post('document-type/sync-display-name/', [ReferenceController::class, 'documentTypeSyncDisplayName']);
Route::put('document-type/{item_id}/', [ReferenceController::class, 'documentTypeUpdate']);
Route::delete('document-type/{item_id}/delete/', [ReferenceController::class, 'documentTypeDelete']);
Route::post('document-type/bulk-delete/', [ReferenceController::class, 'documentTypeBulkDelete']);

Route::get('document-action-required-days/', [ReferenceController::class, 'documentActionRequiredDaysList']);
Route::post('document-action-required-days/create/', [ReferenceController::class, 'documentActionRequiredDaysCreate']);
Route::put('document-action-required-days/{item_id}/', [ReferenceController::class, 'documentActionRequiredDaysUpdate']);
Route::delete('document-action-required-days/{item_id}/delete/', [ReferenceController::class, 'documentActionRequiredDaysDelete']);
Route::post('document-action-required-days/bulk-delete/', [ReferenceController::class, 'documentActionRequiredDaysBulkDelete']);

Route::get('office/', [ReferenceController::class, 'officeList']);
Route::post('office/create/', [ReferenceController::class, 'officeCreate']);
Route::put('office/{item_id}/', [ReferenceController::class, 'officeUpdate']);
Route::delete('office/{item_id}/delete/', [ReferenceController::class, 'officeDelete']);
Route::post('office/bulk-delete/', [ReferenceController::class, 'officeBulkDelete']);

Route::get('region/', [ReferenceController::class, 'regionList']);
Route::post('region/create/', [ReferenceController::class, 'regionCreate']);
Route::put('region/{item_id}/', [ReferenceController::class, 'regionUpdate']);
Route::delete('region/{item_id}/delete/', [ReferenceController::class, 'regionDelete']);
Route::post('region/bulk-delete/', [ReferenceController::class, 'regionBulkDelete']);

Route::get('user-levels/', [ReferenceController::class, 'userLevelsList']);
Route::post('user-levels/create/', [ReferenceController::class, 'userLevelsCreate']);
Route::put('user-levels/{item_id}/', [ReferenceController::class, 'userLevelsUpdate']);
Route::delete('user-levels/{item_id}/delete/', [ReferenceController::class, 'userLevelsDelete']);
Route::post('user-levels/bulk-delete/', [ReferenceController::class, 'userLevelsBulkDelete']);

Route::get('inbox/', [DocumentDestinationController::class, 'inbox']);

Route::get('audit-trail/', [AuditTrailController::class, 'index']);

Route::get('document-destination/', [DocumentDestinationController::class, 'index']);
Route::post('document-destination/create/', [DocumentDestinationController::class, 'store']);
Route::put('document-destination/{item_id}/', [DocumentDestinationController::class, 'update']);
Route::delete('document-destination/{item_id}/delete/', [DocumentDestinationController::class, 'destroy']);
Route::delete('document-destination/bulk-delete/', [DocumentDestinationController::class, 'bulkDestroy']);

Route::post('document-source/upload-attachment/', [DocumentSourceController::class, 'uploadAttachment']);
Route::post('document-source/bulk-restore/', [DocumentSourceController::class, 'bulkRestore']);
Route::post('document-source/bulk-permanent-delete/', [DocumentSourceController::class, 'bulkPermanentDelete']);
Route::delete('document-source/bulk-delete/', [DocumentSourceController::class, 'bulkSoftDelete']);
Route::post('document-source/create/', [DocumentSourceController::class, 'store']);
Route::post('document-source/{item_id}/restore/', [DocumentSourceController::class, 'restore']);
Route::delete('document-source/{item_id}/permanent/', [DocumentSourceController::class, 'permanentDelete']);
Route::get('document-source/{item_id}/attachment-url/', [DocumentSourceController::class, 'attachmentUrl']);
Route::get('document-source/{item_id}/attachment-file', [DocumentSourceController::class, 'attachmentFile']);
Route::delete('document-source/{item_id}/delete/', [DocumentSourceController::class, 'softDelete']);
Route::put('document-source/{item_id}/', [DocumentSourceController::class, 'update']);
Route::get('document-source/', [DocumentSourceController::class, 'index']);
