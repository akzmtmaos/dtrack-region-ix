<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Support\DohJson;
use App\Models\User;
use App\Support\DjangoPassword;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $employeeCode = trim((string) ($request->input('employeeCode') ?? $request->input('employee_code') ?? ''));
        $password = (string) $request->input('password', '');
        if ($employeeCode === '' || $password === '') {
            return response()->json(['success' => false, 'error' => 'Employee code and password are required'], 400);
        }

        $user = User::query()->where('employee_code', $employeeCode)->first();
        if ($user) {
            $stored = (string) $user->user_password;
            if (! DjangoPassword::check($password, $stored)) {
                return response()->json(['success' => false, 'error' => 'Invalid employee code or password'], 401);
            }
            if (! $user->verified) {
                return response()->json([
                    'success' => false,
                    'error' => 'Your account is pending approval. An administrator or your office head (Action Officer with Office Rep.: Yes) must verify your account before you can sign in.',
                ], 403);
            }
            if (DjangoPassword::needsRehash($stored)) {
                $user->user_password = Hash::make($password);
                $user->save();
            }

            return response()->json(['success' => true, 'user' => DohJson::userToCamel($user)]);
        }

        // Optional: profiles table with password — not in legacy Supabase flow without Auth; extend here if needed.

        return response()->json(['success' => false, 'error' => 'Invalid employee code or password'], 401);
    }

    public function register(Request $request): JsonResponse
    {
        $employeeCode = trim((string) ($request->input('employeeCode') ?? ''));
        $lastName = trim((string) $request->input('lastName', ''));
        $firstName = trim((string) $request->input('firstName', ''));
        $middleName = trim((string) $request->input('middleName', ''));
        $office = trim((string) $request->input('office', '')) ?: null;
        $userPassword = (string) ($request->input('userPassword') ?? '') ?: (string) ($request->input('user_password') ?? '');
        $userLevel = trim((string) ($request->input('userLevel') ?? '') ?: (string) ($request->input('user_level') ?? ''));
        $officeRepresentative = trim((string) $request->input('officeRepresentative', '')) ?: null;

        if ($employeeCode === '') {
            return response()->json(['success' => false, 'error' => 'Employee code is required'], 400);
        }
        if ($lastName === '') {
            return response()->json(['success' => false, 'error' => 'Last name is required'], 400);
        }
        if ($firstName === '') {
            return response()->json(['success' => false, 'error' => 'First name is required'], 400);
        }
        if ($middleName === '') {
            return response()->json(['success' => false, 'error' => 'Middle name is required'], 400);
        }
        if ($userPassword === '') {
            return response()->json(['success' => false, 'error' => 'Password is required'], 400);
        }
        if ($userLevel === '') {
            return response()->json(['success' => false, 'error' => 'User level is required'], 400);
        }

        if (User::query()->where('employee_code', $employeeCode)->exists()) {
            return response()->json(['success' => false, 'error' => 'An account with this employee code already exists'], 400);
        }

        $user = User::query()->create([
            'employee_code' => $employeeCode,
            'last_name' => $lastName,
            'first_name' => $firstName,
            'middle_name' => $middleName,
            'office' => $office,
            'user_password' => Hash::make($userPassword),
            'user_level' => $userLevel,
            'office_representative' => $officeRepresentative,
            'verified' => false,
        ]);

        return response()->json(['success' => true, 'user' => DohJson::userToCamel($user)], 201);
    }
}
