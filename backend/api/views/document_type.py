"""
API views for Document Type reference table
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def document_type_list(request):
    """
    Get all document type items
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Query document_type table
        response = supabase.table('document_type').select('*').order('id', desc=False).execute()
        
        return Response({
            'success': True,
            'data': response.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def document_type_create(request):
    """
    Create a new document type item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        document_type = request.data.get('documentType')
        
        if not document_type:
            return Response({
                'success': False,
                'error': 'Document Type is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Insert into Supabase (ID will be auto-generated as the code)
        response = supabase.table('document_type').insert({
            'document_type': document_type
        }).execute()
        
        if response.data:
            return Response({
                'success': True,
                'data': response.data[0] if isinstance(response.data, list) else response.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': 'Failed to create document type item'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def document_type_update(request, item_id):
    """
    Update an existing document type item.
    Also updates all document_source and document_action_required_days rows that use
    the old name, so the change is reflected in Outbox and other tables.
    """
    try:
        supabase = get_supabase_admin_client()
        new_name = request.data.get('documentType')
        if not new_name or not str(new_name).strip():
            return Response({
                'success': False,
                'error': 'Document Type is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        new_name = str(new_name).strip()

        # Get current row to know the old name before updating
        # Use select('*') so we always have the ID and other fields for the response
        existing = supabase.table('document_type').select('*').eq('id', item_id).execute()
        if not existing.data or len(existing.data) == 0:
            return Response({
                'success': False,
                'error': 'Item not found'
            }, status=status.HTTP_404_NOT_FOUND)
        row = existing.data[0]
        old_name = (row.get('document_type') or '').strip()
        if old_name == new_name:
            return Response({
                'success': True,
                'data': {**row, 'document_type': new_name}
            }, status=status.HTTP_200_OK)

        # Update the reference table
        response = supabase.table('document_type').update({'document_type': new_name}).eq('id', item_id).execute()
        if not response.data:
            return Response({
                'success': False,
                'error': 'Update failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Propagate the new name to document_source (Outbox). Match by stripped value
        # so rows with trailing/leading spaces (e.g. "Abstract of Canvass ") are updated.
        try:
            sel = supabase.table('document_source').select('id, document_type').execute()
            rows = sel.data or []
            for r in rows:
                sid = r.get('id')
                current = (r.get('document_type') or '').strip()
                if sid is not None and current == old_name:
                    supabase.table('document_source').update({'document_type': new_name}).eq('id', sid).execute()
            if rows:
                logger.info("document_type_update: propagated to document_source (matched old_name %r -> %r)", old_name, new_name)
        except Exception as e:
            logger.warning("document_type_update: document_source propagation failed: %s", e)

        # Propagate to document_action_required_days (same strip-based matching)
        try:
            sel = supabase.table('document_action_required_days').select('id, document_type').execute()
            rows = sel.data or []
            for r in rows:
                sid = r.get('id')
                current = (r.get('document_type') or '').strip()
                if sid is not None and current == old_name:
                    supabase.table('document_action_required_days').update({'document_type': new_name}).eq('id', sid).execute()
            if rows:
                logger.info("document_type_update: propagated to document_action_required_days", extra={})
        except Exception as e:
            logger.warning("document_type_update: document_action_required_days propagation failed: %s", e)

        return Response({
            'success': True,
            'data': response.data[0] if isinstance(response.data, list) else response.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def document_type_sync_display_name(request):
    """
    Update all document_source and document_action_required_days rows that have
    document_type = oldName to newName. Called from the frontend when a document
    type is renamed so Outbox and other tables show the new name.
    """
    try:
        old_name = (request.data.get('oldName') or '').strip()
        new_name = (request.data.get('newName') or '').strip()
        if not old_name or not new_name:
            return Response({
                'success': False,
                'error': 'oldName and newName are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        if old_name == new_name:
            return Response({'success': True, 'updatedSources': 0, 'updatedDays': 0}, status=status.HTTP_200_OK)

        supabase = get_supabase_admin_client()
        updated_sources = 0
        updated_days = 0

        # document_source (Outbox)
        # NOTE: Some existing rows may have trailing spaces or inconsistent casing
        # (e.g. "Abstract of Canvass " vs "Abstract of Canvass"). Using a strict
        # equality filter on the column would miss those, so we fetch the ids and
        # match in Python using .strip() before updating by id.
        try:
            sel = supabase.table('document_source').select('id, document_type').execute()
            rows = sel.data or []
            for row in rows:
                sid = row.get('id')
                current = (row.get('document_type') or '').strip()
                if sid is not None and current == old_name:
                    supabase.table('document_source').update({'document_type': new_name}).eq('id', sid).execute()
                    updated_sources += 1
        except Exception as e:
            logger.warning("document_type_sync_display_name: document_source failed: %s", e)

        # document_action_required_days
        try:
            sel = supabase.table('document_action_required_days').select('id, document_type').execute()
            rows = sel.data or []
            for row in rows:
                sid = row.get('id')
                current = (row.get('document_type') or '').strip()
                if sid is not None and current == old_name:
                    supabase.table('document_action_required_days').update({'document_type': new_name}).eq('id', sid).execute()
                    updated_days += 1
        except Exception as e:
            logger.warning("document_type_sync_display_name: document_action_required_days failed: %s", e)

        return Response({
            'success': True,
            'updatedSources': updated_sources,
            'updatedDays': updated_days
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def document_type_delete(request, item_id):
    """
    Delete a document type item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Delete from Supabase
        response = supabase.table('document_type').delete().eq('id', item_id).execute()
        
        return Response({
            'success': True,
            'message': 'Document type item deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def document_type_bulk_delete(request):
    """
    Delete multiple document type items
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Get list of IDs from request
        ids = request.data.get('ids', [])
        
        if not ids or not isinstance(ids, list):
            return Response({
                'success': False,
                'error': 'IDs list is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete multiple items
        response = supabase.table('document_type').delete().in_('id', ids).execute()
        
        return Response({
            'success': True,
            'message': f'{len(ids)} item(s) deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
