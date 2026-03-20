"""
Middleware for recording visitor IP addresses.
"""
from django.utils.deprecation import MiddlewareMixin

from .models import VisitorLog


def get_client_ip(request):
    """Extract client IP from request, handling proxies."""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


class VisitorTrackingMiddleware(MiddlewareMixin):
    """
    Records visitor IP address on each request.
    Skips admin, static, and docs to reduce noise.
    Throttles: same IP + path within 5 minutes = no new record.
    """

    SKIP_PREFIXES = ("/admin/", "/static/", "/api/docs/", "/favicon")

    def process_request(self, request):
        path = request.path
        if any(path.startswith(p) for p in self.SKIP_PREFIXES):
            return None

        ip = get_client_ip(request)
        if not ip:
            return None

        user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

        # Throttle: avoid duplicate records for same IP+path within 5 minutes
        from django.utils import timezone
        from datetime import timedelta

        cutoff = timezone.now() - timedelta(minutes=5)
        if VisitorLog.objects.filter(
            ip_address=ip, path=path, created_at__gte=cutoff
        ).exists():
            return None

        VisitorLog.objects.create(
            ip_address=ip,
            user_agent=user_agent,
            path=path,
        )
        return None
