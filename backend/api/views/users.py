"""
API views for users table and profiles (registered accounts).
Registered Users page shows both: users table (app registrations) + profiles (Supabase Auth e.g. ADMIN).
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from ..supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)


def _users_row_to_item(row):
    """Map users table row to unified item (add source)."""
    if not row:
        return None
    return {
        **row,
        'source': 'users',
    }


def _profile_row_to_item(row):
    """Map profiles table row to same shape as users (full_name -> first_name), add source, verified=True."""
    if not row:
        return None
    return {
        'id': row.get('id'),
        'employee_code': row.get('employee_code') or '',
        'last_name': '',
        'first_name': row.get('full_name') or '',
        'middle_name': '',
        'office': row.get('office') or '',
        'user_level': row.get('user_level') or '',
        'office_representative': row.get('office_representative') or '',
        'verified': True,
        'source': 'profiles',
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def users_list(request):
    """List all registered users: from users table and from profiles (Supabase Auth)."""
    try:
        supabase = get_supabase_admin_client()
        combined = []

        # 1) Users table (app registrations)
        try:
            response = supabase.table('users').select('*').order('id', desc=False).execute()
            if response.data:
                for row in response.data:
                    item = _users_row_to_item(row)
                    if item:
                        combined.append(item)
        except Exception as e:
            logger.warning("users table list failed: %s", e)

        # 2) Profiles table (Supabase Auth – e.g. ADMIN)
        try:
            profile_resp = supabase.table('profiles').select('id, email, full_name, employee_code, office, user_level, office_representative').execute()
            if profile_resp.data:
                for row in profile_resp.data:
                    item = _profile_row_to_item(row)
                    if item:
                        combined.append(item)
        except Exception as e:
            logger.warning("profiles table list failed: %s", e)

        return Response({
            'success': True,
            'data': combined
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def users_update(request, item_id):
    """Update a user (e.g. set verified=true for approval)."""
    try:
        supabase = get_supabase_admin_client()
        update_data = {}

        if 'verified' in request.data:
            update_data['verified'] = bool(request.data.get('verified'))
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
        if 'userPassword' in request.data and request.data.get('userPassword'):
            update_data['user_password'] = make_password(request.data.get('userPassword'))
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

        response = supabase.table('users').update(update_data).eq('id', item_id).execute()

        if response.data:
            return Response({
                'success': True,
                'data': response.data[0] if isinstance(response.data, list) else response.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'error': 'User not found or update failed'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
