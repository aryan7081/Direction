from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from .permissions import IsAnalyticsViewer
from .service import build_dashboard_payload, parse_range


class AnalyticsDashboardView(GenericAPIView):
    """
    Full analytics dataset for the dashboard (single request).
    Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
    """

    permission_classes = [IsAnalyticsViewer]
    throttle_scope = "analytics_dashboard"

    def get(self, request):
        start, end, d_from, d_to = parse_range(request)
        data = build_dashboard_payload(start, end, d_from, d_to)
        return Response(data)


class AnalyticsHealthView(GenericAPIView):
    """Lightweight auth + permission check for the SPA."""

    permission_classes = [IsAnalyticsViewer]
    throttle_scope = "analytics_dashboard"

    def get(self, request):
        return Response({"ok": True, "email": request.user.email})
