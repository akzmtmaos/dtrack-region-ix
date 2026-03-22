"""
Permanently delete document_source rows that have been in Trash longer than N days.
Used by management command and document_source purge API.
"""
import logging
from datetime import datetime, timedelta, timezone

from .supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)


def _chunked(seq, size):
    for i in range(0, len(seq), size):
        yield seq[i : i + size]


def purge_expired_trash(supabase, days: int) -> int:
    """
    Permanently delete soft-deleted documents with deleted_at older than `days` days (UTC).
    Deletes document_destination rows first, then document_source.
    Returns number of document_source rows removed.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    cutoff_iso = cutoff.isoformat().replace('+00:00', 'Z')
    try:
        res = supabase.table('document_source').select('id').lt('deleted_at', cutoff_iso).execute()
    except Exception:
        logger.exception('purge_expired_trash: select failed')
        raise
    rows = res.data if res and getattr(res, 'data', None) else []
    if not isinstance(rows, list):
        rows = []
    ids = []
    for r in rows:
        try:
            ids.append(int(r.get('id')))
        except (TypeError, ValueError):
            continue
    if not ids:
        return 0
    deleted = 0
    for batch in _chunked(ids, 200):
        try:
            supabase.table('document_destination').delete().in_('document_source_id', batch).execute()
        except Exception as dest_err:
            logger.warning('purge_expired_trash: document_destination delete: %s', dest_err)
        try:
            supabase.table('document_source').delete().in_('id', batch).execute()
            deleted += len(batch)
        except Exception:
            logger.exception('purge_expired_trash: document_source delete failed for batch %s', batch)
            raise
    return deleted


def purge_expired_trash_from_env(days: int) -> int:
    """Convenience: use admin Supabase client from env."""
    return purge_expired_trash(get_supabase_admin_client(), days)
