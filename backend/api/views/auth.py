"""
Auth API: login and register using action_officer table.
Passwords are hashed with Django's PBKDF2; legacy plaintext passwords are accepted and re-hashed on login.
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password, is_password_usable
from ..supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)


def _row_to_user(row):
    """Map action_officer row to camelCase user for frontend."""
    if not row:
        return None
    return {
        'id': row.get('id'),
        'employeeCode': row.get('employee_code') or '',
        'lastName': row.get('last_name') or '',
        'firstName': row.get('first_name') or '',
        'middleName': row.get('middle_name') or '',
        'office': row.get('office') or '',
        'userLevel': row.get('user_level') or '',
        'officeRepresentative': row.get('office_representative') or '',
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login(request):
    """
    Login with employee code and password.
    Body: { "employeeCode": "...", "password": "..." }
    Returns: { "success": true, "user": { id, employeeCode, firstName, ... } }
    """
    try:
        employee_code = (request.data.get('employeeCode') or request.data.get('employee_code') or '').strip()
        password = request.data.get('password') or ''
        if not employee_code or not password:
            return Response(
                {'success': False, 'error': 'Employee code and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        supabase = get_supabase_admin_client()
        response = supabase.table('action_officer').select('*').eq('employee_code', employee_code).execute()
        if not response.data or len(response.data) == 0:
            return Response(
                {'success': False, 'error': 'Invalid employee code or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        row = response.data[0]
        stored_password = row.get('user_password') or ''
        if not stored_password:
            return Response(
                {'success': False, 'error': 'Invalid employee code or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # Prefer hashed check; support legacy plaintext
        if is_password_usable(stored_password):
            valid = check_password(password, stored_password)
        else:
            valid = stored_password == password
        if not valid:
            return Response(
                {'success': False, 'error': 'Invalid employee code or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # If was plaintext, re-hash and update so next time we use hashed
        if not is_password_usable(stored_password):
            try:
                supabase.table('action_officer').update({
                    'user_password': make_password(password)
                }).eq('id', row['id']).execute()
            except Exception as e:
                logger.warning("Failed to re-hash password for action_officer id=%s: %s", row.get('id'), e)
        user = _row_to_user(row)
        return Response({'success': True, 'user': user}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("auth_login failed")
        return Response(
            {'success': False, 'error': str(e) or 'Server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_register(request):
    """
    Register a new account (create action_officer).
    Body: { employeeCode, lastName, firstName, middleName, office?, userPassword, userLevel, officeRepresentative? }
    Password is hashed before storing.
    """
    try:
        data = request.data
        employee_code = (data.get('employeeCode') or data.get('employee_code') or '').strip()
        last_name = (data.get('lastName') or data.get('last_name') or '').strip()
        first_name = (data.get('firstName') or data.get('first_name') or '').strip()
        middle_name = (data.get('middleName') or data.get('middle_name') or '').strip()
        office = (data.get('office') or '').strip() or None
        user_password = data.get('userPassword') or data.get('user_password') or ''
        user_level = (data.get('userLevel') or data.get('user_level') or '').strip()
        office_representative = (data.get('officeRepresentative') or data.get('office_representative') or '').strip() or None

        if not employee_code:
            return Response({'success': False, 'error': 'Employee code is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not last_name:
            return Response({'success': False, 'error': 'Last name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not first_name:
            return Response({'success': False, 'error': 'First name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not middle_name:
            return Response({'success': False, 'error': 'Middle name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not user_password:
            return Response({'success': False, 'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not user_level:
            return Response({'success': False, 'error': 'User level is required'}, status=status.HTTP_400_BAD_REQUEST)

        supabase = get_supabase_admin_client()
        existing = supabase.table('action_officer').select('id').eq('employee_code', employee_code).execute()
        if existing.data and len(existing.data) > 0:
            return Response(
                {'success': False, 'error': 'An account with this employee code already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        hashed = make_password(user_password)
        payload = {
            'employee_code': employee_code,
            'last_name': last_name,
            'first_name': first_name,
            'middle_name': middle_name,
            'office': office,
            'user_password': hashed,
            'user_level': user_level,
            'office_representative': office_representative,
        }
        response = supabase.table('action_officer').insert(payload).execute()
        if not response.data or len(response.data) == 0:
            return Response({'success': False, 'error': 'Registration failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        user = _row_to_user(response.data[0])
        return Response({'success': True, 'user': user}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.exception("auth_register failed")
        return Response(
            {'success': False, 'error': str(e) or 'Server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
