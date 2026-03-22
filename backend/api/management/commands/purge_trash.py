"""
Permanently delete Trash items older than TRASH_RETENTION_DAYS (default 30).

Schedule daily, e.g.:
  Windows Task Scheduler: python manage.py purge_trash
  Linux cron: 0 3 * * * cd /path/to/backend && python manage.py purge_trash

Options:
  --days N   Override retention (default from settings.TRASH_RETENTION_DAYS)
"""
from django.conf import settings
from django.core.management.base import BaseCommand

from api.trash_purge import purge_expired_trash_from_env


class Command(BaseCommand):
    help = 'Permanently delete soft-deleted documents in Trash older than TRASH_RETENTION_DAYS'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=None,
            help='Retention period in days (default: TRASH_RETENTION_DAYS from settings)',
        )

    def handle(self, *args, **options):
        days = options['days']
        if days is None:
            days = getattr(settings, 'TRASH_RETENTION_DAYS', 30)
        if days < 1:
            days = 30
        try:
            n = purge_expired_trash_from_env(days)
            self.stdout.write(self.style.SUCCESS(f'Purged {n} document(s) from Trash (older than {days} days).'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(str(e)))
            raise
