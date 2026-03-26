<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $table = 'region';

    protected $fillable = [
        'region_name',
        'nscb_code',
        'nscb_name',
        'added_by',
        'status',
    ];
}
