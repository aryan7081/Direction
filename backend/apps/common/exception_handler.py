"""
DRF exception handler: always return JSON for API errors; log unhandled exceptions.

429 Too Many Requests: adds Retry-After when DRF's Throttled exception provides wait().
"""

import logging

from rest_framework import status
from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None:
        if isinstance(exc, Throttled) and getattr(exc, "wait", None) is not None:
            response["Retry-After"] = str(max(1, int(exc.wait)))
        return response

    logger.exception("Unhandled exception in API view", exc_info=exc)

    request = context.get("request")
    if request is not None:
        from apps.common.error_recorder import record_api_error

        record_api_error(request, exc)

    return Response(
        {"detail": "An unexpected error occurred. Please try again later."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
