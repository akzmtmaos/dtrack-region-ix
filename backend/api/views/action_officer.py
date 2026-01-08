"""
API views for Action Officer reference table
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..supabase_client import get_supabase_admin_client


@api_view(['GET'])
@permission_classes([AllowAny])
def action_officer_list(request):
    """
    Get all action officer items
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Query action_officer table
        response = supabase.table('action_officer').select('*').order('id', desc=False).execute()
        
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
def action_officer_create(request):
    """
    Create a new action officer item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        employee_code = request.data.get('employeeCode')
        last_name = request.data.get('lastName')
        first_name = request.data.get('firstName')
        middle_name = request.data.get('middleName')
        office = request.data.get('office', '')
        user_password = request.data.get('userPassword')
        user_level = request.data.get('userLevel')
        office_representative = request.data.get('officeRepresentative', '')
        
        # Validate required fields
        if not employee_code:
            return Response({
                'success': False,
                'error': 'Employee Code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not last_name:
            return Response({
                'success': False,
                'error': 'Last Name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not first_name:
            return Response({
                'success': False,
                'error': 'First Name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not middle_name:
            return Response({
                'success': False,
                'error': 'Middle Name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not user_password:
            return Response({
                'success': False,
                'error': 'User Password is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not user_level:
            return Response({
                'success': False,
                'error': 'User Level is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Insert into Supabase
        response = supabase.table('action_officer').insert({
            'employee_code': employee_code,
            'last_name': last_name,
            'first_name': first_name,
            'middle_name': middle_name,
            'office': office if office else None,
            'user_password': user_password,
            'user_level': user_level,
            'office_representative': office_representative if office_representative else None
        }).execute()
        
        if response.data:
            return Response({
                'success': True,
                'data': response.data[0] if isinstance(response.data, list) else response.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'error': 'Failed to create action officer item'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def action_officer_update(request, item_id):
    """
    Update an existing action officer item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Extract data from request
        update_data = {}
        
        if 'employeeCode' in request.data:
            update_data['employee_code'] = request.data.get('employeeCode')
        if 'lastName' in request.data:
            update_data['last_name'] = request.data.get('lastName')
        if 'firstName' in request.data:
            update_data['first_name'] = request.data.get('firstName')
        if 'middleName' in request.data:
            update_data['middle_name'] = request.data.get('middleName')
        if 'office' in request.data:
            office = request.data.get('office')
            update_data['office'] = office if office else None
        if 'userPassword' in request.data:
            update_data['user_password'] = request.data.get('userPassword')
        if 'userLevel' in request.data:
            update_data['user_level'] = request.data.get('userLevel')
        if 'officeRepresentative' in request.data:
            office_rep = request.data.get('officeRepresentative')
            update_data['office_representative'] = office_rep if office_rep else None
        
        if not update_data:
            return Response({
                'success': False,
                'error': 'No data provided for update'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update in Supabase
        response = supabase.table('action_officer').update(update_data).eq('id', item_id).execute()
        
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
def action_officer_delete(request, item_id):
    """
    Delete an action officer item
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Delete from Supabase
        response = supabase.table('action_officer').delete().eq('id', item_id).execute()
        
        return Response({
            'success': True,
            'message': 'Action officer item deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def action_officer_bulk_delete(request):
    """
    Delete multiple action officer items
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
        response = supabase.table('action_officer').delete().in_('id', ids).execute()
        
        return Response({
            'success': True,
            'message': f'{len(ids)} item(s) deleted successfully'
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
