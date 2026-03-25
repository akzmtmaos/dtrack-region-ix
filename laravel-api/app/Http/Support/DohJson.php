<?php

namespace App\Http\Support;

use App\Models\DocumentDestination;
use App\Models\DocumentSource;
use Carbon\Carbon;

class DohJson
{
    public static function normalizeCreatedAt(mixed $v): string
    {
        if ($v === null) {
            return Carbon::now()->utc()->toIso8601String();
        }
        if ($v instanceof Carbon) {
            return $v->utc()->toIso8601String();
        }
        $s = trim((string) $v);
        if ($s === '') {
            return Carbon::now()->utc()->toIso8601String();
        }
        if (str_contains($s, 'T') || str_contains($s, 'Z')) {
            return $s;
        }

        return $s.'Z';
    }

    public static function documentSourceToCamel(DocumentSource $row): array
    {
        return [
            'id' => $row->id,
            'documentControlNo' => (string) ($row->document_control_no ?? ''),
            'routeNo' => (string) ($row->route_no ?? ''),
            'subject' => (string) ($row->subject ?? ''),
            'documentType' => (string) ($row->document_type ?? ''),
            'sourceType' => (string) ($row->source_type ?? ''),
            'internalOriginatingOffice' => (string) ($row->internal_originating_office ?? ''),
            'internalOriginatingEmployee' => (string) ($row->internal_originating_employee ?? ''),
            'externalOriginatingOffice' => (string) ($row->external_originating_office ?? ''),
            'externalOriginatingEmployee' => (string) ($row->external_originating_employee ?? ''),
            'noOfPages' => (string) ($row->no_of_pages ?? ''),
            'attachedDocumentFilename' => (string) ($row->attached_document_filename ?? ''),
            'attachmentList' => (string) ($row->attachment_list ?? ''),
            'userid' => (string) ($row->userid ?? ''),
            'currentCustodian' => (string) ($row->current_custodian ?? ''),
            'inSequence' => (string) ($row->in_sequence ?? ''),
            'remarks' => (string) ($row->remarks ?? ''),
            'createdAt' => self::normalizeCreatedAt($row->created_at),
            'deletedAt' => $row->deleted_at,
        ];
    }

    public static function documentDestinationToCamel(DocumentDestination $row): array
    {
        return [
            'id' => $row->id,
            'documentSourceId' => $row->document_source_id,
            'documentControlNo' => (string) ($row->document_control_no ?? ''),
            'routeNo' => (string) ($row->route_no ?? ''),
            'sequenceNo' => (int) ($row->sequence_no ?? 0),
            'destinationOffice' => (string) ($row->destination_office ?? ''),
            'employeeActionOfficer' => (string) ($row->employee_action_officer ?? ''),
            'actionRequired' => (string) ($row->action_required ?? ''),
            'dateReleased' => (string) ($row->date_released ?? ''),
            'timeReleased' => (string) ($row->time_released ?? ''),
            'dateRequired' => (string) ($row->date_required ?? ''),
            'timeRequired' => (string) ($row->time_required ?? ''),
            'dateReceived' => (string) ($row->date_received ?? ''),
            'timeReceived' => (string) ($row->time_received ?? ''),
            'remarks' => (string) ($row->remarks ?? ''),
            'actionTaken' => (string) ($row->action_taken ?? ''),
            'remarksOnActionTaken' => (string) ($row->remarks_on_action_taken ?? ''),
            'dateActedUpon' => (string) ($row->date_acted_upon ?? ''),
            'timeActedUpon' => (string) ($row->time_acted_upon ?? ''),
        ];
    }

    public static function userToCamel(\App\Models\User $row): array
    {
        return [
            'id' => $row->id,
            'employeeCode' => (string) ($row->employee_code ?? ''),
            'lastName' => (string) ($row->last_name ?? ''),
            'firstName' => (string) ($row->first_name ?? ''),
            'middleName' => (string) ($row->middle_name ?? ''),
            'office' => (string) ($row->office ?? ''),
            'userLevel' => (string) ($row->user_level ?? ''),
            'officeRepresentative' => (string) ($row->office_representative ?? ''),
            'source' => 'users',
        ];
    }

    public static function profileToCamel(\App\Models\Profile $row): array
    {
        $full = trim((string) ($row->full_name ?? ''));

        return [
            'id' => $row->id,
            'employeeCode' => (string) ($row->employee_code ?? ''),
            'lastName' => '',
            'firstName' => $full,
            'middleName' => '',
            'office' => (string) ($row->office ?? ''),
            'userLevel' => (string) ($row->user_level ?? ''),
            'officeRepresentative' => (string) ($row->office_representative ?? ''),
            'source' => 'profiles',
        ];
    }
}
