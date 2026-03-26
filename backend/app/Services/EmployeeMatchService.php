<?php

namespace App\Services;

use App\Models\Profile;
use App\Models\User;

class EmployeeMatchService
{
    public static function formatDisplayNameLastFirst(?string $lastName, ?string $firstName, ?string $middleName): string
    {
        $mn = trim((string) $middleName);
        $mid = ($mn !== '' && $mn !== '-') ? ' '.$mn : '';
        $fn = trim((string) $firstName);
        $ln = trim((string) $lastName);
        $name = trim("{$ln}, {$fn}{$mid}");

        return $name !== '' ? $name : '';
    }

    /** @return array<int, string> lowercased candidate strings */
    public static function matchCandidates(string $employeeCode): array
    {
        $ec = trim($employeeCode);
        $candidates = [];
        if ($ec === '') {
            return $candidates;
        }
        $candidates[] = strtolower($ec);

        $user = User::query()->where('employee_code', $ec)->first();
        if ($user) {
            $disp = self::formatDisplayNameLastFirst($user->last_name, $user->first_name, $user->middle_name);
            if ($disp !== '') {
                $candidates[] = strtolower($disp);
            }
        }

        $profile = Profile::query()->where('employee_code', $ec)->first();
        if ($profile && trim((string) $profile->full_name) !== '') {
            $candidates[] = strtolower(trim((string) $profile->full_name));
        }

        return array_values(array_unique($candidates));
    }

    public static function identityMatches(string $employeeCode, mixed $stored): bool
    {
        if ($employeeCode === '' || trim($employeeCode) === '') {
            return true;
        }
        if ($stored === null || trim((string) $stored) === '') {
            return false;
        }
        $ec = strtolower(trim($employeeCode));
        $sv = strtolower(trim((string) $stored));
        if ($sv === $ec) {
            return true;
        }
        if ($ec !== '' && str_contains($sv, '('.$ec.')')) {
            return true;
        }
        $candidates = self::matchCandidates($employeeCode);
        foreach ($candidates as $c) {
            if ($c === $sv) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, string>  $candidates  lowercased
     */
    public static function originatingMatches(?string $fieldVal, array $candidates, string $employeeCode): bool
    {
        $raw = trim((string) $fieldVal);
        if ($raw === '') {
            return false;
        }
        $low = strtolower($raw);
        foreach ($candidates as $c) {
            if ($c !== '' && $low === $c) {
                return true;
            }
        }
        $ec = trim($employeeCode);
        if ($ec !== '' && str_contains($low, '('.strtolower($ec).')')) {
            return true;
        }

        return false;
    }
}
