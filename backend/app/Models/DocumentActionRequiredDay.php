<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentActionRequiredDay extends Model
{
    protected $table = 'document_action_required_days';

    protected $fillable = [
        'document_type',
        'action_required',
        'required_days',
    ];
}
