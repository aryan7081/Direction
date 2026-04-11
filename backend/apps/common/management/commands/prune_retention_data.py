"""
Delete old ApiErrorLog and VisitorLog rows to control database growth.

Example (cron weekly):
  0 3 * * 0 cd /app && python manage.py prune_retention_data

Options use days; rows older than the cutoff are deleted.
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.common.models import ApiErrorLog, VisitorLog


class Command(BaseCommand):
    help = "Delete ApiErrorLog and VisitorLog rows older than retention windows."

    def add_arguments(self, parser):
        parser.add_argument(
            "--api-errors-days",
            type=int,
            default=90,
            help="Delete ApiErrorLog entries older than this many days (default 90).",
        )
        parser.add_argument(
            "--visitor-days",
            type=int,
            default=180,
            help="Delete VisitorLog entries older than this many days (default 180).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print counts only; do not delete.",
        )

    def handle(self, *args, **options):
        ae_days = max(1, options["api_errors_days"])
        v_days = max(1, options["visitor_days"])
        dry = options["dry_run"]
        now = timezone.now()
        ae_cut = now - timedelta(days=ae_days)
        v_cut = now - timedelta(days=v_days)

        ae_qs = ApiErrorLog.objects.filter(created_at__lt=ae_cut)
        v_qs = VisitorLog.objects.filter(created_at__lt=v_cut)
        ae_n = ae_qs.count()
        v_n = v_qs.count()

        self.stdout.write(
            f"ApiErrorLog older than {ae_days}d: {ae_n} rows; "
            f"VisitorLog older than {v_days}d: {v_n} rows."
        )
        if dry:
            self.stdout.write(self.style.WARNING("Dry run — no rows deleted."))
            return

        deleted_ae, _ = ae_qs.delete()
        deleted_v, _ = v_qs.delete()
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted ApiErrorLog cascade={deleted_ae}, VisitorLog cascade={deleted_v}."
            )
        )
