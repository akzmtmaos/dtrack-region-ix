<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Ensures a bootstrap administrator exists (Laravel login uses `users` + DjangoPassword/bcrypt).
 *
 * Usage:
 *   ADMIN_INITIAL_PASSWORD='your-secret' php artisan db:seed --class=AdminUserSeeder
 *
 * If ADMIN_INITIAL_PASSWORD is empty, falls back to creating/updating ADMIN only when
 * ADMIN_SEED_PASSWORD is set (same value you use for first login).
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $plain = (string) env('ADMIN_INITIAL_PASSWORD', env('ADMIN_SEED_PASSWORD', ''));
        if ($plain === '') {
            $this->command?->warn('Set ADMIN_INITIAL_PASSWORD (or ADMIN_SEED_PASSWORD) to seed admin password; skipped.');

            return;
        }

        $code = strtoupper(trim((string) env('ADMIN_EMPLOYEE_CODE', 'ADMIN')));

        User::query()->updateOrCreate(
            ['employee_code' => $code],
            [
                'last_name' => 'Administrator',
                'first_name' => 'System',
                'middle_name' => '-',
                'office' => null,
                'user_password' => Hash::make($plain),
                'user_level' => 'Administrator',
                'office_representative' => 'No',
                'verified' => true,
            ]
        );

        $this->command?->info("Administrator upserted: employee_code={$code}");
    }
}
