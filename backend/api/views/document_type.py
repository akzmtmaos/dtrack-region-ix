"""
API views for Document Type reference table
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client


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
        document_type_code = request.data.get('documentTypeCode')
        document_type = request.data.get('documentType')
        
        if not document_type_code:
            return Response({
                'success': False,
                'error': 'Document Type Code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not document_type:
            return Response({
                'success': False,
                'error': 'Document Type is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Insert into Supabase
        response = supabase.table('document_type').insert({
            'document_type_code': document_type_code,
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
    Update an existing document type item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        update_data = {}
        
        if 'documentTypeCode' in request.data:
            update_data['document_type_code'] = request.data.get('documentTypeCode')
        if 'documentType' in request.data:
            update_data['document_type'] = request.data.get('documentType')
        
        if not update_data:
            return Response({
                'success': False,
                'error': 'No data provided for update'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update in Supabase
        response = supabase.table('document_type').update(update_data).eq('id', item_id).execute()
        
        if response.data:
            return Response({
                'success': True,
                'data': response.data[0] if isinstance(response.data, list) else response.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': 'Item not found or update failed'
            }, status=status.HTTP_404_NOT_FOUND)
            
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
