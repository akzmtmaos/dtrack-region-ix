<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\DocumentDestination;
use App\Models\DocumentSource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuditLogService
{
    public static function actorEmployeeCode(Request $request, ?DocumentSource $src = null): string
    {
        $h = trim((string) $request->header('X-Employee-Code', ''));
        if ($h !== '') {
            return $h;
        }
        $q = trim((string) $request->query('employee_code', ''));
        if ($q !== '') {
            return $q;
        }
        $uid = trim((string) $request->input('userid', ''));
        if ($uid !== '') {
            return $uid;
        }
        if ($src) {
            $owner = trim((string) ($src->userid ?? ''));
            if ($owner !== '') {
                return $owner;
            }
        }

        return '';
    }

    public static function logDocumentEvent(
        Request $request,
        string $eventType,
        DocumentSource $src,
        array $meta = []
    ): void {
        try {
            AuditLog::query()->create([
                'event_type' => $eventType,
                'entity_type' => 'document_source',
                'entity_id' => $src->id,
                'document_source_id' => $src->id,
                'document_control_no' => (string) ($src->document_control_no ?? ''),
                'route_no' => (string) ($src->route_no ?? ''),
                'actor_employee_code' => self::actorEmployeeCode($request, $src),
                'actor_display_name' => '',
                'owner_employee_code' => (string) ($src->userid ?? ''),
                'meta' => $meta,
            ]);
        } catch (\Throwable $e) {
            // Audit logging must never break document workflows.
            Log::warning('Audit log write failed (document event)', [
                'eventType' => $eventType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public static function logDestinationEvent(
        Request $request,
        string $eventType,
        DocumentSource $src,
        DocumentDestination $dest,
        array $meta = []
    ): void {
        try {
            AuditLog::query()->create([
                'event_type' => $eventType,
                'entity_type' => 'document_destination',
                'entity_id' => $dest->id,
                'document_source_id' => $src->id,
                'document_control_no' => (string) ($src->document_control_no ?? ''),
                'route_no' => (string) ($dest->route_no ?? ''),
                'actor_employee_code' => self::actorEmployeeCode($request, $src),
                'actor_display_name' => '',
                'owner_employee_code' => (string) ($src->userid ?? ''),
                'meta' => array_merge([
                    'destinationOffice' => (string) ($dest->destination_office ?? ''),
                    'employeeActionOfficer' => (string) ($dest->employee_action_officer ?? ''),
                    'sequenceNo' => (int) ($dest->sequence_no ?? 0),
                ], $meta),
            ]);
        } catch (\Throwable $e) {
            // Audit logging must never break document workflows.
            Log::warning('Audit log write failed (destination event)', [
                'eventType' => $eventType,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

