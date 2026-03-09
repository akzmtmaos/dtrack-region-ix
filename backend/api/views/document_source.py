"""
API views for Document Source (Outbox) - Supabase document_source table
"""
import logging
import uuid
from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)

# Storage bucket for Outbox document attachments. Created automatically if missing.
ATTACHMENT_BUCKET = 'document-attachments'
SIGNED_URL_EXPIRES = 3600  # 1 hour


def _ensure_attachment_bucket(supabase):
    """Create the attachment bucket if it does not exist. Idempotent."""
    try:
        supabase.storage.create_bucket(ATTACHMENT_BUCKET, options={"public": False})
        logger.info("Created storage bucket %s", ATTACHMENT_BUCKET)
    except Exception as e:
        msg = str(e).lower()
        # Bucket already exists or similar - ignore
        if "already exists" in msg or "duplicate" in msg or "conflict" in msg:
            return
        logger.warning("Could not create bucket %s: %s", ATTACHMENT_BUCKET, e)
        raise


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
    """Get all document source (Outbox) items. If X-Employee-Code header is set, return only rows where userid matches (for End-User scope)."""
    try:
        supabase = get_supabase_admin_client()
        query = supabase.table('document_source').select('*').order('created_at', desc=True)
        # Filter by current user when header is present (End-User sees only their own documents)
        employee_code = request.headers.get('X-Employee-Code') or request.query_params.get('employee_code')
        if employee_code and str(employee_code).strip():
            query = query.eq('userid', str(employee_code).strip())
        response = query.execute()
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


def _upload_to_storage(supabase, storage_path, file_bytes, content_type):
    """Upload bytes to the attachment bucket. Raises on failure."""
    supabase.storage.from_(ATTACHMENT_BUCKET).upload(
        storage_path, file_bytes, {"content-type": content_type or "application/octet-stream"}
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def document_source_upload_attachment(request):
    """Upload a file for a document source. Expects multipart: file, documentId. Returns path and filename for storing on document."""
    try:
        file_obj = request.FILES.get('file')
        document_id = request.POST.get('documentId') or request.data.get('documentId')
        if not file_obj:
            return Response({'success': False, 'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        if not document_id:
            return Response({'success': False, 'error': 'documentId is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            document_id = int(document_id)
        except (TypeError, ValueError):
            return Response({'success': False, 'error': 'Invalid documentId'}, status=status.HTTP_400_BAD_REQUEST)
        filename = (file_obj.name or 'attachment').strip() or 'attachment'
        safe_name = "".join(c for c in filename if c.isalnum() or c in '._- ').strip() or 'attachment'
        storage_path = f"{document_id}/{uuid.uuid4().hex}_{safe_name}"
        supabase = get_supabase_admin_client()
        file_bytes = file_obj.read()
        content_type = getattr(file_obj, 'content_type', None) or "application/octet-stream"

        # Ensure bucket exists (create if missing), then upload
        try:
            _ensure_attachment_bucket(supabase)
        except AttributeError:
            pass  # create_bucket not available on this client
        try:
            _upload_to_storage(supabase, storage_path, file_bytes, content_type)
        except Exception as upload_err:
            err_str = str(upload_err).lower()
            if "bucket not found" in err_str:
                try:
                    _ensure_attachment_bucket(supabase)
                    _upload_to_storage(supabase, storage_path, file_bytes, content_type)
                except AttributeError:
                    return Response({
                        'success': False,
                        'error': (
                            "Storage bucket 'document-attachments' not found. "
                            "Create it in Supabase Dashboard → Storage → New bucket, name: document-attachments (private)."
                        ),
                    }, status=status.HTTP_400_BAD_REQUEST)
                except Exception as retry_err:
                    logger.exception("document_source_upload_attachment retry after bucket create failed")
                    retry_str = str(retry_err).lower()
                    if "bucket not found" in retry_str:
                        return Response({
                            'success': False,
                            'error': (
                                "Storage bucket 'document-attachments' not found. "
                                "Create it in Supabase Dashboard → Storage → New bucket, name: document-attachments (private)."
                            ),
                        }, status=status.HTTP_400_BAD_REQUEST)
                    return Response(
                        {'success': False, 'error': str(retry_err)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            else:
                raise

        return Response({
            'success': True,
            'path': storage_path,
            'filename': filename,
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.exception("document_source_upload_attachment failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def document_source_attachment_url(request, item_id):
    """Return a signed URL for the document's attachment so the frontend can download or open it."""
    try:
        supabase = get_supabase_admin_client()
        row = supabase.table('document_source').select('attachment_list').eq('id', item_id).execute()
        if not row.data or len(row.data) == 0:
            return Response({'success': False, 'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        path = (row.data[0] or {}).get('attachment_list') or ''
        if not path or not path.strip():
            return Response({
                'success': False,
                'error': 'No attachment for this document. If you added a file, the upload may have failed (e.g. storage bucket not set up).',
            }, status=status.HTTP_404_NOT_FOUND)
        path = path.strip()
        result = supabase.storage.from_(ATTACHMENT_BUCKET).create_signed_url(path, SIGNED_URL_EXPIRES)
        url = (result.get('signedURL') or result.get('signed_url') or result.get('path')) if isinstance(result, dict) else None
        if not url:
            url = str(result) if result else None
        if not url:
            return Response({'success': False, 'error': 'Could not generate download URL'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'success': True, 'url': url}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("document_source_attachment_url failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )
