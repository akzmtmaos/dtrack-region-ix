<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Support\DohJson;
use App\Models\DocumentDestination;
use App\Models\DocumentSource;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\EmployeeMatchService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentSourceController extends Controller
{
    private const ATTACH_PREFIX = 'document-attachments';

    private function employeeScope(Request $request): ?string
    {
        $h = $request->header('X-Employee-Code');
        $q = $request->query('employee_code');
        $raw = trim((string) ($h ?: $q));

        return $raw !== '' ? $raw : null;
    }

    private function userIsAdministrator(?User $u): bool
    {
        if (! $u) {
            return false;
        }
        $l = strtolower(trim((string) ($u->user_level ?? '')));

        return $l === 'administrator' || $l === 'admin';
    }

    private function userIsActionOfficer(?User $u): bool
    {
        if (! $u) {
            return false;
        }
        $l = strtolower((string) ($u->user_level ?? ''));

        return str_contains($l, 'action') && str_contains($l, 'officer');
    }

    /** @return 'all'|'self'|'office' */
    private function documentListAccessMode(?string $ec): string
    {
        if (! $ec || trim($ec) === '') {
            return 'all';
        }
        $u = User::query()->where('employee_code', $ec)->first();
        if (! $u) {
            return 'self';
        }
        if ($this->userIsAdministrator($u)) {
            return 'all';
        }
        $l = strtolower(trim((string) ($u->user_level ?? '')));
        if ($l === 'end-user' || $l === 'end-users') {
            return 'self';
        }
        if ($this->userIsActionOfficer($u)) {
            return 'office';
        }

        return 'all';
    }

    private function holderMatchesEmployee(string $employeeCode, DocumentSource $row): bool
    {
        $cust = trim((string) ($row->current_custodian ?? ''));
        $uid = trim((string) ($row->userid ?? ''));
        $holder = $cust !== '' ? $cust : $uid;
        if ($holder === '') {
            return false;
        }

        return EmployeeMatchService::identityMatches($employeeCode, $holder);
    }

    private function officeScopeMatchesEmployee(string $ec, DocumentSource $row): bool
    {
        if ($this->holderMatchesEmployee($ec, $row)) {
            return true;
        }
        $viewer = User::query()->where('employee_code', $ec)->first();
        $officeNorm = strtolower(trim((string) ($viewer->office ?? '')));
        if ($officeNorm === '') {
            return false;
        }
        if (strtolower(trim((string) ($row->internal_originating_office ?? ''))) === $officeNorm) {
            return true;
        }
        $creatorEc = trim((string) ($row->userid ?? ''));
        if ($creatorEc !== '') {
            $creator = User::query()->where('employee_code', $creatorEc)->first();
            if ($creator && strtolower(trim((string) ($creator->office ?? ''))) === $officeNorm) {
                return true;
            }
        }
        foreach (DocumentDestination::query()->where('document_source_id', $row->id)->get() as $d) {
            if (EmployeeMatchService::identityMatches($ec, (string) ($d->employee_action_officer ?? ''))) {
                return true;
            }
        }

        return false;
    }

    private function canAccessDocumentRowForRequest(Request $request, DocumentSource $row): bool
    {
        $ec = $this->employeeScope($request);
        if (! $ec) {
            return true;
        }
        $mode = $this->documentListAccessMode($ec);
        if ($mode === 'all') {
            return true;
        }
        if ($mode === 'self') {
            return $this->holderMatchesEmployee($ec, $row);
        }

        return $this->officeScopeMatchesEmployee($ec, $row);
    }

    private function canDownloadAttachment(?string $employeeCode, DocumentSource $row): bool
    {
        if (! $employeeCode || trim($employeeCode) === '') {
            return true;
        }
        $ec = trim($employeeCode);
        $mode = $this->documentListAccessMode($ec);
        if ($mode === 'all') {
            return true;
        }
        if ($mode === 'office') {
            return $this->officeScopeMatchesEmployee($ec, $row);
        }
        $cust = trim((string) ($row->current_custodian ?? ''));
        $uid = trim((string) ($row->userid ?? ''));
        $holder = $cust !== '' ? $cust : $uid;
        if ($holder !== '' && EmployeeMatchService::identityMatches($ec, $holder)) {
            return true;
        }
        if ($uid !== '' && EmployeeMatchService::identityMatches($ec, $uid)) {
            return true;
        }
        $dest = DocumentDestination::query()
            ->where('document_source_id', $row->id)
            ->get();
        foreach ($dest as $d) {
            if (EmployeeMatchService::identityMatches($ec, $d->employee_action_officer)) {
                return true;
            }
        }
        $candidates = EmployeeMatchService::matchCandidates($ec);
        $internal = (string) ($row->internal_originating_employee ?? '');
        $external = (string) ($row->external_originating_employee ?? '');
        if (EmployeeMatchService::originatingMatches($internal, $candidates, $ec)) {
            return true;
        }
        if (EmployeeMatchService::originatingMatches($external, $candidates, $ec)) {
            return true;
        }

        return false;
    }

    public function index(Request $request): JsonResponse
    {
        $wantTrash = in_array(strtolower((string) $request->query('trash')), ['1', 'true', 'yes'], true);
        $ec = $this->employeeScope($request);
        $mode = $this->documentListAccessMode($ec);

        $q = DocumentSource::query();
        if ($wantTrash) {
            $q->whereNotNull('deleted_at');
        } else {
            $q->whereNull('deleted_at');
        }
        if ($ec && $mode === 'self') {
            $q->where(function ($w) use ($ec) {
                $w->where('userid', $ec)
                    ->orWhere('current_custodian', $ec)
                    ->orWhere('current_custodian', 'like', '%('.$ec.')%');
            });
        } elseif ($ec && $mode === 'office') {
            $viewer = User::query()->where('employee_code', $ec)->first();
            $officeNorm = strtolower(trim((string) ($viewer->office ?? '')));
            if ($officeNorm === '') {
                $q->whereRaw('1 = 0');
            } else {
                $q->where(function ($w) use ($ec, $officeNorm) {
                    $w->where(function ($w2) use ($ec) {
                        $w2->where('userid', $ec)
                            ->orWhere('current_custodian', $ec)
                            ->orWhere('current_custodian', 'like', '%('.$ec.')%');
                    });
                    $w->orWhereRaw("LOWER(TRIM(COALESCE(internal_originating_office, ''))) = ?", [$officeNorm]);
                    $w->orWhereIn('userid', function ($sub) use ($officeNorm) {
                        $sub->select('employee_code')->from('users')
                            ->whereRaw("LOWER(TRIM(COALESCE(office, ''))) = ?", [$officeNorm]);
                    });
                    $w->orWhereIn('id', function ($sub) use ($ec) {
                        $sub->select('document_source_id')->from('document_destination')
                            ->where('employee_action_officer', $ec)
                            ->orWhere('employee_action_officer', 'like', '%('.$ec.')%');
                    });
                });
            }
        }
        $rows = $q->orderByDesc('created_at')->get();

        $data = $rows->map(fn (DocumentSource $r) => DohJson::documentSourceToCamel($r))->values()->all();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $this->payloadToSnake($request->all());
        $uid = trim((string) ($payload['userid'] ?? ''));
        $row = DocumentSource::query()->create(array_merge($payload, [
            'current_custodian' => $uid,
            'document_control_no' => '',
        ]));
        if (trim((string) ($row->route_no ?? '')) === '') {
            $row->route_no = $this->nextDocumentSourceRouteNo();
        }
        $row->document_control_no = 'DC-'.date('Y').'-'.str_pad((string) $row->id, 5, '0', STR_PAD_LEFT);
        $row->save();

        AuditLogService::logDocumentEvent($request, 'document.created', $row, [
            'subject' => (string) ($row->subject ?? ''),
            'documentType' => (string) ($row->document_type ?? ''),
            'sourceType' => (string) ($row->source_type ?? ''),
        ]);

        return response()->json(['success' => true, 'data' => DohJson::documentSourceToCamel($row->fresh())], 201);
    }

    public function update(Request $request, int $item_id): JsonResponse
    {
        $row = DocumentSource::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Item not found or update failed'], 404);
        }
        if (! $this->canAccessDocumentRowForRequest($request, $row)) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        $patch = $this->payloadToSnakeUpdate($request->all());
        unset($patch['current_custodian']);
        if ($patch === []) {
            return response()->json(['success' => false, 'error' => 'No fields to update. Send at least one field (e.g. subject, attachmentList).'], 400);
        }
        $row->fill($patch);
        $changed = array_keys($row->getDirty());
        $row->save();

        AuditLogService::logDocumentEvent($request, 'document.updated', $row, [
            'changedFields' => $changed,
        ]);

        return response()->json(['success' => true, 'data' => DohJson::documentSourceToCamel($row->fresh())]);
    }

    public function softDelete(Request $request, int $item_id): JsonResponse
    {
        $row = DocumentSource::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        if (! $this->canAccessDocumentRowForRequest($request, $row)) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        $row->deleted_at = Carbon::now();
        $row->save();

        AuditLogService::logDocumentEvent($request, 'document.deleted', $row, [
            'mode' => 'trash',
        ]);

        return response()->json(['success' => true, 'message' => 'Document moved to Trash']);
    }

    public function bulkSoftDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        $clean = [];
        foreach ($ids as $id) {
            $clean[] = (int) $id;
        }
        $clean = array_values(array_filter($clean));
        if ($clean === []) {
            return response()->json(['success' => false, 'error' => 'No valid IDs'], 400);
        }
        $allowed = [];
        foreach ($clean as $iid) {
            $row = DocumentSource::query()->find($iid);
            if ($row && $this->canAccessDocumentRowForRequest($request, $row)) {
                $allowed[] = $iid;
            }
        }
        if ($allowed === []) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        DocumentSource::query()->whereIn('id', $allowed)->update(['deleted_at' => Carbon::now()]);
        foreach ($allowed as $iid) {
            $row = DocumentSource::query()->find((int) $iid);
            if ($row) {
                AuditLogService::logDocumentEvent($request, 'document.deleted', $row, [
                    'mode' => 'trash',
                    'bulk' => true,
                ]);
            }
        }

        return response()->json(['success' => true, 'message' => count($allowed).' item(s) moved to Trash']);
    }

    public function restore(Request $request, int $item_id): JsonResponse
    {
        $row = DocumentSource::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        if (! $this->canAccessDocumentRowForRequest($request, $row)) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        $row->deleted_at = null;
        $row->save();

        AuditLogService::logDocumentEvent($request, 'document.restored', $row);

        return response()->json(['success' => true, 'data' => DohJson::documentSourceToCamel($row), 'message' => 'Document restored']);
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        $restored = [];
        foreach ($ids as $id) {
            $iid = (int) $id;
            $row = DocumentSource::query()->find($iid);
            if (! $row) {
                continue;
            }
            if (! $this->canAccessDocumentRowForRequest($request, $row)) {
                continue;
            }
            $row->deleted_at = null;
            $row->save();
            AuditLogService::logDocumentEvent($request, 'document.restored', $row, ['bulk' => true]);
            $restored[] = $iid;
        }

        return response()->json(['success' => true, 'message' => count($restored).' item(s) restored', 'restoredIds' => $restored]);
    }

    public function permanentDelete(Request $request, int $item_id): JsonResponse
    {
        $row = DocumentSource::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        if (! $this->canAccessDocumentRowForRequest($request, $row)) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        if ($row->deleted_at === null) {
            return response()->json(['success' => false, 'error' => 'Only documents in Trash can be permanently deleted. Delete from Outbox first.'], 400);
        }
        AuditLogService::logDocumentEvent($request, 'document.permanently_deleted', $row);
        DocumentDestination::query()->where('document_source_id', $item_id)->delete();
        $row->delete();

        return response()->json(['success' => true, 'message' => 'Document permanently deleted']);
    }

    public function bulkPermanentDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        $deleted = 0;
        foreach ($ids as $id) {
            $iid = (int) $id;
            $row = DocumentSource::query()->find($iid);
            if (! $row) {
                continue;
            }
            if (! $this->canAccessDocumentRowForRequest($request, $row)) {
                continue;
            }
            if ($row->deleted_at === null) {
                continue;
            }
            AuditLogService::logDocumentEvent($request, 'document.permanently_deleted', $row, ['bulk' => true]);
            DocumentDestination::query()->where('document_source_id', $iid)->delete();
            $row->delete();
            $deleted++;
        }

        return response()->json(['success' => true, 'message' => $deleted.' item(s) permanently deleted']);
    }

    public function uploadAttachment(Request $request): JsonResponse
    {
        $file = $request->file('file');
        $documentId = $request->input('documentId');
        if (! $file) {
            return response()->json(['success' => false, 'error' => 'No file provided'], 400);
        }
        if ($documentId === null || $documentId === '') {
            return response()->json(['success' => false, 'error' => 'documentId is required'], 400);
        }
        $documentId = (int) $documentId;
        $row = DocumentSource::query()->find($documentId);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Document not found'], 404);
        }
        if (! $this->canAccessDocumentRowForRequest($request, $row)) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        $filename = (string) ($file->getClientOriginalName() ?: 'attachment');
        $safe = preg_replace('/[^a-zA-Z0-9._\- ]/', '', $filename) ?: 'attachment';
        $path = $documentId.'/'.Str::uuid()->toString().'_'.$safe;
        Storage::disk('local')->put(self::ATTACH_PREFIX.'/'.$path, file_get_contents($file->getRealPath()));

        AuditLogService::logDocumentEvent($request, 'document.attachment_uploaded', $row, [
            'filename' => $filename,
            'path' => $path,
        ]);

        return response()->json(['success' => true, 'path' => $path, 'filename' => $filename], 201);
    }

    public function attachmentUrl(Request $request, int $item_id): JsonResponse
    {
        $row = DocumentSource::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Document not found'], 404);
        }
        $ec = $this->employeeScope($request);
        if ($ec && ! $this->canDownloadAttachment($ec, $row)) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        $path = trim((string) ($row->attachment_list ?? ''));
        if ($path === '') {
            return response()->json(['success' => false, 'error' => 'No attachment for this document. If you added a file, the upload may have failed (e.g. storage bucket not set up).'], 404);
        }
        $qs = ['employee_code' => $ec ?? ''];
        $url = url('/api/document-source/'.$item_id.'/attachment-file?'.http_build_query(array_filter($qs)));

        return response()->json(['success' => true, 'url' => $url]);
    }

    public function attachmentFile(Request $request, int $item_id): StreamedResponse|JsonResponse
    {
        $row = DocumentSource::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Document not found'], 404);
        }
        $ec = $this->employeeScope($request);
        if ($ec && ! $this->canDownloadAttachment($ec, $row)) {
            return response()->json(['success' => false, 'error' => 'Not found or access denied'], 403);
        }
        $path = trim((string) ($row->attachment_list ?? ''));
        if ($path === '') {
            return response()->json(['success' => false, 'error' => 'No attachment'], 404);
        }
        $full = storage_path('app/'.self::ATTACH_PREFIX.'/'.$path);
        if (! is_file($full)) {
            return response()->json(['success' => false, 'error' => 'File missing on server'], 404);
        }

        return response()->stream(function () use ($full) {
            readfile($full);
        }, 200, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="'.basename($full).'"',
        ]);
    }

    private function payloadToSnake(array $data): array
    {
        return [
            'subject' => $data['subject'] ?? '',
            'document_type' => $data['documentType'] ?? '',
            'source_type' => $data['sourceType'] ?? null,
            'internal_originating_office' => $data['internalOriginatingOffice'] ?? '',
            'internal_originating_employee' => $data['internalOriginatingEmployee'] ?? '',
            'external_originating_office' => $data['externalOriginatingOffice'] ?? '',
            'external_originating_employee' => $data['externalOriginatingEmployee'] ?? '',
            'no_of_pages' => $data['noOfPages'] ?? '',
            'attached_document_filename' => $data['attachedDocumentFilename'] ?? '',
            'attachment_list' => $data['attachmentList'] ?? '',
            'userid' => $data['userid'] ?? '',
            'in_sequence' => $data['inSequence'] ?? '',
            'remarks' => $data['remarks'] ?? '',
            'route_no' => trim((string) ($data['routeNo'] ?? $data['route_no'] ?? '')),
        ];
    }

    /**
     * Match Supabase trigger: R{year}-######### using the highest existing suffix for this year.
     */
    private function nextDocumentSourceRouteNo(): string
    {
        $year = date('Y');
        $prefix = 'R'.$year.'-';
        $max = DocumentSource::query()
            ->where('route_no', 'like', $prefix.'%')
            ->pluck('route_no')
            ->map(function (string $rn) use ($prefix) {
                $suffix = substr($rn, strlen($prefix));

                return ctype_digit($suffix) ? (int) $suffix : 0;
            })
            ->max();

        return $prefix.str_pad((string) (($max ?? 0) + 1), 9, '0', STR_PAD_LEFT);
    }

    private function payloadToSnakeUpdate(array $data): array
    {
        $out = [];
        if (array_key_exists('subject', $data)) {
            $out['subject'] = $data['subject'];
        }
        if (array_key_exists('documentType', $data)) {
            $out['document_type'] = $data['documentType'];
        }
        if (array_key_exists('sourceType', $data)) {
            $out['source_type'] = $data['sourceType'];
        }
        if (array_key_exists('internalOriginatingOffice', $data)) {
            $out['internal_originating_office'] = $data['internalOriginatingOffice'];
        }
        if (array_key_exists('internalOriginatingEmployee', $data)) {
            $out['internal_originating_employee'] = $data['internalOriginatingEmployee'];
        }
        if (array_key_exists('externalOriginatingOffice', $data)) {
            $out['external_originating_office'] = $data['externalOriginatingOffice'];
        }
        if (array_key_exists('externalOriginatingEmployee', $data)) {
            $out['external_originating_employee'] = $data['externalOriginatingEmployee'];
        }
        if (array_key_exists('noOfPages', $data)) {
            $out['no_of_pages'] = $data['noOfPages'];
        }
        if (array_key_exists('attachedDocumentFilename', $data)) {
            $out['attached_document_filename'] = $data['attachedDocumentFilename'];
        }
        if (array_key_exists('attachmentList', $data)) {
            $out['attachment_list'] = $data['attachmentList'];
        }
        if (array_key_exists('userid', $data)) {
            $out['userid'] = $data['userid'];
        }
        if (array_key_exists('inSequence', $data)) {
            $out['in_sequence'] = $data['inSequence'];
        }
        if (array_key_exists('remarks', $data)) {
            $out['remarks'] = $data['remarks'];
        }

        return $out;
    }
}
