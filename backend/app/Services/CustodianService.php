<?php

namespace App\Services;

use App\Models\DocumentDestination;
use App\Models\DocumentSource;

class CustodianService
{
    public static function recompute(int $documentSourceId): void
    {
        $src = DocumentSource::query()->find($documentSourceId);
        if (! $src) {
            return;
        }
        $creator = trim((string) ($src->userid ?? ''));
        $rows = DocumentDestination::query()
            ->where('document_source_id', $documentSourceId)
            ->orderBy('sequence_no')
            ->get();

        $custodian = $creator;
        $bestSeq = -1;
        foreach ($rows as $r) {
            $dr = $r->date_received;
            if ($dr === null || trim((string) $dr) === '') {
                continue;
            }
            $seq = (int) $r->sequence_no;
            if ($seq >= $bestSeq) {
                $bestSeq = $seq;
                $off = trim((string) ($r->employee_action_officer ?? ''));
                if ($off !== '') {
                    $custodian = $off;
                }
            }
        }
        $src->current_custodian = $custodian;
        $src->save();
    }
}
