<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';

    protected $fillable = [
        'employee_code',
        'last_name',
        'first_name',
        'middle_name',
        'office',
        'user_password',
        'user_level',
        'office_representative',
        'verified',
    ];

    protected $hidden = ['user_password'];

    protected function casts(): array
    {
        return [
            'verified' => 'boolean',
        ];
    }
}
