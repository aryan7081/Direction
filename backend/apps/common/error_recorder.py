"""
Persist unhandled API exceptions for staff review in Django admin.

Best-effort only — never raises; failures are logged once.
"""
from __future__ import annotations

import logging
import traceback
from typing import Any, Optional

logger = logging.getLogger(__name__)

_MAX_TRACEBACK = 50_000
_MAX_MESSAGE = 4_000
_MAX_PATH = 512


def _client_ip(request: Any) -> Optional[str]:
    meta = getattr(request, "META", {}) or {}
    xff = meta.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()[:45] or None
    addr = meta.get("REMOTE_ADDR")
    return (addr or "")[:45] or None


def record_api_error(request: Any, exc: BaseException) -> None:
    """Write one ApiErrorLog row. Swallows all errors."""
    try:
        from apps.common.models import ApiErrorLog

        tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
        if len(tb) > _MAX_TRACEBACK:
            tb = tb[:_MAX_TRACEBACK] + "\n...[truncated]"

        user = getattr(request, "user", None)
        uid = None
        if user is not None and getattr(user, "is_authenticated", False):
            uid = user.pk

        path = (getattr(request, "path", "") or "")[:_MAX_PATH]
        method = (getattr(request, "method", "") or "")[:16]

        ApiErrorLog.objects.create(
            user_id=uid,
            path=path or "/",
            method=method or "?",
            exception_class=type(exc).__name__[:255],
            message=(str(exc) or "")[:_MAX_MESSAGE],
            traceback_text=tb,
            client_ip=_client_ip(request),
        )
    except Exception:
        logger.exception("Failed to persist ApiErrorLog")
