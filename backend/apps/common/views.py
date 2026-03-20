"""
Common views (e.g. visitor tracking).
"""
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class VisitorTrackView(APIView):
    """
    Lightweight endpoint for frontend to call on page load.
    Middleware records the visitor IP when this request hits the server.
    No auth required.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"ok": True}, status=status.HTTP_200_OK)
