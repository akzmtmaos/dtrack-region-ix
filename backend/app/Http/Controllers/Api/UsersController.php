<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Support\DohJson;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    private static function isAdministrator(?User $u): bool
    {
        if (! $u) {
            return false;
        }
        $l = strtolower(trim((string) ($u->user_level ?? '')));

        return $l === 'administrator' || $l === 'admin';
    }

    /** Any Action Officer user level. */
    private static function isActionOfficer(?User $u): bool
    {
        if (! $u) {
            return false;
        }
        $l = strtolower((string) ($u->user_level ?? ''));

        return str_contains($l, 'action') && str_contains($l, 'officer');
    }

    /** Action Officer user level and office head (Office Rep. = Yes). */
    private static function isActionOfficerHead(?User $u): bool
    {
        if (! $u) {
            return false;
        }
        $l = strtolower((string) ($u->user_level ?? ''));
        $isAo = str_contains($l, 'action') && str_contains($l, 'officer');
        $rep = strtolower(trim((string) ($u->office_representative ?? '')));

        return $isAo && $rep === 'yes';
    }

    private static function sameOffice(User $a, User $b): bool
    {
        $oa = strtolower(trim((string) ($a->office ?? '')));
        $ob = strtolower(trim((string) ($b->office ?? '')));

        return $oa !== '' && $oa === $ob;
    }

    /** Administrator, or Action Officer head verifying someone in the same office. */
    private static function actorCanVerifyUser(?User $actor, User $target): bool
    {
        if (! $actor) {
            return false;
        }
        if (self::isAdministrator($actor)) {
            return true;
        }
        if (self::isActionOfficerHead($actor) && self::sameOffice($actor, $target)) {
            return true;
        }

        return false;
    }

    /** @return JsonResponse|null null = allowed */
    private function authorizeUsersTableUpdate(?User $actor, User $target, array $usersData): ?JsonResponse
    {
        $onlyApprove = count($usersData) === 1
            && array_key_exists('verified', $usersData)
            && $usersData['verified'] === true;

        if ($onlyApprove) {
            if (! $actor) {
                return response()->json(['success' => false, 'error' => 'Sign-in required to verify accounts'], 403);
            }
            if (! self::actorCanVerifyUser($actor, $target)) {
                return response()->json(['success' => false, 'error' => 'You do not have permission to verify this account'], 403);
            }

            return null;
        }

        $self = $actor && strcasecmp(trim((string) $actor->employee_code), trim((string) $target->employee_code)) === 0;
        if ($self) {
            if (array_key_exists('verified', $usersData)) {
                return response()->json(['success' => false, 'error' => 'You cannot change your own verification status'], 403);
            }

            return null;
        }

        if (! $actor) {
            return response()->json(['success' => false, 'error' => 'Authentication required'], 403);
        }
        if (! self::isAdministrator($actor)) {
            return response()->json(['success' => false, 'error' => 'Only administrators can manage other user accounts'], 403);
        }

        return null;
    }

    public function index(Request $request): JsonResponse
    {
        $combined = [];

        foreach (User::query()->orderBy('id')->get() as $row) {
            $u = $row->toArray();
            $u['source'] = 'users';
            $combined[] = $u;
        }

        foreach (Profile::query()->orderBy('id')->get() as $row) {
            $combined[] = [
                'id' => $row->id,
                'employee_code' => $row->employee_code,
                'last_name' => '',
                'first_name' => $row->full_name,
                'middle_name' => '',
                'office' => $row->office,
                'user_level' => $row->user_level,
                'office_representative' => $row->office_representative,
                'verified' => true,
                'source' => 'profiles',
            ];
        }

        $viewerEc = trim((string) $request->header('X-Viewer-Employee-Code', ''));
        if ($viewerEc !== '') {
            $viewer = User::query()->where('employee_code', $viewerEc)->first();
            if ($viewer && ! self::isAdministrator($viewer) && self::isActionOfficer($viewer)) {
                $officeNorm = strtolower(trim((string) ($viewer->office ?? '')));
                if ($officeNorm === '') {
                    $combined = [];
                } else {
                    $combined = array_values(array_filter($combined, function (array $row) use ($officeNorm) {
                        $o = strtolower(trim((string) ($row['office'] ?? '')));

                        return $o !== '' && $o === $officeNorm;
                    }));
                }
            }
        }

        return response()->json(['success' => true, 'data' => $combined]);
    }

    public function update(Request $request, string $item_id): JsonResponse
    {
        $usersData = [];
        if ($request->has('verified')) {
            $usersData['verified'] = (bool) $request->input('verified');
        }
        if ($request->has('employeeCode')) {
            $usersData['employee_code'] = $request->input('employeeCode');
        }
        if ($request->has('lastName')) {
            $usersData['last_name'] = $request->input('lastName');
        }
        if ($request->has('firstName')) {
            $usersData['first_name'] = $request->input('firstName');
        }
        if ($request->has('middleName')) {
            $usersData['middle_name'] = $request->input('middleName');
        }
        if ($request->has('office')) {
            $usersData['office'] = $request->input('office') ?: null;
        }
        if ($request->filled('userPassword')) {
            $usersData['user_password'] = Hash::make($request->input('userPassword'));
        }
        if ($request->has('userLevel')) {
            $usersData['user_level'] = $request->input('userLevel');
        }
        if ($request->has('officeRepresentative')) {
            $usersData['office_representative'] = $request->input('officeRepresentative') ?: null;
        }

        $profData = [];
        if ($request->has('employeeCode')) {
            $profData['employee_code'] = $request->input('employeeCode');
        }
        if ($request->has('office')) {
            $profData['office'] = $request->input('office') ?: null;
        }
        if ($request->has('userLevel')) {
            $profData['user_level'] = $request->input('userLevel');
        }
        if ($request->has('officeRepresentative')) {
            $profData['office_representative'] = $request->input('officeRepresentative') ?: null;
        }
        if ($request->has('firstName') || $request->has('lastName') || $request->has('middleName')) {
            $ln = trim((string) $request->input('lastName', ''));
            $fn = trim((string) $request->input('firstName', ''));
            $mn = trim((string) $request->input('middleName', ''));
            $mid = ($mn !== '' && $mn !== '-') ? ' '.$mn : '';
            $profData['full_name'] = trim("{$ln}, {$fn}{$mid}");
        }

        if ($usersData === [] && $profData === []) {
            return response()->json(['success' => false, 'error' => 'No data provided for update'], 400);
        }

        $uidInt = ctype_digit($item_id) ? (int) $item_id : null;

        if ($uidInt !== null && $usersData !== []) {
            $user = User::query()->find($uidInt);
            if ($user) {
                $actorCode = trim((string) $request->header('X-Acting-Employee-Code', ''));
                if ($actorCode === '') {
                    $actorCode = trim((string) ($request->input('actingEmployeeCode') ?? $request->input('acting_employee_code') ?? ''));
                }
                $actor = $actorCode !== '' ? User::query()->where('employee_code', $actorCode)->first() : null;

                $deny = $this->authorizeUsersTableUpdate($actor, $user, $usersData);
                if ($deny !== null) {
                    return $deny;
                }

                $user->fill($usersData);
                $user->save();

                return response()->json(['success' => true, 'user' => DohJson::userToCamel($user)]);
            }
        }

        if ($uidInt === null && $profData !== []) {
            $profile = Profile::query()->find($item_id);
            if ($profile) {
                $profile->fill($profData);
                $profile->save();

                return response()->json(['success' => true, 'user' => DohJson::profileToCamel($profile)]);
            }
        }

        return response()->json(['success' => false, 'error' => 'User not found or update failed'], 404);
    }
}
