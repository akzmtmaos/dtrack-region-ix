"""
API views for Document Destination - Supabase document_destination table
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client


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
        if payload.get('document_control_no') == '' or payload.get('route_no') == '':
            return Response({
                'success': False,
                'error': 'document_control_no and route_no are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        response = supabase.table('document_destination').insert(payload).execute()
        if response.data and len(response.data) > 0:
            return Response({
                'success': True,
                'data': _row_to_camel(response.data[0] if isinstance(response.data, list) else response.data)
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
    """Update an existing document destination row."""
    try:
        supabase = get_supabase_admin_client()
        payload = _payload_to_snake(request.data)
        # Don't allow changing document_source_id on update
        payload.pop('document_source_id', None)
        response = supabase.table('document_destination').update(payload).eq('id', item_id).execute()
        if response.data and len(response.data) > 0:
            return Response({
                'success': True,
                'data': _row_to_camel(response.data[0] if isinstance(response.data, list) else response.data)
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
        supabase.table('document_destination').delete().eq('id', item_id).execute()
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
        supabase.table('document_destination').delete().in_('id', ids).execute()
        return Response({
            'success': True,
            'message': f'{len(ids)} item(s) deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
