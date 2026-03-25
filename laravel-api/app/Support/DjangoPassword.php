<?php

namespace App\Support;

use Illuminate\Support\Facades\Hash;

/**
 * Verify Django-style hashes (pbkdf2_sha256$iter$salt$hash) and upgrade to Laravel bcrypt on success.
 */
class DjangoPassword
{
    public static function check(string $plain, string $stored): bool
    {
        $stored = (string) $stored;
        if ($stored === '') {
            return false;
        }
        if (str_contains($stored, '$') && str_starts_with($stored, 'pbkdf2_')) {
            return self::verifyDjangoPbkdf2($plain, $stored);
        }
        if (str_starts_with($stored, '$2y$') || str_starts_with($stored, '$2a$')) {
            return Hash::check($plain, $stored);
        }
        // Legacy plaintext (Django accepted this before re-hash)
        return hash_equals($stored, $plain);
    }

    public static function needsRehash(string $stored): bool
    {
        if ($stored === '' || ! str_contains($stored, '$')) {
            return true;
        }
        if (str_starts_with($stored, 'pbkdf2_')) {
            return true;
        }
        if (str_starts_with($stored, '$2y$') || str_starts_with($stored, '$2a$')) {
            return Hash::needsRehash($stored);
        }
        return true;
    }

    private static function verifyDjangoPbkdf2(string $password, string $encoded): bool
    {
        $parts = explode('$', $encoded);
        if (count($parts) !== 4 || $parts[0] !== 'pbkdf2_sha256') {
            return false;
        }
        $iterations = (int) $parts[1];
        $salt = $parts[2];
        $hashB64 = $parts[3];
        $hash = base64_decode($hashB64, true);
        if ($hash === false) {
            return false;
        }
        $dkLen = strlen($hash);
        $check = hash_pbkdf2('sha256', $password, $salt, $iterations, $dkLen, true);

        return is_string($check) && hash_equals($hash, $check);
    }
}
