"""
Create a reserved administrator account (Supabase Auth).
Run once to create your dev/admin account when you don't have app access.

Usage (from backend directory):
  python manage.py create_admin_user --email your@email.com --password YourSecurePassword

Optional:
  python manage.py create_admin_user --email admin@example.com --password secret \\
    --name "Admin User" --employee-code ADMIN001 --user-level Admin

Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.
The user is created in Supabase Auth; the profiles trigger will create their profile row.
"""
import argparse
from django.core.management.base import BaseCommand
from api.supabase_client import get_supabase_admin_client


class Command(BaseCommand):
    help = "Create a reserved administrator account in Supabase Auth (for developers / first-time setup)."

    def add_arguments(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument(
            "--email",
            type=str,
            required=True,
            help="Admin email (used to sign in).",
        )
        parser.add_argument(
            "--password",
            type=str,
            required=True,
            help="Admin password (min 6 characters).",
        )
        parser.add_argument(
            "--name",
            type=str,
            default="Administrator",
            help="Full name for the profile (default: Administrator).",
        )
        parser.add_argument(
            "--employee-code",
            type=str,
            default="ADMIN",
            help="Employee code for the profile (default: ADMIN).",
        )
        parser.add_argument(
            "--user-level",
            type=str,
            default="Admin",
            help="User level for the profile (default: Admin).",
        )
        parser.add_argument(
            "--office",
            type=str,
            default="",
            help="Office (optional).",
        )

    def handle(self, *args, **options) -> None:
        email = (options["email"] or "").strip()
        password = options["password"] or ""
        if not email:
            self.stderr.write(self.style.ERROR("--email is required."))
            return
        if len(password) < 6:
            self.stderr.write(self.style.ERROR("Password must be at least 6 characters."))
            return

        name = (options["name"] or "Administrator").strip()
        employee_code = (options["employee_code"] or "ADMIN").strip()
        user_level = (options["user_level"] or "Admin").strip()
        office = (options["office"] or "").strip()

        try:
            supabase = get_supabase_admin_client()
            resp = supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "full_name": name,
                    "employee_code": employee_code,
                    "user_level": user_level,
                    "office": office,
                    "office_representative": "",
                },
            })
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Failed to create user: {e}"))
            return

        # Check for API-level error in response (e.g. duplicate email)
        err = getattr(resp, "error", None) or (resp.get("error") if isinstance(resp, dict) else None)
        if err is not None:
            err_msg = getattr(err, "message", None) or (err.get("message") if isinstance(err, dict) else str(err))
            self.stderr.write(self.style.ERROR(f"Supabase returned an error: {err_msg}"))
            return

        # Response may be wrapped (e.g. .user or .model or direct)
        user = getattr(resp, "user", None) or getattr(resp, "model", None)
        if user is None and hasattr(resp, "__iter__") and hasattr(resp, "model_dump"):
            try:
                data = resp.model_dump() if callable(getattr(resp, "model_dump", None)) else {}
                user = data.get("user") or data
            except Exception:
                user = None

        if user is not None:
            uid = getattr(user, "id", None) or (user.get("id") if isinstance(user, dict) else None)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Admin account created successfully. Email: {email} (user id: {uid})."
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS(f"Admin account created for {email}."))

        self.stdout.write(
            "Sign in on the app Login page with this email and password.\n"
            "If login fails:\n"
            "  1. In frontend folder, create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY "
            "(same project as backend; get anon key from Supabase Dashboard → Project Settings → API).\n"
            "  2. In Supabase Dashboard → Authentication → Users, confirm the user exists and "
            "'Email confirmed' is true (edit user and confirm if needed)."
        )
