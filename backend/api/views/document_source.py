"""
API views for Document Source (Outbox) - Supabase document_source table
"""
import logging
import uuid
from datetime import datetime, timezone

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client
from ..trash_purge import purge_expired_trash as purge_expired_trash_impl

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
        'currentCustodian': row.get('current_custodian') or '',
        'inSequence': row.get('in_sequence') or '',
        'remarks': row.get('remarks') or '',
        'createdAt': _normalize_created_at(row.get('created_at')),
        'deletedAt': row.get('deleted_at'),
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


def _payload_to_snake_update(data):
    """
    Partial update: only map fields explicitly present in the request body.
    This prevents wiping attachment_list (storage path) when the client omits attachmentList
    — a common bug when using data.get('attachmentList', '') on every PUT.
    Accepts camelCase (frontend) or snake_case keys.
    """
    if not isinstance(data, dict):
        data = {}
    out = {}
    if 'subject' in data:
        out['subject'] = data.get('subject', '')
    if 'documentType' in data:
        out['document_type'] = data.get('documentType', '')
    if 'sourceType' in data:
        out['source_type'] = data.get('sourceType') or None
    if 'internalOriginatingOffice' in data:
        out['internal_originating_office'] = data.get('internalOriginatingOffice', '')
    if 'internalOriginatingEmployee' in data:
        out['internal_originating_employee'] = data.get('internalOriginatingEmployee', '')
    if 'externalOriginatingOffice' in data:
        out['external_originating_office'] = data.get('externalOriginatingOffice', '')
    if 'externalOriginatingEmployee' in data:
        out['external_originating_employee'] = data.get('externalOriginatingEmployee', '')
    if 'noOfPages' in data:
        out['no_of_pages'] = data.get('noOfPages', '')
    if 'attachedDocumentFilename' in data:
        out['attached_document_filename'] = data.get('attachedDocumentFilename') or ''
    if 'attachmentList' in data:
        out['attachment_list'] = data.get('attachmentList') or ''
    if 'userid' in data:
        out['userid'] = data.get('userid', '')
    if 'inSequence' in data:
        out['in_sequence'] = data.get('inSequence', '')
    if 'remarks' in data:
        out['remarks'] = data.get('remarks', '')
    # Raw snake_case (e.g. other API clients)
    snake_only = (
        ('document_type', 'document_type'),
        ('attachment_list', 'attachment_list'),
        ('attached_document_filename', 'attached_document_filename'),
        ('internal_originating_office', 'internal_originating_office'),
        ('internal_originating_employee', 'internal_originating_employee'),
        ('external_originating_office', 'external_originating_office'),
        ('external_originating_employee', 'external_originating_employee'),
        ('no_of_pages', 'no_of_pages'),
        ('source_type', 'source_type'),
        ('in_sequence', 'in_sequence'),
    )
    for sk, fk in snake_only:
        if sk in data and fk not in out:
            v = data.get(sk)
            out[fk] = v if v is not None else ''
    return out


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
    """Get document source (Outbox) items. Excludes soft-deleted rows unless ?trash=1.
    If X-Employee-Code header is set, return only rows where current_custodian matches (routing handoff).
    Run sql/add_document_source_current_custodian.sql so this column exists and is backfilled from userid."""
    try:
        supabase = get_supabase_admin_client()
        query = supabase.table('document_source').select('*').order('created_at', desc=True)
        trash = request.query_params.get('trash')
        want_trash = str(trash).lower() in ('1', 'true', 'yes')
        if want_trash:
            query = query.not_.is_('deleted_at', 'null')
        else:
            query = query.is_('deleted_at', 'null')
        # End-user Outbox = documents they currently hold (after receive on a route step)
        employee_code = request.headers.get('X-Employee-Code') or request.query_params.get('employee_code')
        ec = str(employee_code).strip() if employee_code and str(employee_code).strip() else ''
        if ec:
            query = query.eq('current_custodian', ec)
        try:
            response = query.execute()
        except Exception as e:
            # DB without current_custodian column: fall back to creator (userid)
            if ec and _is_missing_column_error(e):
                logger.warning(
                    'document_source_list: current_custodian missing; filtering Outbox by userid. Run sql/add_document_source_current_custodian.sql'
                )
                query_fb = supabase.table('document_source').select('*').order('created_at', desc=True)
                if want_trash:
                    query_fb = query_fb.not_.is_('deleted_at', 'null')
                else:
                    query_fb = query_fb.is_('deleted_at', 'null')
                response = query_fb.eq('userid', ec).execute()
            else:
                raise
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
        # Custody starts with creator; routing updates this when a destination is received.
        uid = str(payload.get('userid') or '').strip()
        payload['current_custodian'] = uid
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
        ec = _employee_scope_header(request)
        if ec and not _can_access_document_row(supabase, item_id, ec):
            return Response({'success': False, 'error': 'Not found or access denied'}, status=status.HTTP_403_FORBIDDEN)
        payload = _payload_to_snake_update(request.data)
        # Server-managed (routing handoff); do not allow client to set custodian directly.
        payload.pop('current_custodian', None)
        if not payload:
            return Response({
                'success': False,
                'error': 'No fields to update. Send at least one field (e.g. subject, attachmentList).',
            }, status=status.HTTP_400_BAD_REQUEST)
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
    """Soft-delete a document source (Outbox) item (moves to Trash)."""
    try:
        supabase = get_supabase_admin_client()
        ec = _employee_scope_header(request)
        if not _can_access_document_row(supabase, item_id, ec):
            return Response({'success': False, 'error': 'Not found or access denied'}, status=status.HTTP_403_FORBIDDEN)
        now_iso = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        supabase.table('document_source').update({'deleted_at': now_iso}).eq('id', item_id).is_('deleted_at', 'null').execute()
        return Response({
            'success': True,
            'message': 'Document moved to Trash'
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
    """Soft-delete multiple document source (Outbox) items."""
    try:
        supabase = get_supabase_admin_client()
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({
                'success': False,
                'error': 'IDs list is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        now_iso = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        clean_ids = []
        for item_id in ids:
            try:
                clean_ids.append(int(item_id))
            except (TypeError, ValueError):
                continue
        if not clean_ids:
            return Response({'success': False, 'error': 'No valid IDs'}, status=status.HTTP_400_BAD_REQUEST)
        ec = _employee_scope_header(request)
        allowed = [iid for iid in clean_ids if _can_access_document_row(supabase, iid, ec)]
        if not allowed:
            return Response({'success': False, 'error': 'Not found or access denied'}, status=status.HTTP_403_FORBIDDEN)
        supabase.table('document_source').update({'deleted_at': now_iso}).in_('id', allowed).is_('deleted_at', 'null').execute()
        return Response({
            'success': True,
            'message': f'{len(allowed)} item(s) moved to Trash'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("document_source_bulk_delete failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _employee_scope_header(request):
    """Header, WSGI META fallback (some proxies), or ?employee_code= query (backup for downloads)."""
    h = request.headers.get('X-Employee-Code')
    if not h:
        h = request.META.get('HTTP_X_EMPLOYEE_CODE')
    q = request.query_params.get('employee_code')
    raw = str(h or q or '').strip()
    return raw if raw else None


def _is_missing_column_error(exc):
    """True if PostgREST/Supabase error is undefined column (e.g. current_custodian not migrated)."""
    s = str(exc).lower()
    if '42703' in str(exc):
        return True
    if 'does not exist' in s and 'column' in s:
        return True
    code = getattr(exc, 'code', None)
    if code == '42703':
        return True
    return False


def _fetch_document_source_access_row(supabase, item_id):
    """
    userid + current_custodian when the column exists; otherwise userid only.
    Avoids 500 when sql/add_document_source_current_custodian.sql was not applied yet.
    """
    try:
        res = supabase.table('document_source').select('userid,current_custodian').eq('id', item_id).execute()
    except Exception as e:
        if _is_missing_column_error(e):
            logger.warning(
                'document_source: current_custodian column missing; using userid-only access. Run sql/add_document_source_current_custodian.sql'
            )
            res = supabase.table('document_source').select('userid').eq('id', item_id).execute()
        else:
            raise
    if not res.data:
        return None
    return res.data[0] or {}


def _employee_identity_matches(supabase, employee_code, stored_value):
    """
    True if stored DB text refers to the same person as employee_code.
    Handles: exact code match, 'Name (CODE)' labels, and display names from users/profiles
    (same idea as originating-employee / Inbox).
    """
    if not employee_code or not str(employee_code).strip():
        return True
    if stored_value is None or not str(stored_value).strip():
        return False
    ec = str(employee_code).strip().lower()
    sv = str(stored_value).strip().lower()
    if sv == ec:
        return True
    if ec and f'({ec})' in sv:
        return True
    try:
        from .document_destination import _build_employee_match_candidates

        candidates = _build_employee_match_candidates(supabase, employee_code)
        if sv in candidates:
            return True
    except Exception:
        logger.exception('_employee_identity_matches: candidate lookup failed')
    return False


def recompute_current_custodian(supabase, document_source_id):
    """
    After routing changes: whoever has the latest *received* destination step holds the document.
    If no destination row has date_received set, custodian stays the original creator (userid).
    """
    try:
        sid = int(document_source_id)
    except (TypeError, ValueError):
        return
    try:
        src_res = supabase.table('document_source').select('id,userid').eq('id', sid).execute()
        if not src_res.data:
            return
        creator = str((src_res.data[0] or {}).get('userid') or '').strip()
        dest_res = (
            supabase.table('document_destination')
            .select('sequence_no,date_received,employee_action_officer')
            .eq('document_source_id', sid)
            .order('sequence_no', desc=False)
            .execute()
        )
        rows = dest_res.data or []

        def row_is_received(row):
            dr = row.get('date_received')
            if dr is None:
                return False
            return bool(str(dr).strip())

        custodian = creator
        best_seq = -1
        for r in rows:
            if not row_is_received(r):
                continue
            seq = r.get('sequence_no')
            try:
                seq = int(seq) if seq is not None else 0
            except (TypeError, ValueError):
                seq = 0
            if seq >= best_seq:
                best_seq = seq
                off = str(r.get('employee_action_officer') or '').strip()
                if off:
                    custodian = off
        try:
            supabase.table('document_source').update({'current_custodian': custodian}).eq('id', sid).execute()
        except Exception as upd_err:
            if _is_missing_column_error(upd_err):
                logger.warning('recompute_current_custodian: skip update, current_custodian column missing')
            else:
                raise
    except Exception:
        logger.exception('recompute_current_custodian failed for document_source_id=%s', document_source_id)


def _can_access_document_row(supabase, item_id, employee_code):
    """If employee_code is set, require current holder (custodian or userid) to match — fuzzy vs display names."""
    if not employee_code or not str(employee_code).strip():
        return True
    row = _fetch_document_source_access_row(supabase, item_id)
    if not row:
        return False
    cust = str(row.get('current_custodian') or '').strip()
    uid = str(row.get('userid') or '').strip()
    holder = cust if cust else uid
    if not holder:
        return False
    return _employee_identity_matches(supabase, employee_code, holder)


def _can_download_attachment(supabase, item_id, employee_code):
    """
    Who may GET a signed attachment URL: current holder, original creator, any route action officer
    (code OR display name), or originating employee (Inbox rules).
    """
    if not employee_code or not str(employee_code).strip():
        return True
    row = _fetch_document_source_access_row(supabase, item_id)
    if not row:
        return False
    uid = str(row.get('userid') or '').strip()
    cust = str(row.get('current_custodian') or '').strip()
    holder = cust if cust else uid

    if holder and _employee_identity_matches(supabase, employee_code, holder):
        return True
    if uid and _employee_identity_matches(supabase, employee_code, uid):
        return True
    try:
        dr = (
            supabase.table('document_destination')
            .select('employee_action_officer')
            .eq('document_source_id', int(item_id))
            .execute()
        )
        for r in dr.data or []:
            if _employee_identity_matches(supabase, employee_code, r.get('employee_action_officer')):
                return True
    except Exception:
        logger.exception('_can_download_attachment: destination check failed for id=%s', item_id)
    try:
        from .document_destination import _build_employee_match_candidates, _originating_field_matches

        ores = (
            supabase.table('document_source')
            .select('internal_originating_employee,external_originating_employee')
            .eq('id', int(item_id))
            .execute()
        )
        if ores.data:
            frow = ores.data[0] or {}
            candidates = _build_employee_match_candidates(supabase, employee_code)
            if _originating_field_matches(frow.get('internal_originating_employee'), candidates, employee_code):
                return True
            if _originating_field_matches(frow.get('external_originating_employee'), candidates, employee_code):
                return True
    except Exception:
        logger.exception('_can_download_attachment: originating check failed for id=%s', item_id)
    return False


def _row_is_in_trash(supabase, item_id):
    """True if document exists and deleted_at is set."""
    res = supabase.table('document_source').select('deleted_at').eq('id', item_id).execute()
    if not res.data:
        return False
    return (res.data[0] or {}).get('deleted_at') is not None


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def document_source_purge_expired_trash(request):
    """
    Permanently remove Trash items older than TRASH_RETENTION_DAYS (default 30).
    Secured with header: X-Trash-Purge-Secret: <same value as TRASH_PURGE_SECRET in .env>
    """
    secret = getattr(settings, 'TRASH_PURGE_SECRET', '') or ''
    if not secret:
        return Response(
            {
                'success': False,
                'error': 'TRASH_PURGE_SECRET is not set. Add it to .env to enable this endpoint, or run: python manage.py purge_trash',
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    got = request.headers.get('X-Trash-Purge-Secret')
    if got != secret:
        return Response({'success': False, 'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    days = getattr(settings, 'TRASH_RETENTION_DAYS', 30)
    try:
        override = request.data.get('days') if isinstance(request.data, dict) else None
        if override is not None:
            days = int(override)
    except (TypeError, ValueError):
        pass
    if days < 1:
        days = 30
    try:
        supabase = get_supabase_admin_client()
        n = purge_expired_trash_impl(supabase, days)
        return Response(
            {'success': True, 'purged': n, 'retentionDays': days, 'message': f'{n} expired Trash item(s) purged'},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        logger.exception('document_source_purge_expired_trash failed')
        err_msg = _connection_error_message(e) or str(e) or 'Server error'
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def document_source_restore(request, item_id):
    """Restore a soft-deleted document (clear deleted_at)."""
    try:
        supabase = get_supabase_admin_client()
        ec = _employee_scope_header(request)
        if not _can_access_document_row(supabase, item_id, ec):
            return Response({'success': False, 'error': 'Not found or access denied'}, status=status.HTTP_403_FORBIDDEN)
        supabase.table('document_source').update({'deleted_at': None}).eq('id', item_id).not_.is_('deleted_at', 'null').execute()
        row = supabase.table('document_source').select('*').eq('id', item_id).execute()
        data = _row_to_camel(row.data[0]) if row.data else None
        return Response({'success': True, 'data': data, 'message': 'Document restored'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("document_source_restore failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def document_source_bulk_restore(request):
    """Restore multiple soft-deleted documents."""
    try:
        supabase = get_supabase_admin_client()
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({'success': False, 'error': 'IDs list is required'}, status=status.HTTP_400_BAD_REQUEST)
        ec = _employee_scope_header(request)
        clean_ids = []
        for item_id in ids:
            try:
                clean_ids.append(int(item_id))
            except (TypeError, ValueError):
                continue
        if not clean_ids:
            return Response({'success': False, 'error': 'No valid IDs'}, status=status.HTTP_400_BAD_REQUEST)
        restored = []
        for iid in clean_ids:
            if not _can_access_document_row(supabase, iid, ec):
                continue
            supabase.table('document_source').update({'deleted_at': None}).eq('id', iid).not_.is_('deleted_at', 'null').execute()
            restored.append(iid)
        return Response({'success': True, 'message': f'{len(restored)} item(s) restored', 'restoredIds': restored}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("document_source_bulk_restore failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([AllowAny])
def document_source_permanent_delete(request, item_id):
    """Permanently remove a document (and rely on DB FK for destinations, or delete destinations first)."""
    try:
        supabase = get_supabase_admin_client()
        ec = _employee_scope_header(request)
        if not _can_access_document_row(supabase, item_id, ec):
            return Response({'success': False, 'error': 'Not found or access denied'}, status=status.HTTP_403_FORBIDDEN)
        if not _row_is_in_trash(supabase, item_id):
            return Response(
                {'success': False, 'error': 'Only documents in Trash can be permanently deleted. Delete from Outbox first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Remove destination rows first if FK blocks document delete
        try:
            supabase.table('document_destination').delete().eq('document_source_id', item_id).execute()
        except Exception as dest_err:
            logger.warning("document_destination cleanup before permanent delete: %s", dest_err)
        supabase.table('document_source').delete().eq('id', item_id).execute()
        return Response({'success': True, 'message': 'Document permanently deleted'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("document_source_permanent_delete failed")
        err_msg = _connection_error_message(e) or str(e) or "Server error"
        return Response(
            {'success': False, 'error': err_msg},
            status=status.HTTP_503_SERVICE_UNAVAILABLE if _is_connection_error(e) else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def document_source_bulk_permanent_delete(request):
    """Permanently delete multiple soft-deleted documents."""
    try:
        supabase = get_supabase_admin_client()
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({'success': False, 'error': 'IDs list is required'}, status=status.HTTP_400_BAD_REQUEST)
        ec = _employee_scope_header(request)
        clean_ids = []
        for item_id in ids:
            try:
                clean_ids.append(int(item_id))
            except (TypeError, ValueError):
                continue
        if not clean_ids:
            return Response({'success': False, 'error': 'No valid IDs'}, status=status.HTTP_400_BAD_REQUEST)
        deleted_count = 0
        for iid in clean_ids:
            if not _can_access_document_row(supabase, iid, ec):
                continue
            if not _row_is_in_trash(supabase, iid):
                continue
            try:
                supabase.table('document_destination').delete().eq('document_source_id', iid).execute()
            except Exception as dest_err:
                logger.warning("document_destination bulk cleanup: %s", dest_err)
            supabase.table('document_source').delete().eq('id', iid).execute()
            deleted_count += 1
        return Response({
            'success': True,
            'message': f'{deleted_count} item(s) permanently deleted',
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("document_source_bulk_permanent_delete failed")
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
        ec = _employee_scope_header(request)
        if ec and not _can_access_document_row(supabase, document_id, ec):
            return Response({'success': False, 'error': 'Not found or access denied'}, status=status.HTTP_403_FORBIDDEN)
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
        ec = _employee_scope_header(request)
        if ec and not _can_download_attachment(supabase, item_id, ec):
            return Response({'success': False, 'error': 'Not found or access denied'}, status=status.HTTP_403_FORBIDDEN)
        row = supabase.table('document_source').select('attachment_list, attached_document_filename').eq('id', item_id).execute()
        if not row.data or len(row.data) == 0:
            return Response({'success': False, 'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        row0 = row.data[0] or {}
        path = row0.get('attachment_list') or ''
        display_name = (row0.get('attached_document_filename') or '').strip()
        if not path or not path.strip():
            if display_name:
                return Response({
                    'success': False,
                    'error': (
                        'No file path in storage for this attachment. A filename is recorded, but the storage path '
                        'is missing (often after a save that did not include the attachment path). '
                        'Edit the document and attach the file again, or check that the upload completed.'
                    ),
                }, status=status.HTTP_404_NOT_FOUND)
            return Response({
                'success': False,
                'error': 'No attachment for this document. If you added a file, the upload may have failed (e.g. storage bucket not set up).',
            }, status=status.HTTP_404_NOT_FOUND)
        path = path.strip()
        result = supabase.storage.from_(ATTACHMENT_BUCKET).create_signed_url(path, SIGNED_URL_EXPIRES)
        url = None
        if isinstance(result, dict):
            url = (
                result.get('signedURL')
                or result.get('signedUrl')
                or result.get('signed_url')
                or result.get('path')
            )
        if not url and result is not None:
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
