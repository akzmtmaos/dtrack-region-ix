"""
API views for Region reference table
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client


@api_view(['GET'])
@permission_classes([AllowAny])
def region_list(request):
    """
    Get all region items
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Query region table
        response = supabase.table('region').select('*').order('id', desc=False).execute()
        
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
def region_create(request):
    """
    Create a new region item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        region_name = request.data.get('regionName')
        nscb_code = request.data.get('nscbCode')
        nscb_name = request.data.get('nscbName')
        added_by = request.data.get('addedBy')
        status_value = request.data.get('status')
        
        if not region_name:
            return Response({
                'success': False,
                'error': 'Region Name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        if not nscb_code:
            return Response({
                'success': False,
                'error': 'NSCB Code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        if not nscb_name:
            return Response({
                'success': False,
                'error': 'NSCB Name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        if not added_by:
            return Response({
                'success': False,
                'error': 'Added By is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        if not status_value:
            return Response({
                'success': False,
                'error': 'Status is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Insert into Supabase
        insert_data = {
            'region_name': region_name,
            'nscb_code': nscb_code,
            'nscb_name': nscb_name,
            'added_by': added_by,
            'status': status_value
        }
        
        response = supabase.table('region').insert(insert_data).execute()
        
        if response.data:
            return Response({
                'success': True,
                'data': response.data[0] if isinstance(response.data, list) else response.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': 'Failed to create region item'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def region_update(request, item_id):
    """
    Update an existing region item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        update_data = {}
        
        if 'regionName' in request.data:
            update_data['region_name'] = request.data.get('regionName')
        if 'nscbCode' in request.data:
            update_data['nscb_code'] = request.data.get('nscbCode')
        if 'nscbName' in request.data:
            update_data['nscb_name'] = request.data.get('nscbName')
        if 'addedBy' in request.data:
            update_data['added_by'] = request.data.get('addedBy')
        if 'status' in request.data:
            update_data['status'] = request.data.get('status')
        
        if not update_data:
            return Response({
                'success': False,
                'error': 'No data provided for update'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update in Supabase
        response = supabase.table('region').update(update_data).eq('id', item_id).execute()
        
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
def region_delete(request, item_id):
    """
    Delete a region item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Delete from Supabase
        response = supabase.table('region').delete().eq('id', item_id).execute()
        
        return Response({
            'success': True,
            'message': 'Region item deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def region_bulk_delete(request):
    """
    Delete multiple region items
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
        response = supabase.table('region').delete().in_('id', ids).execute()
        
        return Response({
            'success': True,
            'message': f'{len(ids)} item(s) deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
