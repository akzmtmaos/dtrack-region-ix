"""
Auth API: login and register using users table.
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
    """Map users/action_officer row to camelCase user for frontend."""
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


def _profile_to_user(profile_row):
    """Map profiles table row (Supabase Auth) to same user shape; profile has full_name not first/last."""
    if not profile_row:
        return None
    full_name = (profile_row.get('full_name') or '').strip()
    return {
        'id': profile_row.get('id'),
        'employeeCode': profile_row.get('employee_code') or '',
        'lastName': '',
        'firstName': full_name,
        'middleName': '',
        'office': profile_row.get('office') or '',
        'userLevel': profile_row.get('user_level') or '',
        'officeRepresentative': profile_row.get('office_representative') or '',
    }


def _check_password_and_return_user(supabase, row, password, table_name):
    """Validate password (hashed or legacy plaintext), re-hash if needed, return user dict or None."""
    stored_password = row.get('user_password') or ''
    if not stored_password:
        return None
    if is_password_usable(stored_password):
        valid = check_password(password, stored_password)
    else:
        valid = stored_password == password
    if not valid:
        return None
    # Require verified for users table; action_officer has no verified or is always allowed
    if table_name == 'users' and not row.get('verified', True):
        return 'pending_approval'
    if not is_password_usable(stored_password):
        try:
            supabase.table(table_name).update({
                'user_password': make_password(password)
            }).eq('id', row['id']).execute()
        except Exception as e:
            logger.warning("Failed to re-hash password for %s id=%s: %s", table_name, row.get('id'), e)
    return _row_to_user(row)


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login(request):
    """
    Login with employee code and password.
    Tries users table first, then profiles (Supabase Auth). action_officer is not used for login (reference table only).
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

        # 1) Try users table (new registered accounts)
        try:
            response = supabase.table('users').select('*').eq('employee_code', employee_code).execute()
            if response.data and len(response.data) > 0:
                row = response.data[0]
                result = _check_password_and_return_user(supabase, row, password, 'users')
                if result == 'pending_approval':
                    return Response(
                        {'success': False, 'error': 'Your account is pending approval. An administrator must verify your account before you can sign in.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                if result is not None:
                    return Response({'success': True, 'user': result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.warning("users table lookup failed (may not exist): %s", e)

        # 2) Fallback: profiles (Supabase Auth – password is in auth.users, not in profiles)
        try:
            profile_resp = supabase.table('profiles').select('*').eq('employee_code', employee_code).execute()
            if profile_resp.data and len(profile_resp.data) > 0:
                profile_row = profile_resp.data[0]
                email = (profile_row.get('email') or '').strip()
                if not email:
                    logger.warning("profiles row has no email for employee_code=%s", employee_code)
                else:
                    auth_resp = supabase.auth.sign_in_with_password({"email": email, "password": password})
                    if auth_resp and auth_resp.session:
                        user = _profile_to_user(profile_row)
                        if user:
                            return Response({'success': True, 'user': user}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.warning("profiles / Supabase Auth login failed: %s", e)

        return Response(
            {'success': False, 'error': 'Invalid employee code or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
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
    Register a new account (create user in users table).
    Body: { employeeCode, lastName, firstName, middleName, office?, userPassword, userLevel, officeRepresentative? }
    Password is hashed before storing. New users get verified=false until admin approves.
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
        existing = supabase.table('users').select('id').eq('employee_code', employee_code).execute()
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
            'verified': False,  # Admin must approve before user can log in
        }
        response = supabase.table('users').insert(payload).execute()
        if not response.data or len(response.data) == 0:
            return Response({'success': False, 'error': 'Registration failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        user_row = response.data[0]
        user_id = user_row.get('id')
        # Also write to user_profiles (registration / profile data) — use both users + profiles
        try:
            supabase.table('user_profiles').insert({
                'user_id': user_id,
                'first_name': first_name,
                'last_name': last_name,
                'middle_name': middle_name,
                'office': office,
                'user_level': user_level,
                'office_representative': office_representative,
            }).execute()
        except Exception as e:
            logger.warning("user_profiles insert failed (user created): %s", e)
        user = _row_to_user(user_row)
        return Response({'success': True, 'user': user}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.exception("auth_register failed")
        return Response(
            {'success': False, 'error': str(e) or 'Server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
