<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'email',
        'full_name',
        'employee_code',
        'office',
        'user_level',
        'office_representative',
    ];
}
