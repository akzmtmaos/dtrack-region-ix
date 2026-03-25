<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_logs';

    protected $fillable = [
        'event_type',
        'entity_type',
        'entity_id',
        'document_source_id',
        'document_control_no',
        'route_no',
        'actor_employee_code',
        'actor_display_name',
        'owner_employee_code',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }
}

