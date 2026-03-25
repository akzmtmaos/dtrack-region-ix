<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Support\DohJson;
use App\Models\DocumentDestination;
use App\Models\DocumentSource;
use App\Services\AuditLogService;
use App\Services\CustodianService;
use App\Services\EmployeeMatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentDestinationController extends Controller
{
    private function employeeScope(Request $request): ?string
    {
        $h = $request->header('X-Employee-Code');
        $q = $request->query('employee_code');
        $raw = trim((string) ($h ?: $q));

        return $raw !== '' ? $raw : null;
    }

    public function index(Request $request): JsonResponse
    {
        $q = DocumentDestination::query()->orderBy('sequence_no');
        $sid = $request->query('document_source_id');
        if ($sid !== null && $sid !== '') {
            $q->where('document_source_id', (int) $sid);
        }
        $rows = $q->get();

        return response()->json([
            'success' => true,
            'data' => $rows->map(fn (DocumentDestination $r) => DohJson::documentDestinationToCamel($r))->values()->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $this->payloadToSnake($request->all());
        if (empty($payload['document_source_id'])) {
            return response()->json(['success' => false, 'error' => 'document_source_id is required'], 400);
        }
        if (trim((string) ($payload['document_control_no'] ?? '')) === '') {
            return response()->json(['success' => false, 'error' => 'document_control_no is required'], 400);
        }
        if (trim((string) ($payload['route_no'] ?? '')) === '') {
            $payload['route_no'] = $this->nextDocumentDestinationRouteNo();
        }
        $row = DocumentDestination::query()->create($payload);
        CustodianService::recompute((int) $row->document_source_id);

        $src = DocumentSource::query()->find((int) $row->document_source_id);
        if ($src) {
            AuditLogService::logDestinationEvent($request, 'routing.created', $src, $row, [
                'actionRequired' => (string) ($row->action_required ?? ''),
                'dateReleased' => (string) ($row->date_released ?? ''),
                'timeReleased' => (string) ($row->time_released ?? ''),
            ]);
        }

        return response()->json(['success' => true, 'data' => DohJson::documentDestinationToCamel($row->fresh())], 201);
    }

    public function update(Request $request, int $item_id): JsonResponse
    {
        $existing = DocumentDestination::query()->find($item_id);
        if (! $existing) {
            return response()->json(['success' => false, 'error' => 'Item not found or update failed'], 404);
        }
        $beforeReceived = trim((string) ($existing->date_received ?? ''));
        $beforeActed = trim((string) ($existing->date_acted_upon ?? ''));
        $base = DohJson::documentDestinationToCamel($existing);
        $incoming = $request->all();
        $merged = array_merge($base, is_array($incoming) ? $incoming : []);
        unset($merged['id'], $merged['documentSourceId']);
        $payload = $this->payloadToSnake($merged);
        unset($payload['document_source_id']);
        $existing->fill($payload);
        $changed = array_keys($existing->getDirty());
        $existing->save();
        CustodianService::recompute((int) $existing->document_source_id);

        $src = DocumentSource::query()->find((int) $existing->document_source_id);
        if ($src) {
            AuditLogService::logDestinationEvent($request, 'routing.updated', $src, $existing, [
                'changedFields' => $changed,
            ]);

            $afterReceived = trim((string) ($existing->date_received ?? ''));
            $afterActed = trim((string) ($existing->date_acted_upon ?? ''));
            if ($beforeReceived === '' && $afterReceived !== '') {
                AuditLogService::logDestinationEvent($request, 'routing.received', $src, $existing, [
                    'dateReceived' => (string) ($existing->date_received ?? ''),
                    'timeReceived' => (string) ($existing->time_received ?? ''),
                ]);
            }
            if ($beforeActed === '' && $afterActed !== '') {
                AuditLogService::logDestinationEvent($request, 'routing.acted', $src, $existing, [
                    'dateActedUpon' => (string) ($existing->date_acted_upon ?? ''),
                    'timeActedUpon' => (string) ($existing->time_acted_upon ?? ''),
                    'actionTaken' => (string) ($existing->action_taken ?? ''),
                ]);
            }
        }

        return response()->json(['success' => true, 'data' => DohJson::documentDestinationToCamel($existing->fresh())]);
    }

    public function destroy(Request $request, int $item_id): JsonResponse
    {
        $prev = DocumentDestination::query()->find($item_id);
        if (! $prev) {
            return response()->json(['success' => false, 'error' => 'Not found'], 404);
        }
        $sid = (int) $prev->document_source_id;
        $src = DocumentSource::query()->find($sid);
        if ($src) {
            AuditLogService::logDestinationEvent($request, 'routing.deleted', $src, $prev);
        }
        $prev->delete();
        CustodianService::recompute($sid);

        return response()->json(['success' => true, 'message' => 'Destination deleted successfully']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        $toLog = DocumentDestination::query()->whereIn('id', $ids)->get();
        $affected = $toLog->pluck('document_source_id')->unique()->filter();
        DocumentDestination::query()->whereIn('id', $ids)->delete();
        foreach ($affected as $sid) {
            CustodianService::recompute((int) $sid);
        }
        foreach ($toLog as $d) {
            $sid = (int) ($d->document_source_id ?? 0);
            $src = $sid ? DocumentSource::query()->find($sid) : null;
            if ($src) {
                AuditLogService::logDestinationEvent($request, 'routing.deleted', $src, $d, ['bulk' => true]);
            }
        }

        return response()->json(['success' => true, 'message' => count($ids).' item(s) deleted successfully']);
    }

    public function inbox(Request $request): JsonResponse
    {
        $ec = $this->employeeScope($request);
        if (! $ec) {
            return response()->json(['success' => false, 'error' => 'X-Employee-Code header (or employee_code query param) is required'], 400);
        }

        $candidates = EmployeeMatchService::matchCandidates($ec);

        $allDests = DocumentDestination::query()->orderBy('sequence_no')->get();
        $matchedDests = $allDests->filter(function (DocumentDestination $d) use ($ec) {
            return EmployeeMatchService::identityMatches($ec, $d->employee_action_officer);
        })->values();

        $destSourceIds = $matchedDests->pluck('document_source_id')->filter()->unique()->all();

        $allSources = DocumentSource::query()->whereNull('deleted_at')->get()->keyBy('id');

        $result = [];

        foreach ($matchedDests as $d) {
            $sid = $d->document_source_id;
            $src = $allSources->get($sid);
            if (! $src) {
                continue;
            }
            $result[] = [
                'id' => $d->id,
                'inboxType' => 'destination',
                'destination' => DohJson::documentDestinationToCamel($d),
                'document' => DohJson::documentSourceToCamel($src),
            ];
        }

        foreach ($allSources as $src) {
            $sid = $src->id;
            if (in_array($sid, $destSourceIds, true)) {
                continue;
            }
            // Internal source documents were showing up in Inbox immediately for their creator.
            // Supabase behavior: Internal should only reach Inbox via forwarded destination steps.
            if (strtolower((string) ($src->source_type ?? '')) === 'internal') {
                continue;
            }
            $internal = (string) ($src->internal_originating_employee ?? '');
            $external = (string) ($src->external_originating_employee ?? '');
            if (! EmployeeMatchService::originatingMatches($internal, $candidates, $ec)
                && ! EmployeeMatchService::originatingMatches($external, $candidates, $ec)) {
                continue;
            }
            $result[] = [
                'id' => 'orig-'.$sid,
                'inboxType' => 'originating',
                'destination' => null,
                'document' => DohJson::documentSourceToCamel($src),
            ];
        }

        usort($result, function ($a, $b) {
            $ta = $a['document']['createdAt'] ?? '';
            $tb = $b['document']['createdAt'] ?? '';

            return strcmp((string) $tb, (string) $ta);
        });

        return response()->json(['success' => true, 'data' => $result]);
    }

    /**
     * Match Supabase trigger on document_destination: R{year}-######### (separate sequence from document_source).
     */
    private function nextDocumentDestinationRouteNo(): string
    {
        $year = date('Y');
        $prefix = 'R'.$year.'-';
        $max = DocumentDestination::query()
            ->where('route_no', 'like', $prefix.'%')
            ->pluck('route_no')
            ->map(function (string $rn) use ($prefix) {
                $suffix = substr($rn, strlen($prefix));

                return ctype_digit($suffix) ? (int) $suffix : 0;
            })
            ->max();

        return $prefix.str_pad((string) (($max ?? 0) + 1), 9, '0', STR_PAD_LEFT);
    }

    private function payloadToSnake(array $data): array
    {
        return [
            'document_source_id' => $data['documentSourceId'] ?? null,
            'document_control_no' => $data['documentControlNo'] ?? '',
            'route_no' => $data['routeNo'] ?? '',
            'sequence_no' => (int) ($data['sequenceNo'] ?? 0),
            'destination_office' => $data['destinationOffice'] ?? '',
            'employee_action_officer' => $data['employeeActionOfficer'] ?? '',
            'action_required' => $data['actionRequired'] ?? '',
            'date_released' => $data['dateReleased'] ?? null,
            'time_released' => $data['timeReleased'] ?? null,
            'date_required' => $data['dateRequired'] ?? null,
            'time_required' => $data['timeRequired'] ?? null,
            'date_received' => $data['dateReceived'] ?? null,
            'time_received' => $data['timeReceived'] ?? null,
            'remarks' => $data['remarks'] ?? '',
            'action_taken' => $data['actionTaken'] ?? '',
            'remarks_on_action_taken' => $data['remarksOnActionTaken'] ?? '',
            'date_acted_upon' => $data['dateActedUpon'] ?? null,
            'time_acted_upon' => $data['timeActedUpon'] ?? null,
        ];
    }
}
