<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentSource extends Model
{
    protected $table = 'document_source';

    protected $fillable = [
        'document_control_no',
        'route_no',
        'subject',
        'document_type',
        'source_type',
        'internal_originating_office',
        'internal_originating_employee',
        'external_originating_office',
        'external_originating_employee',
        'no_of_pages',
        'attached_document_filename',
        'attachment_list',
        'userid',
        'current_custodian',
        'in_sequence',
        'remarks',
        'deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'deleted_at' => 'datetime',
        ];
    }

    public function destinations(): HasMany
    {
        return $this->hasMany(DocumentDestination::class, 'document_source_id');
    }
}
