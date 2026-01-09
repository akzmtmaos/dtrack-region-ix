"""
API views for Office reference table
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client


@api_view(['GET'])
@permission_classes([AllowAny])
def office_list(request):
    """
    Get all office items
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Query office table
        response = supabase.table('office').select('*').order('id', desc=False).execute()
        
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
def office_create(request):
    """
    Create a new office item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        office = request.data.get('office')
        region = request.data.get('region')
        short_name = request.data.get('shortName')
        head_office = request.data.get('headOffice')
        
        if not office:
            return Response({
                'success': False,
                'error': 'Office is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Insert into Supabase
        response = supabase.table('office').insert({
            'office': office,
            'region': region,
            'short_name': short_name,
            'head_office': head_office
        }).execute()
        
        if response.data:
            return Response({
                'success': True,
                'data': response.data[0] if isinstance(response.data, list) else response.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': 'Failed to create office item'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def office_update(request, item_id):
    """
    Update an existing office item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        update_data = {}
        
        if 'office' in request.data:
            update_data['office'] = request.data.get('office')
        if 'region' in request.data:
            update_data['region'] = request.data.get('region')
        if 'shortName' in request.data:
            update_data['short_name'] = request.data.get('shortName')
        if 'headOffice' in request.data:
            update_data['head_office'] = request.data.get('headOffice')
        
        if not update_data:
            return Response({
                'success': False,
                'error': 'No data provided for update'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update in Supabase
        response = supabase.table('office').update(update_data).eq('id', item_id).execute()
        
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
def office_delete(request, item_id):
    """
    Delete an office item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Delete from Supabase
        response = supabase.table('office').delete().eq('id', item_id).execute()
        
        return Response({
            'success': True,
            'message': 'Office item deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def office_bulk_delete(request):
    """
    Delete multiple office items
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
        response = supabase.table('office').delete().in_('id', ids).execute()
        
        return Response({
            'success': True,
            'message': f'{len(ids)} item(s) deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
