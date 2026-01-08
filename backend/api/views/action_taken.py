"""
API views for Action Taken reference table
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client


@api_view(['GET'])
@permission_classes([AllowAny])
def action_taken_list(request):
    """
    Get all action taken items
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Query action_taken table
        response = supabase.table('action_taken').select('*').order('id', desc=False).execute()
        
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
def action_taken_create(request):
    """
    Create a new action taken item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        action_taken_code = request.data.get('actionTakenCode')
        action_taken = request.data.get('actionTaken')
        
        if not action_taken_code:
            return Response({
                'success': False,
                'error': 'Action Taken Code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not action_taken:
            return Response({
                'success': False,
                'error': 'Action Taken is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Insert into Supabase
        response = supabase.table('action_taken').insert({
            'action_taken_code': action_taken_code,
            'action_taken': action_taken
        }).execute()
        
        if response.data:
            return Response({
                'success': True,
                'data': response.data[0] if isinstance(response.data, list) else response.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': 'Failed to create action taken item'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def action_taken_update(request, item_id):
    """
    Update an existing action taken item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        update_data = {}
        
        if 'actionTakenCode' in request.data:
            update_data['action_taken_code'] = request.data.get('actionTakenCode')
        if 'actionTaken' in request.data:
            update_data['action_taken'] = request.data.get('actionTaken')
        
        if not update_data:
            return Response({
                'success': False,
                'error': 'No data provided for update'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update in Supabase
        response = supabase.table('action_taken').update(update_data).eq('id', item_id).execute()
        
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
def action_taken_delete(request, item_id):
    """
    Delete an action taken item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Delete from Supabase
        response = supabase.table('action_taken').delete().eq('id', item_id).execute()
        
        return Response({
            'success': True,
            'message': 'Action taken item deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def action_taken_bulk_delete(request):
    """
    Delete multiple action taken items
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
        response = supabase.table('action_taken').delete().in_('id', ids).execute()
        
        return Response({
            'success': True,
            'message': f'{len(ids)} item(s) deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
