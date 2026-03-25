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
    public function index(): JsonResponse
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
