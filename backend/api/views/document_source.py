"""
API views for Document Source (Outbox) - Supabase document_source table
"""
import logging
from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)


def _normalize_created_at(v):
    """Return created_at as ISO string; use now() if missing. Handles datetime or string from Supabase."""
    if v is None:
        return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    if hasattr(v, 'isoformat'):
        return v.isoformat()
    s = str(v).strip()
    if s:
        return s if 'T' in s or 'Z' in s else f"{s}Z"
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')


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
        'createdAt': _normalize_created_at(row.get('created_at')),
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
    }


def _is_connection_error(e):
    """True if error is due to network/DNS (e.g. getaddrinfo failed)."""
    if e is None:
        return False
    s = str(e).lower()
    return "getaddrinfo failed" in s or "connection" in s or "connecterror" in s or "name or service not known" in s


def _connection_error_message(e):
    """User-friendly message when Supabase cannot be reached."""
    if not _is_connection_error(e):
        return None
    return (
        "Cannot reach Supabase. Check backend .env: SUPABASE_URL must be https://YOUR-PROJECT.supabase.co "
        "and your internet connection."
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def document_source_list(request):
    """Get all document source (Outbox) items."""
    try:
        supabase = get_supabase_admin_client()
        response = supabase.table('document_source').select('*').order('created_at', desc=True).execute()
        rows = response.data if response and hasattr(response, 'data') and response.data is not None else []
        if not isinstance(rows, list):
            rows = []
        data = []
        for r in rows:
            try:
                mapped = _row_to_camel(r)
                if mapped is not None:
                    data.append(mapped)
            except Exception:
                logger.warning("Skipping row in document_source_list: %s", r)
        return Response({
            'success': True,
            'data': data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        if _is_connection_error(e):
            logger.warning("document_source_list: Supabase unreachable (check SUPABASE_URL in .env and network): %s", e)
        else:
            logger.exception("document_source_list failed")
        err_msg = _connection_error_message(e) or (str(e).strip() or "Server error")
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def document_source_create(request):
    """Create a new document source (Outbox) item."""
    try:
        supabase = get_supabase_admin_client()
        payload = _payload_to_snake(request.data)
        response = supabase.table('document_source').insert(payload).execute()
        if response.data and len(response.data) > 0:
            return Response({
                'success': True,
                'data': _row_to_camel(response.data[0] if isinstance(response.data, list) else response.data)
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'error': 'Failed to create document source - no data returned'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.exception("document_source_create failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def document_source_update(request, item_id):
    """Update an existing document source (Outbox) item."""
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
        logger.exception("document_source_update failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([AllowAny])
def document_source_delete(request, item_id):
    """Delete a document source (Outbox) item."""
    try:
        supabase = get_supabase_admin_client()
        supabase.table('document_source').delete().eq('id', item_id).execute()
        return Response({
            'success': True,
            'message': 'Document source deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("document_source_delete failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([AllowAny])
def document_source_bulk_delete(request):
    """Delete multiple document source (Outbox) items."""
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
        logger.exception("document_source_bulk_delete failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )
