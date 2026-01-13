"""
API views for Action Required reference table
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client


@api_view(['GET'])
@permission_classes([AllowAny])
def action_required_list(request):
    """
    Get all action required items
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Query action_required table
        response = supabase.table('action_required').select('*').order('id', desc=False).execute()
        
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
def action_required_create(request):
    """
    Create a new action required item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        action_required = request.data.get('actionRequired')
        
        if not action_required:
            return Response({
                'success': False,
                'error': 'Action Required field is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Insert into Supabase
        response = supabase.table('action_required').insert({
            'action_required': action_required
        }).execute()
        
        if response.data and len(response.data) > 0:
            return Response({
                'success': True,
                'data': response.data[0] if isinstance(response.data, list) else response.data
            }, status=status.HTTP_201_CREATED)
        else:
            # If data is empty but no error, try to fetch the created item
            # This can happen if RLS policies prevent returning inserted data
            return Response({
                'success': False,
                'error': 'Failed to create action required item - no data returned'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def action_required_update(request, item_id):
    """
    Update an existing action required item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        action_required = request.data.get('actionRequired')
        
        if not action_required:
            return Response({
                'success': False,
                'error': 'Action Required field is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update in Supabase
        response = supabase.table('action_required').update({
            'action_required': action_required
        }).eq('id', item_id).execute()
        
        if response.data and len(response.data) > 0:
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
def action_required_delete(request, item_id):
    """
    Delete an action required item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Delete from Supabase
        response = supabase.table('action_required').delete().eq('id', item_id).execute()
        
        return Response({
            'success': True,
            'message': 'Action required item deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def action_required_bulk_delete(request):
    """
    Delete multiple action required items
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
        response = supabase.table('action_required').delete().in_('id', ids).execute()
        
        return Response({
            'success': True,
            'message': f'{len(ids)} item(s) deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
