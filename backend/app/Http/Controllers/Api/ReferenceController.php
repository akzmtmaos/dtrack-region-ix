<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActionOfficer;
use App\Models\ActionRequired;
use App\Models\ActionTaken;
use App\Models\DocumentActionRequiredDay;
use App\Models\DocumentSource;
use App\Models\DocumentType;
use App\Models\Office;
use App\Models\Region;
use App\Models\User;
use App\Models\UserLevel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ReferenceController extends Controller
{
    // --- Action Required ---
    public function actionRequiredList(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ActionRequired::query()->orderBy('id')->get()]);
    }

    public function actionRequiredCreate(Request $request): JsonResponse
    {
        $v = trim((string) $request->input('actionRequired', ''));
        if ($v === '') {
            return response()->json(['success' => false, 'error' => 'Action Required field is required'], 400);
        }
        $row = ActionRequired::query()->create(['action_required' => $v]);

        return response()->json(['success' => true, 'data' => $row], 201);
    }

    public function actionRequiredUpdate(Request $request, int $item_id): JsonResponse
    {
        $row = ActionRequired::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Item not found or update failed'], 404);
        }
        $row->action_required = $request->input('actionRequired', $row->action_required);
        $row->save();

        return response()->json(['success' => true, 'data' => $row]);
    }

    public function actionRequiredDelete(int $item_id): JsonResponse
    {
        ActionRequired::query()->where('id', $item_id)->delete();

        return response()->json(['success' => true, 'message' => 'Action required item deleted successfully']);
    }

    public function actionRequiredBulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        ActionRequired::query()->whereIn('id', $ids)->delete();

        return response()->json(['success' => true, 'message' => count($ids).' item(s) deleted successfully']);
    }

    // --- Action Officer ---
    /** True when user_level names an Action Officer (matches Registered Users wording). */
    private static function userLevelIsActionOfficer(?string $level): bool
    {
        $l = strtolower((string) $level);

        return str_contains($l, 'action') && str_contains($l, 'officer');
    }

    /**
     * Reference table rows plus registered {@see User} accounts with Action Officer level
     * (so people added via Registered Users appear here without duplicating employee_code).
     */
    public function actionOfficerList(): JsonResponse
    {
        $fromAo = ActionOfficer::query()->orderBy('id')->get();

        $codesInReferenceTable = [];
        foreach ($fromAo as $row) {
            $ec = strtolower(trim((string) ($row->employee_code ?? '')));
            if ($ec !== '') {
                $codesInReferenceTable[$ec] = true;
            }
        }

        $out = [];
        foreach ($fromAo as $row) {
            $a = $row->makeHidden(['user_password'])->toArray();
            $a['source'] = 'action-officer';
            $out[] = $a;
        }

        foreach (User::query()->orderBy('id')->get() as $u) {
            if (! self::userLevelIsActionOfficer($u->user_level)) {
                continue;
            }
            $ec = strtolower(trim((string) ($u->employee_code ?? '')));
            if ($ec === '' || isset($codesInReferenceTable[$ec])) {
                continue;
            }
            $out[] = [
                'id' => $u->id,
                'employee_code' => $u->employee_code,
                'last_name' => $u->last_name,
                'first_name' => $u->first_name,
                'middle_name' => $u->middle_name,
                'office' => $u->office,
                'user_level' => $u->user_level,
                'office_representative' => $u->office_representative,
                'verified' => (bool) $u->verified,
                'source' => 'users',
            ];
        }

        return response()->json(['success' => true, 'data' => $out]);
    }

    public function actionOfficerCreate(Request $request): JsonResponse
    {
        $employeeCode = trim((string) $request->input('employeeCode', ''));
        if ($employeeCode === '') {
            return response()->json(['success' => false, 'error' => 'Employee Code is required'], 400);
        }
        if (trim((string) $request->input('lastName', '')) === '') {
            return response()->json(['success' => false, 'error' => 'Last Name is required'], 400);
        }
        if (trim((string) $request->input('firstName', '')) === '') {
            return response()->json(['success' => false, 'error' => 'First Name is required'], 400);
        }
        if (trim((string) $request->input('middleName', '')) === '') {
            return response()->json(['success' => false, 'error' => 'Middle Name is required'], 400);
        }
        if ((string) $request->input('userPassword', '') === '') {
            return response()->json(['success' => false, 'error' => 'User Password is required'], 400);
        }
        if (trim((string) $request->input('userLevel', '')) === '') {
            return response()->json(['success' => false, 'error' => 'User Level is required'], 400);
        }

        $row = ActionOfficer::query()->create([
            'employee_code' => $employeeCode,
            'last_name' => $request->input('lastName'),
            'first_name' => $request->input('firstName'),
            'middle_name' => $request->input('middleName', ''),
            'office' => $request->input('office') ?: null,
            'user_password' => Hash::make($request->input('userPassword')),
            'user_level' => $request->input('userLevel'),
            'office_representative' => $request->input('officeRepresentative') ?: null,
            'verified' => false,
        ]);

        return response()->json(['success' => true, 'data' => $row->makeHidden(['user_password'])], 201);
    }

    public function actionOfficerUpdate(Request $request, int $item_id): JsonResponse
    {
        $row = ActionOfficer::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Item not found or update failed'], 404);
        }
        $data = [];
        foreach (['employeeCode' => 'employee_code', 'lastName' => 'last_name', 'firstName' => 'first_name', 'middleName' => 'middle_name', 'office' => 'office', 'userLevel' => 'user_level'] as $req => $col) {
            if ($request->has($req)) {
                $data[$col] = $request->input($req);
            }
        }
        if ($request->has('officeRepresentative')) {
            $data['office_representative'] = $request->input('officeRepresentative') ?: null;
        }
        if ($request->filled('userPassword')) {
            $data['user_password'] = Hash::make($request->input('userPassword'));
        }
        if ($request->has('verified')) {
            $data['verified'] = (bool) $request->input('verified');
        }
        if ($data === []) {
            return response()->json(['success' => false, 'error' => 'No data provided for update'], 400);
        }
        $row->fill($data);
        $row->save();

        return response()->json(['success' => true, 'data' => $row->makeHidden(['user_password'])]);
    }

    public function actionOfficerDelete(int $item_id): JsonResponse
    {
        ActionOfficer::query()->where('id', $item_id)->delete();

        return response()->json(['success' => true, 'message' => 'Action officer item deleted successfully']);
    }

    public function actionOfficerBulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        ActionOfficer::query()->whereIn('id', $ids)->delete();

        return response()->json(['success' => true, 'message' => count($ids).' item(s) deleted successfully']);
    }

    // --- Action Taken ---
    public function actionTakenList(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ActionTaken::query()->orderBy('id')->get()]);
    }

    public function actionTakenCreate(Request $request): JsonResponse
    {
        $v = trim((string) $request->input('actionTaken', ''));
        if ($v === '') {
            return response()->json(['success' => false, 'error' => 'Action Taken field is required'], 400);
        }
        $row = ActionTaken::query()->create(['action_taken' => $v]);

        return response()->json(['success' => true, 'data' => $row], 201);
    }

    public function actionTakenUpdate(Request $request, int $item_id): JsonResponse
    {
        $row = ActionTaken::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Item not found or update failed'], 404);
        }
        $row->action_taken = $request->input('actionTaken', $row->action_taken);
        $row->save();

        return response()->json(['success' => true, 'data' => $row]);
    }

    public function actionTakenDelete(int $item_id): JsonResponse
    {
        ActionTaken::query()->where('id', $item_id)->delete();

        return response()->json(['success' => true, 'message' => 'Action taken item deleted successfully']);
    }

    public function actionTakenBulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        ActionTaken::query()->whereIn('id', $ids)->delete();

        return response()->json(['success' => true, 'message' => count($ids).' item(s) deleted successfully']);
    }

    // --- Document Type ---
    public function documentTypeList(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => DocumentType::query()->orderBy('id')->get()]);
    }

    public function documentTypeCreate(Request $request): JsonResponse
    {
        $v = trim((string) $request->input('documentType', ''));
        if ($v === '') {
            return response()->json(['success' => false, 'error' => 'Document Type is required'], 400);
        }
        $row = DocumentType::query()->create(['document_type' => $v]);

        return response()->json(['success' => true, 'data' => $row], 201);
    }

    public function documentTypeUpdate(Request $request, int $item_id): JsonResponse
    {
        $row = DocumentType::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Item not found'], 404);
        }
        $newName = trim((string) $request->input('documentType', ''));
        if ($newName === '') {
            return response()->json(['success' => false, 'error' => 'Document Type is required'], 400);
        }
        $oldName = trim((string) $row->document_type);
        if ($oldName === $newName) {
            return response()->json(['success' => true, 'data' => $row]);
        }
        $row->document_type = $newName;
        $row->save();

        DocumentSource::query()->get()->each(function (DocumentSource $s) use ($oldName, $newName) {
            if (trim((string) $s->document_type) === $oldName) {
                $s->document_type = $newName;
                $s->save();
            }
        });
        DocumentActionRequiredDay::query()->get()->each(function (DocumentActionRequiredDay $d) use ($oldName, $newName) {
            if (trim((string) $d->document_type) === $oldName) {
                $d->document_type = $newName;
                $d->save();
            }
        });

        return response()->json(['success' => true, 'data' => $row]);
    }

    public function documentTypeSyncDisplayName(Request $request): JsonResponse
    {
        $oldName = trim((string) $request->input('oldName', ''));
        $newName = trim((string) $request->input('newName', ''));
        if ($oldName === '' || $newName === '') {
            return response()->json(['success' => false, 'error' => 'oldName and newName are required'], 400);
        }
        if ($oldName === $newName) {
            return response()->json(['success' => true, 'updatedSources' => 0, 'updatedDays' => 0]);
        }
        $updatedSources = 0;
        $updatedDays = 0;
        foreach (DocumentSource::query()->get() as $s) {
            if (trim((string) $s->document_type) === $oldName) {
                $s->document_type = $newName;
                $s->save();
                $updatedSources++;
            }
        }
        foreach (DocumentActionRequiredDay::query()->get() as $d) {
            if (trim((string) $d->document_type) === $oldName) {
                $d->document_type = $newName;
                $d->save();
                $updatedDays++;
            }
        }

        return response()->json(['success' => true, 'updatedSources' => $updatedSources, 'updatedDays' => $updatedDays]);
    }

    public function documentTypeDelete(int $item_id): JsonResponse
    {
        DocumentType::query()->where('id', $item_id)->delete();

        return response()->json(['success' => true, 'message' => 'Document type item deleted successfully']);
    }

    public function documentTypeBulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        DocumentType::query()->whereIn('id', $ids)->delete();

        return response()->json(['success' => true, 'message' => count($ids).' item(s) deleted successfully']);
    }

    // --- Document Action Required Days ---
    public function documentActionRequiredDaysList(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => DocumentActionRequiredDay::query()->orderBy('id')->get()]);
    }

    public function documentActionRequiredDaysCreate(Request $request): JsonResponse
    {
        $documentType = trim((string) $request->input('documentType', ''));
        $actionRequired = trim((string) $request->input('actionRequired', ''));
        $requiredDays = $request->input('requiredDays');
        if ($documentType === '') {
            return response()->json(['success' => false, 'error' => 'Document Type is required'], 400);
        }
        if ($actionRequired === '') {
            return response()->json(['success' => false, 'error' => 'Action Required is required'], 400);
        }
        if ($requiredDays === null || $requiredDays === '') {
            return response()->json(['success' => false, 'error' => 'Required Days is required'], 400);
        }
        $rd = (int) $requiredDays;
        $row = DocumentActionRequiredDay::query()->create([
            'document_type' => $documentType,
            'action_required' => $actionRequired,
            'required_days' => $rd,
        ]);

        return response()->json(['success' => true, 'data' => $row], 201);
    }

    public function documentActionRequiredDaysUpdate(Request $request, int $item_id): JsonResponse
    {
        $row = DocumentActionRequiredDay::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Item not found or update failed'], 404);
        }
        if ($request->has('documentType')) {
            $row->document_type = $request->input('documentType');
        }
        if ($request->has('actionRequired')) {
            $row->action_required = $request->input('actionRequired');
        }
        if ($request->has('requiredDays')) {
            $row->required_days = (int) $request->input('requiredDays');
        }
        $row->save();

        return response()->json(['success' => true, 'data' => $row]);
    }

    public function documentActionRequiredDaysDelete(int $item_id): JsonResponse
    {
        DocumentActionRequiredDay::query()->where('id', $item_id)->delete();

        return response()->json(['success' => true, 'message' => 'Item deleted successfully']);
    }

    public function documentActionRequiredDaysBulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        DocumentActionRequiredDay::query()->whereIn('id', $ids)->delete();

        return response()->json(['success' => true, 'message' => count($ids).' item(s) deleted successfully']);
    }

    // --- Office ---
    public function officeList(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Office::query()->orderBy('id')->get()]);
    }

    public function officeCreate(Request $request): JsonResponse
    {
        $office = trim((string) $request->input('office', ''));
        if ($office === '') {
            return response()->json(['success' => false, 'error' => 'Office is required'], 400);
        }
        $row = Office::query()->create([
            'office' => $office,
            'region' => $request->input('region'),
            'short_name' => $request->input('shortName'),
            'head_office' => $request->input('headOffice'),
        ]);

        return response()->json(['success' => true, 'data' => $row], 201);
    }

    public function officeUpdate(Request $request, int $item_id): JsonResponse
    {
        $row = Office::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Item not found or update failed'], 404);
        }
        if ($request->has('office')) {
            $row->office = $request->input('office');
        }
        if ($request->has('region')) {
            $row->region = $request->input('region');
        }
        if ($request->has('shortName')) {
            $row->short_name = $request->input('shortName');
        }
        if ($request->has('headOffice')) {
            $row->head_office = $request->input('headOffice');
        }
        $row->save();

        return response()->json(['success' => true, 'data' => $row]);
    }

    public function officeDelete(int $item_id): JsonResponse
    {
        Office::query()->where('id', $item_id)->delete();

        return response()->json(['success' => true, 'message' => 'Office item deleted successfully']);
    }

    public function officeBulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        Office::query()->whereIn('id', $ids)->delete();

        return response()->json(['success' => true, 'message' => count($ids).' item(s) deleted successfully']);
    }

    // --- Region ---
    public function regionList(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Region::query()->orderBy('id')->get()]);
    }

    public function regionCreate(Request $request): JsonResponse
    {
        $regionName = trim((string) $request->input('regionName', ''));
        $nscbCode = trim((string) $request->input('nscbCode', ''));
        $nscbName = trim((string) $request->input('nscbName', ''));
        $addedBy = trim((string) $request->input('addedBy', ''));
        $status = trim((string) $request->input('status', ''));
        if ($regionName === '') {
            return response()->json(['success' => false, 'error' => 'Region Name is required'], 400);
        }
        if ($nscbCode === '') {
            return response()->json(['success' => false, 'error' => 'NSCB Code is required'], 400);
        }
        if ($nscbName === '') {
            return response()->json(['success' => false, 'error' => 'NSCB Name is required'], 400);
        }
        if ($addedBy === '') {
            return response()->json(['success' => false, 'error' => 'Added By is required'], 400);
        }
        if ($status === '') {
            return response()->json(['success' => false, 'error' => 'Status is required'], 400);
        }
        $row = Region::query()->create([
            'region_name' => $regionName,
            'nscb_code' => $nscbCode,
            'nscb_name' => $nscbName,
            'added_by' => $addedBy,
            'status' => $status,
        ]);

        return response()->json(['success' => true, 'data' => $row], 201);
    }

    public function regionUpdate(Request $request, int $item_id): JsonResponse
    {
        $row = Region::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Item not found or update failed'], 404);
        }
        if ($request->has('regionName')) {
            $row->region_name = $request->input('regionName');
        }
        if ($request->has('nscbCode')) {
            $row->nscb_code = $request->input('nscbCode');
        }
        if ($request->has('nscbName')) {
            $row->nscb_name = $request->input('nscbName');
        }
        if ($request->has('addedBy')) {
            $row->added_by = $request->input('addedBy');
        }
        if ($request->has('status')) {
            $row->status = $request->input('status');
        }
        $row->save();

        return response()->json(['success' => true, 'data' => $row]);
    }

    public function regionDelete(int $item_id): JsonResponse
    {
        Region::query()->where('id', $item_id)->delete();

        return response()->json(['success' => true, 'message' => 'Region item deleted successfully']);
    }

    public function regionBulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        Region::query()->whereIn('id', $ids)->delete();

        return response()->json(['success' => true, 'message' => count($ids).' item(s) deleted successfully']);
    }

    // --- User Levels ---
    public function userLevelsList(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => UserLevel::query()->orderBy('id')->get()]);
    }

    public function userLevelsCreate(Request $request): JsonResponse
    {
        $v = trim((string) $request->input('userLevelName', ''));
        if ($v === '') {
            return response()->json(['success' => false, 'error' => 'User Level Name is required'], 400);
        }
        $row = UserLevel::query()->create(['user_level_name' => $v]);

        return response()->json(['success' => true, 'data' => $row], 201);
    }

    public function userLevelsUpdate(Request $request, int $item_id): JsonResponse
    {
        $row = UserLevel::query()->find($item_id);
        if (! $row) {
            return response()->json(['success' => false, 'error' => 'Item not found or update failed'], 404);
        }
        $row->user_level_name = $request->input('userLevelName', $row->user_level_name);
        $row->save();

        return response()->json(['success' => true, 'data' => $row]);
    }

    public function userLevelsDelete(int $item_id): JsonResponse
    {
        UserLevel::query()->where('id', $item_id)->delete();

        return response()->json(['success' => true, 'message' => 'User level item deleted successfully']);
    }

    public function userLevelsBulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || $ids === []) {
            return response()->json(['success' => false, 'error' => 'IDs list is required'], 400);
        }
        UserLevel::query()->whereIn('id', $ids)->delete();

        return response()->json(['success' => true, 'message' => count($ids).' item(s) deleted successfully']);
    }
}
