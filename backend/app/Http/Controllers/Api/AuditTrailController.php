<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditTrailController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employeeCode = trim((string) ($request->header('X-Employee-Code') ?: $request->query('employee_code')));

        $q = AuditLog::query()->orderByDesc('created_at')->orderByDesc('id');

        // End-user / scoped view: show audit events for documents they own.
        if ($employeeCode !== '') {
            $q->where('owner_employee_code', $employeeCode);
        }

        $dateFrom = trim((string) $request->query('date_from', ''));
        $dateTo = trim((string) $request->query('date_to', ''));
        if ($dateFrom !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom) !== 1) {
            $dateFrom = '';
        }
        if ($dateTo !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo) !== 1) {
            $dateTo = '';
        }
        if ($dateFrom !== '' && $dateTo !== '' && $dateFrom > $dateTo) {
            [$dateFrom, $dateTo] = [$dateTo, $dateFrom];
        }
        if ($dateFrom !== '') {
            $q->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }
        if ($dateTo !== '') {
            $q->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        try {
            $rows = $q->limit(5000)->get();
        } catch (\Throwable $e) {
            // If audit table isn't migrated yet, don't break the UI.
            return response()->json(['success' => true, 'data' => []]);
        }

        $data = $rows->map(function (AuditLog $r) {
            return [
                'id' => $r->id,
                'eventType' => (string) ($r->event_type ?? ''),
                'entityType' => (string) ($r->entity_type ?? ''),
                'entityId' => $r->entity_id,
                'documentSourceId' => $r->document_source_id,
                'documentControlNo' => (string) ($r->document_control_no ?? ''),
                'routeNo' => (string) ($r->route_no ?? ''),
                'actorEmployeeCode' => (string) ($r->actor_employee_code ?? ''),
                'actorDisplayName' => (string) ($r->actor_display_name ?? ''),
                'ownerEmployeeCode' => (string) ($r->owner_employee_code ?? ''),
                'meta' => $r->meta ?? null,
                'createdAt' => $r->created_at ? $r->created_at->toISOString() : null,
            ];
        })->values()->all();

        return response()->json(['success' => true, 'data' => $data]);
    }
}

