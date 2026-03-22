"""
API views for Document Destination - Supabase document_destination table
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client
from .document_source import _row_to_camel as _source_row_to_camel, recompute_current_custodian


def _row_to_camel(row):
    """Map Supabase snake_case row to camelCase for frontend."""
    if not row:
        return None
    return {
        'id': row.get('id'),
        'documentSourceId': row.get('document_source_id'),
        'documentControlNo': row.get('document_control_no') or '',
        'routeNo': row.get('route_no') or '',
        'sequenceNo': row.get('sequence_no') or 0,
        'destinationOffice': row.get('destination_office') or '',
        'employeeActionOfficer': row.get('employee_action_officer') or '',
        'actionRequired': row.get('action_required') or '',
        'dateReleased': row.get('date_released') or '',
        'timeReleased': str(row.get('time_released') or '') if row.get('time_released') is not None else '',
        'dateRequired': row.get('date_required') or '',
        'timeRequired': str(row.get('time_required') or '') if row.get('time_required') is not None else '',
        'dateReceived': row.get('date_received') or '',
        'timeReceived': str(row.get('time_received') or '') if row.get('time_received') is not None else '',
        'remarks': row.get('remarks') or '',
        'actionTaken': row.get('action_taken') or '',
        'remarksOnActionTaken': row.get('remarks_on_action_taken') or '',
        'dateActedUpon': row.get('date_acted_upon') or '',
        'timeActedUpon': str(row.get('time_acted_upon') or '') if row.get('time_acted_upon') is not None else '',
    }


def _payload_to_snake(data):
    """Map frontend camelCase payload to snake_case for Supabase."""
    return {
        'document_source_id': data.get('documentSourceId'),
        'document_control_no': data.get('documentControlNo', ''),
        'route_no': data.get('routeNo', ''),
        'sequence_no': data.get('sequenceNo', 0),
        'destination_office': data.get('destinationOffice', ''),
        'employee_action_officer': data.get('employeeActionOfficer', ''),
        'action_required': data.get('actionRequired', ''),
        'date_released': data.get('dateReleased') or None,
        'time_released': data.get('timeReleased') or None,
        'date_required': data.get('dateRequired') or None,
        'time_required': data.get('timeRequired') or None,
        'date_received': data.get('dateReceived') or None,
        'time_received': data.get('timeReceived') or None,
        'remarks': data.get('remarks', ''),
        'action_taken': data.get('actionTaken', ''),
        'remarks_on_action_taken': data.get('remarksOnActionTaken', ''),
        'date_acted_upon': data.get('dateActedUpon') or None,
        'time_acted_upon': data.get('timeActedUpon') or None,
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def document_destination_list(request):
    """Get document destinations, optionally filtered by document_source_id."""
    try:
        supabase = get_supabase_admin_client()
        document_source_id = request.query_params.get('document_source_id')
        query = supabase.table('document_destination').select('*').order('sequence_no', desc=False)
        if document_source_id is not None and document_source_id != '':
            try:
                sid = int(document_source_id)
                query = query.eq('document_source_id', sid)
            except ValueError:
                pass
        response = query.execute()
        rows = response.data or []
        return Response({
            'success': True,
            'data': [_row_to_camel(r) for r in rows]
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def document_destination_create(request):
    """Create a new document destination row."""
    try:
        supabase = get_supabase_admin_client()
        payload = _payload_to_snake(request.data)
        if payload.get('document_source_id') is None:
            return Response({
                'success': False,
                'error': 'document_source_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        if payload.get('document_control_no') == '':
            return Response({
                'success': False,
                'error': 'document_control_no is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        # route_no empty or missing: DB trigger generates R{year}-000000001, R{year}-000000002, ...
        if not payload.get('route_no'):
            payload['route_no'] = ''
        response = supabase.table('document_destination').insert(payload).execute()
        if response.data and len(response.data) > 0:
            row0 = response.data[0] if isinstance(response.data, list) else response.data
            sid = row0.get('document_source_id')
            if sid is not None:
                recompute_current_custodian(supabase, sid)
            return Response({
                'success': True,
                'data': _row_to_camel(row0)
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'error': 'Failed to create destination - no data returned'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def document_destination_update(request, item_id):
    """Update an existing document destination row. Merges with existing data so partial PATCH (e.g. date received) does not clear other fields."""
    try:
        supabase = get_supabase_admin_client()
        existing = supabase.table('document_destination').select('*').eq('id', item_id).execute()
        if not existing.data:
            return Response({
                'success': False,
                'error': 'Item not found or update failed'
            }, status=status.HTTP_404_NOT_FOUND)
        base = _row_to_camel(existing.data[0] if isinstance(existing.data, list) else existing.data)
        incoming = request.data if isinstance(request.data, dict) else dict(request.data)
        merged = {**base, **incoming}
        merged.pop('id', None)
        payload = _payload_to_snake(merged)
        # Don't allow changing document_source_id on update
        payload.pop('document_source_id', None)
        response = supabase.table('document_destination').update(payload).eq('id', item_id).execute()
        if response.data and len(response.data) > 0:
            row0 = response.data[0] if isinstance(response.data, list) else response.data
            sid = row0.get('document_source_id')
            if sid is not None:
                recompute_current_custodian(supabase, sid)
            return Response({
                'success': True,
                'data': _row_to_camel(row0)
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'error': 'Item not found or update failed'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def document_destination_delete(request, item_id):
    """Delete a document destination row."""
    try:
        supabase = get_supabase_admin_client()
        prev = supabase.table('document_destination').select('document_source_id').eq('id', item_id).execute()
        sid = None
        if prev.data and len(prev.data) > 0:
            sid = prev.data[0].get('document_source_id')
        supabase.table('document_destination').delete().eq('id', item_id).execute()
        if sid is not None:
            recompute_current_custodian(supabase, sid)
        return Response({
            'success': True,
            'message': 'Destination deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def document_destination_bulk_delete(request):
    """Delete multiple document destination rows."""
    try:
        supabase = get_supabase_admin_client()
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({
                'success': False,
                'error': 'IDs list is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        prev = supabase.table('document_destination').select('document_source_id').in_('id', ids).execute()
        affected = set()
        if prev.data:
            for r in prev.data:
                sid = r.get('document_source_id')
                if sid is not None:
                    affected.add(sid)
        supabase.table('document_destination').delete().in_('id', ids).execute()
        for sid in affected:
            recompute_current_custodian(supabase, sid)
        return Response({
            'success': True,
            'message': f'{len(ids)} item(s) deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _format_display_name_like_frontend(last_name, first_name, middle_name):
    """Match frontend AddDocumentModal formatUserDisplayName (Last, First Middle)."""
    mn = (middle_name or '').strip()
    mid = f' {mn}' if mn and mn != '-' else ''
    fn = (first_name or '').strip()
    ln = (last_name or '').strip()
    name = f'{ln}, {fn}{mid}'.strip()
    if name.replace(',', '').replace(' ', ''):
        return name
    return ''


def _originating_field_matches(field_val, candidates, employee_code):
    """field_val is internal/external originating employee text; candidates are lowercased strings."""
    raw = (field_val or '').strip()
    if not raw:
        return False
    low = raw.lower()
    if low in candidates:
        return True
    ec = str(employee_code or '').strip()
    if ec and f'({ec.lower()})' in low:
        return True
    return False


def _build_employee_match_candidates(supabase, employee_code):
    """
    Values that identify this user for inbox: employee code, formatted name (users table),
    and profile full_name (profiles table) — aligned with Outbox originating-employee dropdown.
    """
    ec = str(employee_code or '').strip()
    candidates = set()
    if not ec:
        return candidates
    candidates.add(ec.lower())

    try:
        ures = supabase.table('users').select('employee_code,first_name,last_name,middle_name').eq('employee_code', ec).limit(1).execute()
        if ures.data:
            row = ures.data[0]
            disp = _format_display_name_like_frontend(
                row.get('last_name'),
                row.get('first_name'),
                row.get('middle_name'),
            )
            if disp:
                candidates.add(disp.lower())
    except Exception:
        pass

    try:
        pres = supabase.table('profiles').select('employee_code,full_name').eq('employee_code', ec).limit(1).execute()
        if pres.data:
            row = pres.data[0]
            fn = (row.get('full_name') or '').strip()
            if fn:
                candidates.add(fn.lower())
    except Exception:
        pass

    return candidates


@api_view(['GET'])
@permission_classes([AllowAny])
def inbox_documents_list(request):
    """
    Inbox for the logged-in employee (X-Employee-Code):
    - Destination rows where employee_action_officer matches the employee code (case-insensitive), with parent document.
    - Documents where internal/external originating employee matches this user's display name or employee code
      (so 'originating employee' selections appear here even when the document was created by another user's Outbox).
    """
    try:
        ec = request.headers.get('X-Employee-Code') or request.query_params.get('employee_code')
        ec = str(ec or '').strip()
        if not ec:
            return Response(
                {'success': False, 'error': 'X-Employee-Code header (or employee_code query param) is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        supabase = get_supabase_admin_client()
        candidates = _build_employee_match_candidates(supabase, ec)

        from .document_source import _employee_identity_matches

        dest_res = supabase.table('document_destination').select('*').order('sequence_no', desc=False).execute()
        all_dests = dest_res.data or []

        matched_dests = []
        for d in all_dests:
            if _employee_identity_matches(supabase, ec, d.get('employee_action_officer')):
                matched_dests.append(d)

        dest_source_ids = {d['document_source_id'] for d in matched_dests if d.get('document_source_id')}

        src_res = supabase.table('document_source').select('*').is_('deleted_at', 'null').execute()
        all_sources = src_res.data or []
        sources_by_id = {r['id']: r for r in all_sources if r.get('id') is not None}

        result = []

        for d in matched_dests:
            sid = d.get('document_source_id')
            src = sources_by_id.get(sid)
            if not src:
                continue
            result.append({
                'id': d.get('id'),
                'inboxType': 'destination',
                'destination': _row_to_camel(d),
                'document': _source_row_to_camel(src),
            })

        for src in all_sources:
            sid = src.get('id')
            if sid in dest_source_ids:
                continue
            internal = src.get('internal_originating_employee') or ''
            external = src.get('external_originating_employee') or ''
            if not _originating_field_matches(internal, candidates, ec) and not _originating_field_matches(external, candidates, ec):
                continue
            result.append({
                'id': f'orig-{sid}',
                'inboxType': 'originating',
                'destination': None,
                'document': _source_row_to_camel(src),
            })

        # Newest documents first (matches Outbox ordering feel)
        result.sort(
            key=lambda x: (x.get('document') or {}).get('createdAt') or '',
            reverse=True,
        )

        return Response({'success': True, 'data': result}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
