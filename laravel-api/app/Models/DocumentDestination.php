<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentDestination extends Model
{
    protected $table = 'document_destination';

    protected $fillable = [
        'document_source_id',
        'document_control_no',
        'route_no',
        'sequence_no',
        'destination_office',
        'employee_action_officer',
        'action_required',
        'date_released',
        'time_released',
        'date_required',
        'time_required',
        'date_received',
        'time_received',
        'remarks',
        'action_taken',
        'remarks_on_action_taken',
        'date_acted_upon',
        'time_acted_upon',
    ];

    public function source(): BelongsTo
    {
        return $this->belongsTo(DocumentSource::class, 'document_source_id');
    }
}
