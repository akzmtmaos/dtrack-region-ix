"""
API views for Document Source (Outbox) - Supabase document_source table
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
        'documentControlNo': row.get('document_control_no') or '',
        'routeNo': row.get('route_no') or '',
        'subject': row.get('subject') or '',
        'documentType': row.get('document_type') or '',
        'sourceType': row.get('source_type') or '',
        'internalOriginatingOffice': row.get('internal_originating_office') or '',
        'internalOriginatingEmployee': row.get('internal_originating_employee') or '',
        'externalOriginatingOffice': row.get('external_originating_office') or '',
        'externalOriginatingEmployee': row.get('external_originating_employee') or '',
        'noOfPages': row.get('no_of_pages') or '',
        'attachedDocumentFilename': row.get('attached_document_filename') or '',
        'attachmentList': row.get('attachment_list') or '',
        'userid': row.get('userid') or '',
        'inSequence': row.get('in_sequence') or '',
        'remarks': row.get('remarks') or '',
        'referenceDocumentControlNo1': row.get('reference_document_control_no_1') or '',
        'referenceDocumentControlNo2': row.get('reference_document_control_no_2') or '',
        'referenceDocumentControlNo3': row.get('reference_document_control_no_3') or '',
        'referenceDocumentControlNo4': row.get('reference_document_control_no_4') or '',
        'referenceDocumentControlNo5': row.get('reference_document_control_no_5') or '',
    }


def _payload_to_snake(data):
    """Map frontend camelCase payload to snake_case for Supabase."""
    return {
        'subject': data.get('subject', ''),
        'document_type': data.get('documentType', ''),
        'source_type': data.get('sourceType') or None,
        'internal_originating_office': data.get('internalOriginatingOffice', ''),
        'internal_originating_employee': data.get('internalOriginatingEmployee', ''),
        'external_originating_office': data.get('externalOriginatingOffice', ''),
        'external_originating_employee': data.get('externalOriginatingEmployee', ''),
        'no_of_pages': data.get('noOfPages', ''),
        'attached_document_filename': data.get('attachedDocumentFilename', ''),
        'attachment_list': data.get('attachmentList', ''),
        'userid': data.get('userid', ''),
        'in_sequence': data.get('inSequence', ''),
        'remarks': data.get('remarks', ''),
        'reference_document_control_no_1': data.get('referenceDocumentControlNo1', ''),
        'reference_document_control_no_2': data.get('referenceDocumentControlNo2', ''),
        'reference_document_control_no_3': data.get('referenceDocumentControlNo3', ''),
        'reference_document_control_no_4': data.get('referenceDocumentControlNo4', ''),
        'reference_document_control_no_5': data.get('referenceDocumentControlNo5', ''),
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def document_source_list(request):
    """Get all document source (Outbox) items."""
    try:
        supabase = get_supabase_admin_client()
        response = supabase.table('document_source').select('*').order('created_at', desc=True).execute()
        rows = response.data or []
        return Response({
            'success': True,
            'data': [_row_to_camel(r) for r in rows]
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def document_source_create(request):
    """Create a new document source (Outbox) item."""
    try:
        supabase = get_supabase_admin_client()
        payload = _payload_to_snake(request.data)
        if not payload.get('subject') or not payload.get('remarks'):
            return Response({
                'success': False,
                'error': 'Subject and Remarks are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        response = supabase.table('document_source').insert(payload).execute()
        if response.data and len(response.data) > 0:
            return Response({
                'success': True,
                'data': _row_to_camel(response.data[0] if isinstance(response.data, list) else response.data)
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'error': 'Failed to create document - no data returned'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def document_source_update(request, item_id):
    """Update an existing document source item."""
    try:
        supabase = get_supabase_admin_client()
        payload = _payload_to_snake(request.data)
        response = supabase.table('document_source').update(payload).eq('id', item_id).execute()
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
def document_source_delete(request, item_id):
    """Delete a document source item (cascades to document_destination)."""
    try:
        supabase = get_supabase_admin_client()
        supabase.table('document_source').delete().eq('id', item_id).execute()
        return Response({
            'success': True,
            'message': 'Document deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def document_source_bulk_delete(request):
    """Delete multiple document source items."""
    try:
        supabase = get_supabase_admin_client()
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({
                'success': False,
                'error': 'IDs list is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        supabase.table('document_source').delete().in_('id', ids).execute()
        return Response({
            'success': True,
            'message': f'{len(ids)} item(s) deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
